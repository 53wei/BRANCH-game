"use client";
/* eslint-disable @next/next/no-img-element -- local map art has an intentional CSS fallback */

import { useState } from "react";
import { discoveredMapRoute, FULL_MAP_BOUNDS, MAP_ASSETS, MAP_REGIONS, MAP_REGION_LABELS, mapPointToPercent, worldPoseToMapPose } from "../runtime/map-config";
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
  const player = worldPoseToMapPose(pose, FULL_MAP_BOUNDS);
  const targetPoint = target ? mapPointToPercent(target, FULL_MAP_BOUNDS) : undefined;
  const route = discoveredMapRoute(openRegions).map((point) => mapPointToPercent(point.position, FULL_MAP_BOUNDS)).map((point) => `${point.left},${point.top}`).join(" ");

  return (
    <div className="system-panel-backdrop full-map-backdrop">
      <section className="full-map-panel" role="dialog" aria-modal="true" aria-labelledby="full-map-title">
        <header>
          <div><p className="eyebrow">听雨轩 · 手绘园图</p><h1 id="full-map-title">园中地图</h1></div>
          <div className="full-map-location"><span>现在</span><strong>{MAP_REGION_LABELS[regionId]}</strong></div>
          <button type="button" className="panel-close" onClick={onClose} aria-label="关闭地图">×</button>
        </header>
        <div className="full-map-layout">
          <figure className="full-map-sheet">
          <div className="map-surface full-map-surface" aria-label="听雨轩已知区域、当前位置与当前调查位置">
            {!imageFailed && <img src={MAP_ASSETS.fullMap} alt="听雨轩俯视园图" onError={() => setImageFailed(true)} />}
            <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={route} /></svg>
            {MAP_REGIONS.map((region) => {
              const center = mapPointToPercent(region.center, FULL_MAP_BOUNDS);
              const locked = !openRegions.includes(region.id);
              const width = region.halfExtents.x * 2 / (FULL_MAP_BOUNDS.maxX - FULL_MAP_BOUNDS.minX) * 100;
              const height = region.halfExtents.z * 2 / (FULL_MAP_BOUNDS.maxZ - FULL_MAP_BOUNDS.minZ) * 100;
              return <span key={region.id} className={`map-region ${region.id === regionId ? "current" : ""}${locked ? " locked" : ""}`} style={{ left: `${center.left}%`, top: `${center.top}%`, width: `${width}%`, height: `${height}%` }}><small>{locked ? "尚未绘入" : region.label}</small></span>;
            })}
            {targetPoint && <span className={`map-target full-map-target${target?.approximate ? " approximate" : ""}`} style={{ left: `${targetPoint.left}%`, top: `${targetPoint.top}%`, "--target-radius": `${Math.max(20, (target?.radius ?? 0) * 6)}px` } as React.CSSProperties}><i /><em>{target?.approximate ? "在这一带查找" : target?.label}</em></span>}
            <span className="map-player full-map-player" style={{ left: `${player.left}%`, top: `${player.top}%`, transform: `translate(-50%, -50%) rotate(${player.rotationDegrees}deg)`, "--map-player-rotation": `${player.rotationDegrees}deg` } as React.CSSProperties}><i>你在这里</i></span>
            <span className="map-north"><i />北</span>
            <div className="full-map-legend" aria-hidden="true"><span><i className="player" />当前位置</span>{target && <span><i className="target" />调查位置</span>}<span><i className="route" />已走路线</span></div>
          </div>
          <figcaption className="full-map-brief">
            <span>正在调查</span><strong>{objective}</strong>
            {target && <p>{target.approximate ? `先在${target.label}附近寻找可见痕迹。` : `往${target.label}继续。`}</p>}
          </figcaption>
          </figure>
        </div>
        <footer><span>未走到的区域不会标出内部地点。</span><b><kbd>M</kbd> 或 <kbd>Esc</kbd> 收起园图</b></footer>
      </section>
    </div>
  );
}
