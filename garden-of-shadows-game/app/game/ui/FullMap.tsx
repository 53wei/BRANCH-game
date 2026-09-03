"use client";
/* eslint-disable @next/next/no-img-element -- local map art has an intentional CSS fallback */

import { useState } from "react";
import { FULL_MAP_BOUNDS, MAP_ASSETS, MAP_REGIONS, MAP_REGION_LABELS, MAP_ROUTE, mapPointToPercent, worldYawToMapDegrees } from "../runtime/map-config";
import type { GameplayRegionId } from "../runtime/tingyuxuan-gameplay-map";
import type { RuntimeMapPose, RuntimeMapTarget } from "./MiniMap";

interface FullMapProps {
  pose: RuntimeMapPose;
  regionId: GameplayRegionId;
  target?: RuntimeMapTarget;
  objective: string;
  openRegions: readonly GameplayRegionId[];
  onClose: () => void;
}

export function FullMap({ pose, regionId, target, objective, openRegions, onClose }: FullMapProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const player = mapPointToPercent(pose, FULL_MAP_BOUNDS);
  const targetPoint = target ? mapPointToPercent(target, FULL_MAP_BOUNDS) : undefined;
  const route = MAP_ROUTE.map((point) => mapPointToPercent(point.position, FULL_MAP_BOUNDS)).map((point) => `${point.left},${point.top}`).join(" ");

  return (
    <div className="system-panel-backdrop full-map-backdrop">
      <section className="full-map-panel" role="dialog" aria-modal="true" aria-labelledby="full-map-title">
        <header><div><p className="eyebrow">听雨轩</p><h1 id="full-map-title">园中地图</h1></div><button type="button" className="panel-close" onClick={onClose} aria-label="关闭地图">×</button></header>
        <div className="full-map-layout">
          <div className="map-surface full-map-surface">
            {!imageFailed && <img src={MAP_ASSETS.fullMap} alt="" onError={() => setImageFailed(true)} />}
            <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={route} /></svg>
            {MAP_REGIONS.map((region) => {
              const center = mapPointToPercent(region.center, FULL_MAP_BOUNDS);
              const locked = !openRegions.includes(region.id);
              return <span key={region.id} className={`map-region ${region.id === regionId ? "current" : ""}${locked ? " locked" : ""}`} style={{ left: `${center.left}%`, top: `${center.top}%` }}><small>{locked ? "尚未走到" : region.label}</small></span>;
            })}
            {targetPoint && <span className={`map-target${target?.approximate ? " approximate" : ""}`} style={{ left: `${targetPoint.left}%`, top: `${targetPoint.top}%`, "--target-radius": `${Math.max(20, (target?.radius ?? 0) * 6)}px` } as React.CSSProperties}><i /></span>}
            <span className="map-player" style={{ left: `${player.left}%`, top: `${player.top}%`, transform: `translate(-50%, -50%) rotate(${worldYawToMapDegrees(pose.yaw)}deg)` }} />
            <span className="map-north">北</span>
          </div>
          <aside className="full-map-brief">
            <span>当前位置</span><strong>{MAP_REGION_LABELS[regionId]}</strong>
            <span>当前任务</span><p>{objective}</p>
            {target && <><span>{target.approximate ? "搜索范围" : "目标"}</span><p>{target.label}</p></>}
            <small>地图只标方向与调查范围，不会直接揭示全部证物答案。</small>
          </aside>
        </div>
        <footer><kbd>M</kbd> 或 <kbd>Esc</kbd> 关闭</footer>
      </section>
    </div>
  );
}
