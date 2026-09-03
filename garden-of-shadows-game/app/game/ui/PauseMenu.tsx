"use client";
/* eslint-disable @next/next/no-img-element -- local pause art has an intentional CSS fallback */

import { useState } from "react";
import type { GameSettings } from "../types";
import { UI_STORY_ASSETS } from "../runtime/ui-story-assets";

interface PauseMenuProps {
  onResume: () => void;
  onMap: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onExit: () => void;
}

export function PauseMenu({ onResume, onMap, onHelp, onSettings, onExit }: PauseMenuProps) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="system-panel-backdrop pause-backdrop">
      <section className="pause-menu" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        {!imageFailed && <img className="system-panel-art" src={UI_STORY_ASSETS.pausePanel} alt="" onError={() => setImageFailed(true)} />}
        <div className="system-panel-wash" aria-hidden="true" />
        <p className="eyebrow">INVESTIGATION PAUSED</p><h1 id="pause-title">雨还在下</h1>
        <nav><button type="button" className="primary-button" onClick={onResume}>继续调查</button><button type="button" onClick={onMap}>地图</button><button type="button" onClick={onHelp}>帮助</button><button type="button" onClick={onSettings}>设置</button><button type="button" className="danger-button" onClick={onExit}>返回案卷</button></nav>
        <small>按 Esc 继续。重新进入场景后，点击画面恢复鼠标观察。</small>
      </section>
    </div>
  );
}

interface RuntimeSettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
}

export function RuntimeSettingsPanel({ settings, onChange, onClose }: RuntimeSettingsPanelProps) {
  const toggle = (key: "subtitles" | "stableCamera" | "guidanceAssist") => onChange({ ...settings, [key]: !settings[key] });
  return (
    <div className="system-panel-backdrop">
      <section className="runtime-settings-panel" role="dialog" aria-modal="true" aria-labelledby="runtime-settings-title">
        <header><div><p className="eyebrow">显示与辅助</p><h1 id="runtime-settings-title">调查设置</h1></div><button type="button" className="panel-close" onClick={onClose}>×</button></header>
        <label htmlFor="runtime-guidance-assist" aria-label="辅助引导"><span><b>辅助引导</b><small>停留 20 秒后给方向，45 秒后补充提示，90 秒后显示调查位置</small></span><input id="runtime-guidance-assist" type="checkbox" checked={settings.guidanceAssist} onChange={() => toggle("guidanceAssist")} /></label>
        <label htmlFor="runtime-subtitles" aria-label="字幕"><span><b>字幕</b><small>显示环境对白与方向提示</small></span><input id="runtime-subtitles" type="checkbox" checked={settings.subtitles} onChange={() => toggle("subtitles")} /></label>
        <label htmlFor="runtime-stable-camera" aria-label="稳定镜头"><span><b>稳定镜头</b><small>增加第一人称镜头平滑</small></span><input id="runtime-stable-camera" type="checkbox" checked={settings.stableCamera} onChange={() => toggle("stableCamera")} /></label>
        <button type="button" className="primary-button" onClick={onClose}>返回暂停菜单</button>
      </section>
    </div>
  );
}
