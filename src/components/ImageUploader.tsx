"use client";

import { useRef, useState } from "react";
import { ImageIcon, X, Loader2 } from "lucide-react";

const MAX_DIMENSION = 1920; // large side is capped so any-size uploads stay crisp but light

/** Resize any image so its longest side <= MAX_DIMENSION, preserving aspect ratio. */
function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        ctx.drawImage(img, 0, 0, width, height);
        // keep PNG transparency for logos/avatars, JPEG otherwise for smaller size
        const hasAlpha = file.type === "image/png" || file.type === "image/webp";
        resolve(canvas.toDataURL(hasAlpha ? "image/png" : "image/jpeg", 0.9));
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
  circle = false,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  circle?: boolean;
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
        <div
          className={`relative overflow-hidden border bg-slate-100 dark:bg-slate-800 ${
            circle ? "mx-auto h-28 w-28 rounded-full" : "rounded-xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className={
              circle
                ? "h-full w-full object-cover"
                : "max-h-80 w-full object-contain"
            }
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
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
          className={`grid w-full place-items-center gap-1 border-2 border-dashed text-center transition hover:border-brand-500 ${
            circle ? "mx-auto h-28 w-28 rounded-full" : "rounded-xl py-10"
          }`}
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted" />
          )}
          {!circle && (
            <>
              <span className="text-sm font-semibold">Click to upload image</span>
              <span className="text-xs text-muted">or drag and drop</span>
              <span className="text-xs text-muted">
                Any size · JPG / PNG / WebP
              </span>
            </>
          )}
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
      {!circle && (
        <p className="mt-1 text-[11px] text-muted">
          {label} · any size accepted, shown clearly.
        </p>
      )}
    </div>
  );
}
