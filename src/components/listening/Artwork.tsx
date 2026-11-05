"use client";

/**
 * Album art, or the nebula-gradient monogram tile when there's no cover or the
 * image fails to load, so the section never shows a broken image.
 */
import { useState } from "react";
import Image from "next/image";
import { display } from "@/lib/fonts";
import type { Track } from "@/lib/listening/types";

const MONOGRAM_SCALE = 0.38;

interface ArtworkProps {
  track: Pick<Track, "title" | "album" | "artworkUrl">;
  /** Rendered size in CSS px; Last.fm's largest cover is 300px. */
  size: number;
  className?: string;
}

export default function Artwork({ track, size, className = "" }: ArtworkProps): JSX.Element {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = track.artworkUrl && track.artworkUrl !== failedUrl ? track.artworkUrl : null;

  if (url) {
    return (
      <Image
        src={url}
        alt={track.album ? `${track.album} cover` : ""}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailedUrl(url)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${display.className} flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-nebula-purple),var(--color-nebula-teal))] uppercase text-[var(--color-silver)] ${className}`}
      style={{ fontSize: Math.round(size * MONOGRAM_SCALE) }}
    >
      {track.title.trim().charAt(0) || "·"}
    </span>
  );
}
