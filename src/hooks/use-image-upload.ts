"use client";

import { useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5_242_880; // 5MB

export interface UseImageUploadResult {
  imageUrl: string | null;
  uploading: boolean;
  error: string | null;
  handleFileSelect: (file: File) => Promise<void>;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      setError("ไฟล์ต้องเป็น jpeg, png หรือ webp เท่านั้น");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Upload failed");
      }

      const data = await res.json() as {
        mock: boolean;
        presignedUrl: string | null;
        objectUrl: string | null;
        key: string | null;
      };

      if (data.mock) {
        setImageUrl(URL.createObjectURL(file));
      } else {
        await fetch(data.presignedUrl!, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        setImageUrl(data.objectUrl!);
      }
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setImageUrl(null);
    setUploading(false);
    setError(null);
  }

  return { imageUrl, uploading, error, handleFileSelect, reset };
}
