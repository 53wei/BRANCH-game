"use client";
/* eslint-disable @next/next/no-img-element -- local help art has an intentional CSS fallback */

import { useState } from "react";
import { CONTROL_GUIDE_GROUPS, CORE_PLAY_RULE } from "../runtime/guidance-config";
import { UI_STORY_ASSETS } from "../runtime/ui-story-assets";

interface HelpPanelProps {
  chapterTitle: string;
  onTutorial: () => void;
  onClose: () => void;
}

export function HelpPanel({ chapterTitle, onTutorial, onClose }: HelpPanelProps) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="system-panel-backdrop">
      <section className="help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title">
        {!imageFailed && <img className="system-panel-art" src={UI_STORY_ASSETS.helpPanel} alt="" onError={() => setImageFailed(true)} />}
        <div className="system-panel-wash" aria-hidden="true" />
        <header><div><p className="eyebrow">FIELD MANUAL · {chapterTitle}</p><h1 id="help-title">调查帮助</h1></div><button type="button" className="panel-close" onClick={onClose}>×</button></header>
        <blockquote>{CORE_PLAY_RULE}</blockquote>
        <div className="help-grid">
          {CONTROL_GUIDE_GROUPS.map((group) => <article key={group.id}><h2>{group.title}</h2>{group.bindings.map((binding) => <p key={binding.keys}><kbd>{binding.keys}</kbd><span>{binding.action}</span></p>)}</article>)}
          <article><h2>卡住时</h2><p>先看左上当前任务，再看右上小地图的淡金目标。</p><p>地图给方向，证词记录保留比较结果，现场痕迹负责约束两份记忆。</p><p>20 秒无进展会显示距离；45 秒后会给一句方向提示。</p></article>
        </div>
        <footer><button type="button" className="text-button" onClick={onTutorial}>重新显示开场教程</button><button type="button" className="primary-button" onClick={onClose}>返回调查</button></footer>
      </section>
    </div>
  );
}
