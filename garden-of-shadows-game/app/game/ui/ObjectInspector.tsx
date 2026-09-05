"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import type { ObjectInspectionController, ObjectInspectionSnapshot } from "../mechanics/ObjectInspectionController";

interface ObjectInspectorProps {
  controller: ObjectInspectionController;
  contextLabel: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ObjectInspector({ controller, contextLabel, confirmLabel = "收入案卷", onConfirm }: ObjectInspectorProps) {
  const [view, setView] = useState<ObjectInspectionSnapshot>(() => controller.snapshot());
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | undefined>(undefined);
  const refresh = () => setView(controller.snapshot());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Equal", "Minus", "Enter"].includes(event.code)) event.preventDefault();
      if (event.code === "ArrowLeft") setView(controller.rotate(-0.12, 0) ?? controller.snapshot());
      if (event.code === "ArrowRight") setView(controller.rotate(0.12, 0) ?? controller.snapshot());
      if (event.code === "ArrowUp") setView(controller.rotate(0, -0.1) ?? controller.snapshot());
      if (event.code === "ArrowDown") setView(controller.rotate(0, 0.1) ?? controller.snapshot());
      if (event.code === "Equal") setView(controller.zoomBy(0.08) ?? controller.snapshot());
      if (event.code === "Minus") setView(controller.zoomBy(-0.08) ?? controller.snapshot());
      if (event.code === "Enter" && view.activeHotspot) {
        controller.observeActiveHotspot();
        setView(controller.snapshot());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controller, view.activeHotspot]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    setView(controller.rotate(dx * 0.012, dy * 0.01) ?? controller.snapshot());
  };
  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = undefined;
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setView(controller.zoomBy(-event.deltaY * 0.001) ?? controller.snapshot());
  };
  const observedFacts = view.hotspots.filter((hotspot) => view.observedHotspotIds.includes(hotspot.id));

  return <section className="object-inspector-overlay" role="dialog" aria-modal="true" aria-label={`检视${view.title}`}>
    <header className="object-inspector-heading"><span>{contextLabel}</span><h2>{view.title}</h2></header>
    <div
      className="object-inspector-viewport"
      aria-label="拖动物件以旋转，滚轮缩放"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onWheel={onWheel}
    >
      <span className="object-inspector-reticle" aria-hidden="true" />
      {view.activeHotspot && <button type="button" className="object-inspector-hotspot" onClick={(event) => {
        event.stopPropagation();
        controller.observeActiveHotspot();
        refresh();
      }}>查看细节 · {view.activeHotspot.label}</button>}
    </div>
    <aside className="object-inspector-facts" aria-live="polite">
      <span>观察记录</span>
      {observedFacts.length === 0 ? <p>慢慢转动物件，细节正对视线时再查看。</p> : observedFacts.map((hotspot) => <p key={hotspot.id}><strong>{hotspot.label}</strong>{hotspot.fact}</p>)}
    </aside>
    <footer className="object-inspector-controls">
      <span>拖动 / 方向键旋转</span><span>滚轮 / ＋－缩放</span>
      <button type="button" className="primary-button" disabled={!view.complete} onClick={onConfirm}>{view.complete ? confirmLabel : `还有 ${view.hotspots.length - view.observedHotspotIds.length} 处细节`}</button>
    </footer>
  </section>;
}
