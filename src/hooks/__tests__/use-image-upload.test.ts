// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "../use-image-upload";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = vi.fn();

function makeFile(name = "photo.jpg", type = "image/jpeg", size = 1024) {
  return new File(["x".repeat(size)], name, { type });
}

beforeEach(() => {
  mockFetch.mockReset();
  mockCreateObjectURL.mockClear();
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

  it("handleFileSelect sets blob preview immediately — no fetch", () => {
    const { result } = renderHook(() => useImageUpload());
    const file = makeFile();
    act(() => { result.current.handleFileSelect(file); });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.imageUrl).toBe("blob:mock-url");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("upload() with no file selected returns null without fetching", async () => {
    const { result } = renderHook(() => useImageUpload());
    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });
    expect(returned).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mock mode: upload() calls presign and returns blob URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mock: true, presignedUrl: null, objectUrl: null, key: null }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile();
    act(() => { result.current.handleFileSelect(file); });

    let returned: string | null = null;
    await act(async () => { returned = await result.current.upload(); });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/upload/presign",
      expect.objectContaining({ method: "POST" })
    );
    expect(returned).toBe("blob:mock-url");
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

    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });

    expect(returned).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("reset clears all state and prevents upload", async () => {
    const { result } = renderHook(() => useImageUpload());
    act(() => { result.current.handleFileSelect(makeFile()); });
    expect(result.current.imageUrl).toBe("blob:mock-url");

    act(() => { result.current.reset(); });
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();

    // upload after reset should do nothing
    let returned: string | null = "sentinel";
    await act(async () => { returned = await result.current.upload(); });
    expect(returned).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
