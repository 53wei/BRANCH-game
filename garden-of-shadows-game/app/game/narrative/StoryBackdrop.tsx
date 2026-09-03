"use client";
/* eslint-disable @next/next/no-img-element -- story backdrops are pre-sized local WebP game assets */

import { useState } from "react";
import { resolveStoryBackdrop, type StoryBackdropId } from "./story-backdrops";

interface StoryBackdropProps {
  id?: StoryBackdropId;
  className?: string;
  label?: string;
}

/**
 * A non-blocking cinematic layer. If an asset has not been produced yet (or a
 * deployment misses it), the element removes itself and the live 3D scene stays
 * visible underneath.
 */
export function StoryBackdrop({ id, className = "", label = "剧情场景" }: StoryBackdropProps) {
  const src = resolveStoryBackdrop(id);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return null;

  return (
    <div className={`story-backdrop ${className}`.trim()} aria-label={label}>
      <img src={src} alt="" onError={() => setFailedSrc(src)} />
      <div className="story-backdrop-rain" aria-hidden="true" />
      <div className="story-backdrop-vignette" aria-hidden="true" />
    </div>
  );
}
