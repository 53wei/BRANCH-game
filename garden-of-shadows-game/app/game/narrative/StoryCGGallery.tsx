"use client";
/* eslint-disable @next/next/no-img-element -- local CG thumbnails reuse the release originals without a server optimizer */

import { useState } from "react";
import type { CampaignSave } from "../types";
import { STORY_CGS, type StoryCGEntry } from "./story-cg";
import { StoryCGViewer } from "./StoryCGViewer";

const unlockChapterForCG: Record<string, string> = {
  "rain-return": "prologue-rain",
  "family-portrait": "prologue-rain",
  "liusheng-fifth-figure": "north-tower-ledger",
  "child-room": "missing-room",
  "water-pavilion-argument": "you-did-not-return",
  "wooden-steps-accident": "you-did-not-return",
  "erasure-montage": "you-did-not-return",
  "fifth-garden-departure": "fifth-tingyuxuan",
};

export function StoryCGGallery({ save, onClose }: { save: CampaignSave; onClose: () => void }) {
  const [selected, setSelected] = useState<StoryCGEntry>();
  if (selected) return <StoryCGViewer entry={selected} eyebrow="剧情回顾" continueLabel="返回画廊" onContinue={() => setSelected(undefined)} onSkip={() => setSelected(undefined)} />;

  return (
    <div className="page-modal-backdrop">
      <section className="settings-panel cg-gallery" role="dialog" aria-modal="true" aria-label="剧情回顾">
        <button type="button" className="panel-close" onClick={onClose}>×</button>
        <p className="eyebrow">STORY GALLERY</p>
        <h2>剧情回顾</h2>
        <p>只显示已经完成章节中的关键画面。回顾不会改动存档。</p>
        <div className="cg-gallery-grid">
          {STORY_CGS.map((entry, index) => {
            const unlocked = save.completedChapters.includes(unlockChapterForCG[entry.id]);
            return (
              <button type="button" key={entry.id} disabled={!unlocked} onClick={() => setSelected(entry)}>
                {unlocked ? <img src={entry.path} alt="" /> : <span aria-hidden="true">?</span>}
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{unlocked ? entry.title : "尚未解锁"}</strong>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
