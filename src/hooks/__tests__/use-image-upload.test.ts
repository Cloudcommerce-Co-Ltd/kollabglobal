// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useImageUpload } from "../use-image-upload";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// FileReader stub: constructor returns an instance whose readAsDataURL
// synchronously fires onload with a deterministic base64 result.
const DATA_URL = "data:image/jpeg;base64,AAAA";
const mockReadAsDataURL = vi.fn();

class MockFileReader {
  onload: ((e: ProgressEvent) => void) | null = null;
  onerror: ((e: ProgressEvent) => void) | null = null;
  result: string = DATA_URL;

  readAsDataURL(file: File) {
    mockReadAsDataURL(file);
    // Fire onload synchronously so the Promise in fileToDataUrl resolves immediately.
    if (this.onload) this.onload({} as ProgressEvent);
  }
}

vi.stubGlobal("FileReader", MockFileReader);

function makeFile(name = "photo.jpg", type = "image/jpeg", size = 1024) {
  return new File(["x".repeat(size)], name, { type });
}

beforeEach(() => {
  mockFetch.mockReset();
  mockReadAsDataURL.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useImageUpload", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handleFileSelect rejects invalid content type — no fetch", () => {
    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile("photo.gif", "image/gif")); });
    expect(result.current.error).toMatch(/ประเภทไฟล์|jpeg|png|webp/i);
    expect(result.current.imageUrl).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handleFileSelect rejects files larger than 5MB — no fetch", () => {
    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile("big.jpg", "image/jpeg", 5_242_881)); });
    expect(result.current.error).toMatch(/5MB/i);
    expect(result.current.imageUrl).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handleFileSelect converts file to base64 data URL — no fetch", async () => {
    const { result } = renderHook(() => useImageUpload());
    const file = makeFile();
    act(() => { result.current.handleFileSelect(file); });
    await waitFor(() => expect(result.current.imageUrl).toBe("data:image/jpeg;base64,AAAA"));
    expect(mockReadAsDataURL).toHaveBeenCalledWith(file);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("upload() with no file and no initial URL returns null without fetching", async () => {
    const { result } = renderHook(() => useImageUpload());
    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });
    expect(returned).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mock mode: upload() calls presign and returns the data URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mock: true, presignedUrl: null, objectUrl: null, key: null }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile();
    act(() => { result.current.handleFileSelect(file); });
    await waitFor(() => expect(result.current.imageUrl).not.toBeNull());

    let returned: string | null = null;
    await act(async () => { returned = await result.current.upload(); });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/upload/presign",
      expect.objectContaining({ method: "POST" })
    );
    expect(returned).toBe("data:image/jpeg;base64,AAAA");
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("real S3 mode: upload() PUTs to presigned URL and returns objectUrl", async () => {
    const objectUrl = "https://s3.example.com/products/abc.jpg";
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          mock: false,
          presignedUrl: "https://s3.example.com/presign/abc",
          objectUrl,
          key: "products/abc.jpg",
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.png", "image/png", 2048);
    act(() => { result.current.handleFileSelect(file); });
    await waitFor(() => expect(result.current.imageUrl).not.toBeNull());

    let returned: string | null = null;
    await act(async () => { returned = await result.current.upload(); });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://s3.example.com/presign/abc",
      expect.objectContaining({ method: "PUT", body: file })
    );
    expect(returned).toBe(objectUrl);
    expect(result.current.error).toBeNull();
  });

  it("upload() handles presign network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile()); });
    await waitFor(() => expect(result.current.imageUrl).not.toBeNull());

    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });

    expect(returned).toBeNull();
    expect(result.current.error).toMatch(/upload/i);
    expect(result.current.uploading).toBe(false);
  });

  it("upload() handles non-ok presign response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    });

    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile()); });
    await waitFor(() => expect(result.current.imageUrl).not.toBeNull());

    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });

    expect(returned).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("reset clears all state and prevents upload", async () => {
    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile()); });
    await waitFor(() => expect(result.current.imageUrl).toBe("data:image/jpeg;base64,AAAA"));

    act(() => { result.current.reset(); });
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();

    // upload after reset returns null (no file, no initial URL)
    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });
    expect(returned).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("initialUrl is shown as preview without selecting a new file", () => {
    const { result } = renderHook(() => useImageUpload("https://example.com/stored.jpg"));
    expect(result.current.imageUrl).toBe("https://example.com/stored.jpg");
  });
});
