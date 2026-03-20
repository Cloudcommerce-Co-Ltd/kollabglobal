"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5_242_880; // 5MB

export interface UseImageUploadResult {
  imageUrl: string | null;    // blob URL for preview only
  uploading: boolean;
  error: string | null;
  handleFileSelect: (file: File) => void; // sync — just validates + shows preview
  upload: () => Promise<string | null>;   // async — PUTs to S3, returns stored URL
  reset: () => void;
}

export function useImageUpload(): UseImageUploadResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  function handleFileSelect(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      const msg = "ประเภทไฟล์ไม่รองรับ";
      setError(msg);
      toast.error(msg, { description: "กรุณาเลือกไฟล์ jpeg, png หรือ webp เท่านั้น" });
      return;
    }

    if (file.size > MAX_SIZE) {
      const msg = "ขนาดไฟล์ต้องไม่เกิน 5MB";
      setError(msg);
      toast.error(msg, { description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB" });
      return;
    }

    fileRef.current = file;
    setImageUrl(URL.createObjectURL(file));
  }

  async function upload(): Promise<string | null> {
    const file = fileRef.current;
    if (!file) return null;

    setUploading(true);
    setError(null);
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
        return imageUrl; // blob URL is fine for mock
      }

      await fetch(data.presignedUrl!, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      return data.objectUrl!;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Upload failed: ${msg}`);
      toast.error("อัปโหลดไม่สำเร็จ", { description: msg });
      return null;
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    fileRef.current = null;
    setImageUrl(null);
    setUploading(false);
    setError(null);
  }

  return { imageUrl, uploading, error, handleFileSelect, upload, reset };
}
