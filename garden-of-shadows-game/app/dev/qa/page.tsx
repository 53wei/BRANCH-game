"use client";

import { resetGardenSave, SAVE_KEY } from "../../game/campaign-save";
import { QA_CHAPTERS, QA_CHAPTER_QUERY, QA_FIRST_RUN_QUERY, QA_START_KEY } from "../../game/qa-session";

export default function QaEntryPage() {
  if (process.env.NODE_ENV !== "development") {
    return <main style={{ padding: 32 }}><h1>开发 QA 入口不可用</h1><p>该页面只在开发环境启用。</p></main>;
  }

  const startFreshRun = () => {
    resetGardenSave();
    window.sessionStorage.setItem(QA_START_KEY, new Date().toISOString());
    window.location.href = `/?${QA_FIRST_RUN_QUERY}=1`;
  };

  const storedRunStartedAt = typeof window === "undefined" ? null : window.sessionStorage.getItem(QA_START_KEY);

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 64px", fontFamily: "system-ui, sans-serif" }}>
      <p style={{ opacity: 0.7 }}>DEV ONLY · 不进入正式玩家 UI</p>
      <h1>《游园惊梦》首次流程与章节 Smoke QA</h1>
      <p>正式存档键：<code>{SAVE_KEY}</code>。章节 Smoke 使用隔离内存存档，不写回正式 localStorage。</p>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid currentColor" }}>
        <h2>真正的第一次玩家状态</h2>
        <p>一键删除本游戏正式存档、恢复默认教程状态并直接进入序章。适用于 TASK-004 / TASK-024 首次体验回归。</p>
        <button type="button" onClick={startFreshRun}>清空正式存档并开始首次流程</button>
        {storedRunStartedAt && <p><small>最近一次 QA 开始：{new Date(storedRunStartedAt).toLocaleString()}</small></p>}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>隔离章节 Smoke</h2>
        <p>以下入口不会覆盖正式玩家存档；用于快速验证 Runtime 启动、资产加载、碰撞和剧情绑定。</p>
        <ul style={{ lineHeight: 2 }}>
          {QA_CHAPTERS.map(([id, label]) => <li key={id}><a href={`/?${QA_CHAPTER_QUERY}=${id}`}>{label}</a></li>)}
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>记录要求</h2>
        <p>每次首次流程至少记录：开始时间、到达首个可自由移动节点的耗时、首次卡住位置、是否出现教程、是否出现剧情/碰撞/地图异常。记录模板见 <code>docs/qa/first-run-qa.md</code>。</p>
      </section>
    </main>
  );
}
