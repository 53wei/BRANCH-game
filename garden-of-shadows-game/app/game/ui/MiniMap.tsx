"use client";
/* eslint-disable @next/next/no-img-element -- local map art has an intentional CSS fallback */

import { useState } from "react";
import { A_ZONE_MAP_BOUNDS, MAP_ASSETS, MAP_REGION_LABELS, MAP_ROUTE, mapPointToPercent, worldPoseToMapPose } from "../runtime/map-config";
import type { GameplayRegionId } from "../runtime/tingyuxuan-gameplay-map";

export interface RuntimeMapPose {
  x: number;
  z: number;
  yaw: number;
}

export interface RuntimeMapTarget {
  x: number;
  z: number;
  label: string;
  radius?: number;
  approximate?: boolean;
}

interface MiniMapProps {
  pose: RuntimeMapPose;
  regionId: GameplayRegionId;
  target?: RuntimeMapTarget;
  subdued?: boolean;
  onOpen: () => void;
}

export function MiniMap({ pose, regionId, target, subdued = false, onOpen }: MiniMapProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const player = worldPoseToMapPose(pose, A_ZONE_MAP_BOUNDS);
  const targetPoint = target ? mapPointToPercent(target, A_ZONE_MAP_BOUNDS) : undefined;
  const route = MAP_ROUTE.filter((point) => point.regionId === "AREA_A")
    .map((point) => mapPointToPercent(point.position, A_ZONE_MAP_BOUNDS))
    .map((point) => `${point.left},${point.top}`)
    .join(" ");

  return (
    <aside className={`mini-map${subdued ? " subdued" : ""}`} aria-label="旧园入口小地图">
      <button type="button" className="map-surface mini-map-surface" onClick={onOpen} aria-label="按 M 打开完整地图">
        {!imageFailed && <img src={MAP_ASSETS.miniMapA} alt="" onError={() => setImageFailed(true)} />}
        <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={route} /></svg>
        {targetPoint && <span className={`map-target${target?.approximate ? " approximate" : ""}`} style={{ left: `${targetPoint.left}%`, top: `${targetPoint.top}%`, "--target-radius": `${Math.max(16, (target?.radius ?? 0) * 8)}px` } as React.CSSProperties}><i /></span>}
        <span className="map-player" style={{ left: `${player.left}%`, top: `${player.top}%`, transform: `translate(-50%, -50%) rotate(${player.rotationDegrees}deg)` }} />
        <span className="map-north">北</span>
      </button>
      <div><strong>{MAP_REGION_LABELS[regionId]}</strong><span>{target ? target.label : "自由调查"}</span></div>
      <button type="button" className="mini-map-key" onClick={onOpen}><kbd>M</kbd> 地图</button>
    </aside>
  );
}
