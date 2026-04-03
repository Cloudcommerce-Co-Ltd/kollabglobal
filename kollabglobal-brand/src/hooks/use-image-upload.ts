"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5_242_880; // 5MB

export interface UseImageUploadResult {
  imageUrl: string | null;    // data URL (base64) for preview — survives sessionStorage
  uploading: boolean;
  error: string | null;
  handleFileSelect: (file: File) => void; // validates + converts to base64 for preview
  upload: () => Promise<string | null>;   // PUTs to S3, returns permanent URL
  reset: () => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useImageUpload(initialUrl?: string): UseImageUploadResult {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  // When the initial URL changes (e.g. restored from session store after hydration),
  // sync it into local state so the preview shows without requiring user interaction.
  useEffect(() => {
    if (initialUrl && !fileRef.current) {
      setImageUrl(initialUrl);
    }
  }, [initialUrl]);

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

    // Convert to base64 data URL so the preview survives sessionStorage serialization.
    fileToDataUrl(file).then((dataUrl) => {
      setImageUrl(dataUrl);
    }).catch(() => {
      setError("ไม่สามารถอ่านไฟล์ได้");
    });
  }

  async function upload(): Promise<string | null> {
    const file = fileRef.current;
    // No new file selected — return the existing URL (already persisted from store)
    if (!file) return imageUrl;

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
        // Mock mode: return the base64 data URL (persists in sessionStorage)
        return imageUrl;
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
