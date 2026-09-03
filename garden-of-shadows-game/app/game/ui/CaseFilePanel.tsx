"use client";

import { useMemo, useState } from "react";
import type { CheckpointState } from "../types";
import { campaignManifest } from "../manifests/campaign";
import {
  discoveredCaseEvidence,
  evidenceChannelLabel,
  isQuestionResolved,
  type CaseFileTab,
  unlockedCasePeople,
  unlockedCaseQuestions,
} from "../runtime/case-file-content";

interface CaseFilePanelProps {
  checkpoint: CheckpointState;
  completedChapters: readonly string[];
  chapterTitle: string;
  onClose: () => void;
  onOpenMap?: () => void;
}

const tabs: readonly { id: CaseFileTab; label: string }[] = [
  { id: "evidence", label: "证物" },
  { id: "people", label: "人物" },
  { id: "questions", label: "问题" },
  { id: "map", label: "地图" },
  { id: "review", label: "回顾" },
];

export function CaseFilePanel({ checkpoint, completedChapters, chapterTitle, onClose, onOpenMap }: CaseFilePanelProps) {
  const [tab, setTab] = useState<CaseFileTab>("evidence");
  const evidence = useMemo(() => discoveredCaseEvidence(checkpoint), [checkpoint]);
  const people = useMemo(() => unlockedCasePeople(checkpoint), [checkpoint]);
  const questions = useMemo(() => unlockedCaseQuestions(checkpoint), [checkpoint]);
  const completed = useMemo(() => new Set(completedChapters), [completedChapters]);

  return (
    <div className="system-panel-backdrop case-file-backdrop">
      <section className="case-file-panel" role="dialog" aria-modal="true" aria-labelledby="case-file-title">
        <header className="case-file-header">
          <div>
            <p className="eyebrow">听雨轩案卷</p>
            <h1 id="case-file-title">案卷</h1>
            <p>{chapterTitle}</p>
          </div>
          <button type="button" className="panel-close" onClick={onClose} aria-label="关闭案卷">×</button>
        </header>

        <nav className="case-file-tabs" aria-label="案卷分类">
          {tabs.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              {item.label}
              {item.id === "evidence" && <small>{evidence.length}</small>}
              {item.id === "questions" && <small>{questions.length}</small>}
            </button>
          ))}
        </nav>

        <div className="case-file-body">
          {tab === "evidence" && (
            <section className="case-file-list" aria-label="已记录证物">
              {evidence.length === 0 && <EmptyState title="还没有可归档的现场事实" body="继续调查。案卷只记录你已经实际观察到的内容。" />}
              {evidence.map((item) => (
                <article className="case-file-evidence" key={item.id}>
                  <div className="case-file-evidence-head">
                    <span>{evidenceChannelLabel(item.channel)}</span>
                    <div><h2>{item.title}</h2><small>{item.source.location ?? item.source.label}</small></div>
                  </div>
                  <ul>{item.observableFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
                  {item.relatedCharacters && item.relatedCharacters.length > 0 && <p className="case-file-meta"><b>关联人物</b>{item.relatedCharacters.join(" · ")}</p>}
                  {item.protagonistReaction && <p className="case-file-reaction">赵映：{item.protagonistReaction}</p>}
                </article>
              ))}
            </section>
          )}

          {tab === "people" && (
            <section className="case-file-grid" aria-label="人物记录">
              {people.map((person) => <article key={person.id}><span>{person.role}</span><h2>{person.name}</h2><p>{person.note}</p></article>)}
            </section>
          )}

          {tab === "questions" && (
            <section className="case-file-questions" aria-label="未解问题">
              {questions.length === 0 && <EmptyState title="问题还没有形成" body="先观察异常，再让问题从事实中出现。" />}
              {questions.map((question, index) => {
                const resolved = isQuestionResolved(question, checkpoint);
                return (
                  <article key={question.id} className={resolved ? "resolved" : "open"}>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <div><span>{resolved ? "已核清" : "待核清"}</span><h2>{question.question}</h2>{resolved && question.resolvedText && <p>{question.resolvedText}</p>}</div>
                  </article>
                );
              })}
            </section>
          )}

          {tab === "map" && (
            <section className="case-file-map-entry">
              <p className="eyebrow">园中位置</p>
              <h2>已知的园中位置</h2>
              <p>这里只标出已经走过或确认过的空间、当前位置和当前调查范围；未发现的证物不会提前出现。</p>
              {onOpenMap ? <button type="button" className="primary-button" onClick={onOpenMap}>展开园中地图</button> : <p className="case-file-muted">当前段落没有可用的三维地图。</p>}
            </section>
          )}

          {tab === "review" && (
            <section className="case-file-review" aria-label="章节回顾">
              {campaignManifest.chapters.map((chapter) => {
                const isCurrent = checkpoint.chapterId === chapter.id;
                const isComplete = completed.has(chapter.id);
                const available = isComplete || isCurrent || chapter.index === 0;
                return (
                  <article key={chapter.id} className={`${isComplete ? "complete" : ""}${isCurrent ? " current" : ""}${available ? "" : " locked"}`}>
                    <span>{chapter.index === 0 ? "序章" : chapter.index === 6 ? "终章" : `第${chapter.index}章`}</span>
                    <h2>{chapter.title.replace(/^.+?·/, "")}</h2>
                    <p>{available ? chapter.logline : "尚未进入这一段调查。"}</p>
                    <small>{isComplete ? "已完成" : isCurrent ? "正在调查" : "未解锁"}</small>
                  </article>
                );
              })}
            </section>
          )}
        </div>

        <footer className="case-file-footer"><kbd>N</kbd> 或 <kbd>Esc</kbd> 关闭案卷</footer>
      </section>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="case-file-empty"><strong>{title}</strong><p>{body}</p></div>;
}
