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
  const file = new File(["x".repeat(size)], name, { type });
  return file;
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

  it("rejects files with invalid content type", async () => {
    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.gif", "image/gif", 1024);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.error).toMatch(/jpeg|png|webp/i);
    expect(result.current.imageUrl).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5MB", async () => {
    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("big.jpg", "image/jpeg", 5_242_881);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.error).toMatch(/5MB/i);
    expect(result.current.imageUrl).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mock mode: calls presign, uses blob URL as preview", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mock: true, presignedUrl: null, objectUrl: null, key: null }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.jpg", "image/jpeg", 1024);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/upload/presign",
      expect.objectContaining({ method: "POST" })
    );
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.imageUrl).toBe("blob:mock-url");
    expect(result.current.error).toBeNull();
    expect(result.current.uploading).toBe(false);
  });

  it("real S3 mode: calls presign then PUTs file, returns objectUrl", async () => {
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

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://s3.example.com/presign/abc",
      expect.objectContaining({ method: "PUT", body: file })
    );
    expect(result.current.imageUrl).toBe(objectUrl);
    expect(result.current.error).toBeNull();
  });

  it("handles presign network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.jpg", "image/jpeg", 1024);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.error).toMatch(/upload/i);
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.uploading).toBe(false);
  });

  it("handles presign non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.jpg", "image/jpeg", 1024);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.imageUrl).toBeNull();
  });

  it("reset clears all state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mock: true, presignedUrl: null, objectUrl: null, key: null }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = makeFile("photo.jpg", "image/jpeg", 1024);

    await act(async () => {
      await result.current.handleFileSelect(file);
    });

    expect(result.current.imageUrl).toBe("blob:mock-url");

    act(() => {
      result.current.reset();
    });

    expect(result.current.imageUrl).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
