"use client";

function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function VideoEmbed({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  const yt = youtubeId(url);

  if (yt) {
    return (
      <iframe
        className={`aspect-video w-full rounded-2xl ${className}`}
        src={`https://www.youtube.com/embed/${yt}`}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <video
      controls
      preload="metadata"
      className={`aspect-video w-full rounded-2xl bg-black ${className}`}
    >
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
}
