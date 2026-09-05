"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DocumentKind = "ledger" | "record" | "letter" | "note";

export interface DocumentRow {
  id: string;
  left?: string;
  text: string;
  right?: string;
  struck?: boolean;
  abraded?: boolean;
  annotation?: string;
  emphasis?: boolean;
}

export interface DocumentPage {
  id: string;
  heading?: string;
  subheading?: string;
  rows: readonly DocumentRow[];
  footer?: string;
}

export interface DocumentDefinition {
  id: string;
  kind: DocumentKind;
  title: string;
  subtitle?: string;
  owner?: string;
  date?: string;
  pages: readonly DocumentPage[];
}

interface DocumentViewerProps {
  document: DocumentDefinition;
  onClose: () => void;
  closeLabel?: string;
  contextLabel?: string;
  onPageTurn?: () => void;
}

export function DocumentViewer({
  document,
  onClose,
  closeLabel = "收起并记入案卷",
  contextLabel = "手中旧件",
  onPageTurn,
}: DocumentViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const page = document.pages[pageIndex];

  const turnTo = useCallback((nextIndex: number) => {
    const clamped = Math.max(0, Math.min(document.pages.length - 1, nextIndex));
    if (clamped === pageIndex) return;
    setPageIndex(clamped);
    setZoom(1);
    stageRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    onPageTurn?.();
  }, [document.pages.length, onPageTurn, pageIndex]);
  const previousPage = useCallback(() => turnTo(pageIndex - 1), [pageIndex, turnTo]);
  const nextPage = useCallback(() => turnTo(pageIndex + 1), [pageIndex, turnTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.code === "ArrowLeft" || event.code === "PageUp") { event.preventDefault(); previousPage(); return; }
      if (event.code === "ArrowRight" || event.code === "PageDown") { event.preventDefault(); nextPage(); return; }
      if (event.code === "Equal" || event.code === "NumpadAdd") { event.preventDefault(); setZoom((value) => Math.min(1.28, value + 0.08)); return; }
      if (event.code === "Minus" || event.code === "NumpadSubtract") { event.preventDefault(); setZoom((value) => Math.max(0.82, value - 0.08)); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextPage, onClose, previousPage]);

  return (
    <div className="document-viewer-backdrop" role="dialog" aria-modal="true" aria-labelledby={`document-title-${document.id}`}>
      <section className={`document-viewer document-${document.kind}`}>
        <header className="document-viewer-header">
          <div>
            <p className="eyebrow">{contextLabel}</p>
            <h1 id={`document-title-${document.id}`}>{document.title}</h1>
            {document.subtitle && <p>{document.subtitle}</p>}
          </div>
          <button type="button" className="panel-close" onClick={onClose} aria-label="关闭文书">×</button>
        </header>

        <div className="document-workspace">
          <aside className="document-meta">
            <span>类型</span><strong>{kindLabel(document.kind)}</strong>
            {document.owner && <><span>归属</span><strong>{document.owner}</strong></>}
            {document.date && <><span>日期</span><strong>{document.date}</strong></>}
            <span>页码</span><strong>{pageIndex + 1} / {document.pages.length}</strong>
            <div className="document-zoom-controls">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.82, value - 0.08))}>－</button>
              <b>{Math.round(zoom * 100)}%</b>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.28, value + 0.08))}>＋</button>
            </div>
          </aside>

          <div ref={stageRef} className="document-paper-stage">
            <article className="document-paper" data-page-id={page.id} style={{ transform: `scale(${zoom})` }}>
              <div className="document-binding" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="document-paper-inner">
                <span className="document-folio-mark" aria-hidden="true">{String(pageIndex + 1).padStart(2, "0")}</span>
                {page.heading && <h2>{page.heading}</h2>}
                {page.subheading && <p className="document-subheading">{page.subheading}</p>}
                <div className="document-rows">
                  {page.rows.map((row) => (
                    <div key={row.id} className={`document-row${row.struck ? " struck" : ""}${row.abraded ? " abraded" : ""}${row.emphasis ? " emphasis" : ""}`}>
                      <span>{row.left ?? ""}</span>
                      <p>{row.text}{row.annotation && <i>{row.annotation}</i>}</p>
                      <b>{row.right ?? ""}</b>
                    </div>
                  ))}
                </div>
                {page.footer && <p className="document-page-footer">{page.footer}</p>}
              </div>
            </article>
          </div>
        </div>

        <footer className="document-viewer-footer">
          <div>
            <button type="button" className="ghost-button" disabled={pageIndex === 0} onClick={previousPage}>上一页</button>
            <button type="button" className="ghost-button" disabled={pageIndex === document.pages.length - 1} onClick={nextPage}>下一页</button>
          </div>
          <div className="document-page-position" aria-label={`第 ${pageIndex + 1} 页，共 ${document.pages.length} 页`}>
            {document.pages.map((item, index) => <i key={item.id} className={index === pageIndex ? "active" : ""} />)}
            <small>方向键翻页 · + / − 缩放</small>
          </div>
          <button type="button" className="primary-button" onClick={onClose}>{closeLabel}</button>
        </footer>
      </section>
    </div>
  );
}

const kindLabel = (kind: DocumentKind) => ({
  ledger: "簿册",
  record: "记录",
  letter: "信件",
  note: "便笺",
})[kind];
