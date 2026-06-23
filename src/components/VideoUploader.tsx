"use client";

import { useRef, useState } from "react";
import { Video, X, Loader2, Link2 } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";

const MAX_BYTES = 60 * 1024 * 1024; // 60MB cap for uploaded files; use a link for anything larger

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function VideoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        "Video is larger than 60MB. Compress it or paste a YouTube/MP4 link below."
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      onChange(await readAsDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read video");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border bg-black">
          <VideoEmbed url={value} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
            aria-label="Remove video"
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
          className="grid w-full place-items-center gap-1 rounded-xl border-2 border-dashed py-10 text-center transition hover:border-brand-500"
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
          ) : (
            <Video className="h-7 w-7 text-muted" />
          )}
          <span className="text-sm font-semibold">Click to upload video</span>
          <span className="text-xs text-muted">or drag and drop · MP4 / WebM / MOV</span>
          <span className="text-xs text-muted">Up to 60MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-2 rounded-xl border px-3 focus-within:border-brand-500">
        <Link2 className="h-4 w-4 text-muted" />
        <input
          className="h-11 flex-1 bg-transparent text-sm outline-none"
          placeholder="…or paste a video link (YouTube / MP4)"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
