"use client";
/* eslint-disable @next/next/no-img-element -- local tutorial art has an intentional CSS fallback */

import { useState } from "react";
import { CONTROL_GUIDE_GROUPS, CORE_PLAY_RULE, INVESTIGATION_PRINCIPLES } from "../runtime/guidance-config";
import { UI_STORY_ASSETS } from "../runtime/ui-story-assets";

interface TutorialGuideProps {
  onStart: (dontShowAgain: boolean) => void;
}

export function TutorialGuide({ onStart }: TutorialGuideProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="system-panel-backdrop tutorial-guide-backdrop">
      <section className="tutorial-guide" role="dialog" aria-modal="true" aria-labelledby="tutorial-guide-title">
        {!imageFailed && <img className="system-panel-art" src={UI_STORY_ASSETS.tutorialControls} alt="" onError={() => setImageFailed(true)} />}
        <div className="system-panel-wash" aria-hidden="true" />
        <header>
          <p className="eyebrow">BEFORE ENTERING TING YU XUAN</p>
          <h1 id="tutorial-guide-title">调查须知</h1>
          <p>进入听雨轩前，先记住你能相信的操作。至于你能不能相信自己的记忆——进去以后再说。</p>
        </header>
        <div className="tutorial-guide-grid">
          <div className="tutorial-bindings">
            {CONTROL_GUIDE_GROUPS.map((group) => <article key={group.id}>
              <h2>{group.title}</h2>
              {group.bindings.map((binding) => <div key={binding.keys}><kbd>{binding.keys}</kbd><span>{binding.action}</span></div>)}
            </article>)}
          </div>
          <aside className="tutorial-principles">
            <span>调查原则</span>
            <ol>{INVESTIGATION_PRINCIPLES.map((principle) => <li key={principle}>{principle}</li>)}</ol>
            <blockquote>{CORE_PLAY_RULE}</blockquote>
          </aside>
        </div>
        <footer>
          <label><input type="checkbox" checked={dontShowAgain} onChange={(event) => setDontShowAgain(event.target.checked)} />不再自动显示</label>
          <button type="button" className="primary-button" onClick={() => onStart(dontShowAgain)}>开始调查</button>
        </footer>
      </section>
    </div>
  );
}
