# 听雨轩主入口 Gate Audit

日期：2026-08-30  
空间 Source of Truth：`public/assets/fidelity/TYX_Master_Scene.glb`  
审计命令：`node scripts/assets/inspect-master-entry.mjs --gate-audit`

## 实测节点

- 节点：`A_ExpandedBoundary / TYX_MAIN_GATE_SOUTH`
- 几何子节点：`TYX_MAIN_GATE_SOUTH_GEO`
- Runtime root transform：translation `[-17.26, 6.767, -182.68]`，rotation Y `π/2`，scale `[0.64, 0.64, 0.64]`
- world quaternion：`[0, 0.707107, 0, 0.707107]`
- gate bounds min：`[5.78, 0, 36.2]`
- gate bounds max：`[12.82, 6.01, 42.6]`
- gate bounds center：`[9.3, 3.005, 39.4]`
- gate bounds size：`[7.04, 6.01, 6.4]`
- 门洞平面方向：runtime `-Z` / `+Z`
- 门洞 normal：runtime `+X` / `-X`

## 园内外判定

最终 Master 的单一允许 root transform 将 authored south normal 旋转为 runtime `+X`。当前 A→B 空间与后续 Route 从主门向 runtime `-X` 延伸，因此：

- 园外 normal：`[1, 0, 0]`
- 园内 normal：`[-1, 0, 0]`
- 门楼外立面 bounds 平面中心：`[12.82, 0.9, 39.4]`
- 门外 Spawn（外立面沿园外 normal 1.83m）：`[14.65, 0.9, 39.4]`
- 门内 A Entry（中心沿园内 normal 2.4m）：`[6.9, 0.9, 39.4]`
- Spawn yaw：`π/2`（约 `1.5708 rad`），第一人称 forward 为 runtime `-X`

`TYX_MAIN_GATE_SOUTH` 是约 7.04m 深的门楼体量；几何 bounds center 位于拱道内部，不能直接作为立面平面。实机第一轮在 center + 1.6m 处仍位于拱道内，故最终 Spawn 改为从园外 bounds face 实测退后 1.83m。`ROUTE_01_START` 与 `ROUTE_02_A_ENTRY` 已改为以上入口链，不再使用 `[11.5, 0.9, 52.2]` 与 `[6.5, 0.9, 45.8]` 的旧校准数据。

## Debug Layout

`?debugLayout=1` 当前显示：

- World Boundary：青色 wireframe；
- Architecture Collider：绿色 wireframe；
- Progression Lock：红色 wireframe；
- Memory Wall：紫色 wireframe；
- Spawn / Route anchors：白色与红色 marker；
- `ROUTE_01 → ROUTE_02`：黄色；
- 后续 Route：红色；
- Master 主门 bounds / center / inside normal；
- A/B/C 区域 bounds。

Debug 模式关闭雾效并固定俯视相机，避免普通 CameraRig 覆盖审计构图。

## 验收状态

- 主门节点、bounds、方向、园内外与入口 anchors：PASS。
- 地图/布局聚焦单测：PASS。
- 第一人称门前截图：`docs/development-records/01-first-person-main-gate.png`。
- A 区入口截图：`docs/development-records/02-enter-a-zone.png`。
- 实机遥测：Spawn `[14.65, 0.89, 39.40]`，Camera `[14.65, 1.63, 39.40]`，FOV `70`，玩家模型不可见，grounded，自动建筑 AABB 注入关闭。
- 实机行走：持续 W 约 2.9 秒可从门外进入 A 区开阔路径，未被 World Boundary / Architecture / Progression Lock 阻挡。
- 俯视截图：`docs/development-records/debug-topdown-colliders.png`。

Gate A：PASS。可以进入 Stage 4；在完成性能基准前不以降画质手段收口。
