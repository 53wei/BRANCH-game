"use client";
/* eslint-disable @next/next/no-img-element -- full-bleed authored CG files are loaded directly from the local release bundle */

import { useEffect } from "react";
import type { StoryCGEntry } from "./story-cg";

interface StoryCGViewerProps {
  entry: StoryCGEntry;
  eyebrow?: string;
  speaker?: string;
  text?: string;
  continueLabel?: string;
  onContinue: () => void;
  onSkip?: () => void;
}

export function StoryCGViewer({
  entry,
  eyebrow = "剧情画面",
  speaker,
  text,
  continueLabel = "继续",
  onContinue,
  onSkip,
}: StoryCGViewerProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onSkip) onSkip();
      if ((event.key === "Enter" || event.key === " ") && event.target === document.body) {
        event.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onContinue, onSkip]);

  return (
    <section className="story-cg-viewer" role="dialog" aria-modal="true" aria-label={entry.title}>
      <img src={entry.path} alt={entry.alt} />
      <div className="story-cg-shade" aria-hidden="true" />
      <header>
        <span>{eyebrow}</span>
        <strong>{entry.title}</strong>
      </header>
      {(speaker || text) && (
        <div className="story-cg-caption">
          {speaker && <b>{speaker}</b>}
          {text && <p>{text}</p>}
        </div>
      )}
      <footer>
        {onSkip && <button type="button" className="text-button" onClick={onSkip}>关闭</button>}
        <button type="button" className="primary-button" onClick={onContinue}>{continueLabel}</button>
      </footer>
    </section>
  );
}
