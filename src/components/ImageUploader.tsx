"use client";

import { useRef, useState } from "react";
import { ImageIcon, X, Loader2 } from "lucide-react";

const TARGET = 1080; // every image/video is enforced to 1080 x 1080

/** Center-crop + resize any image to a 1080x1080 JPEG data URL. */
function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = TARGET;
        canvas.height = TARGET;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        // cover: scale so the shorter side fills 1080, then center-crop
        const scale = Math.max(TARGET / img.width, TARGET / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (TARGET - w) / 2, (TARGET - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({
  value,
  onChange,
  label = "Featured Image",
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onChange(await processImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="aspect-square w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            1080 × 1080
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="grid w-full place-items-center gap-1 rounded-xl border-2 border-dashed py-10 text-center transition hover:border-brand-500"
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted" />
          )}
          <span className="text-sm font-semibold">Click to upload image</span>
          <span className="text-xs text-muted">or drag and drop</span>
          <span className="text-xs text-muted">
            Auto-cropped to 1080 × 1080 · JPG/PNG
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-[11px] text-muted">{label} must be square (1080×1080).</p>
    </div>
  );
}
