# 听雨轩 Master Scene → First Walkable 执行记录

## 当前范围

本记录对应 P0 + P0.5。`TingYuXuan_Master.blend` 是空间事实，`TingYuXuan_Master.glb` 是正式 Runtime 输入。本阶段不重写剧情，也不对 Master 内部建筑做二次定位。

## 已落地的 Runtime 规则

- 唯一正式资产 ID：`tyx-master-scene`。
- 默认视觉根：`master-scene`，只加载 `TYX_Master_Scene.glb`。
- **2026-08-30 尺度校准后唯一根变换**：位置 `[-17.26, 6.767, -182.68]`、Y 轴旋转 `90°`、统一缩放 `0.64`。早期 `0.2` 仅是缩略导入尺度，已禁止继续作为 Runtime 世界尺度。
- 新根变换以 `TYX_MAIN_GATE_SOUTH` 为固定基准，将门中心保持在 Gameplay `(9.3, 39.4)` 附近；子建筑 Transform 保持 GLB 原值。实测门洞约 `2.155m`、园墙约 `2.946m`。
- `?legacyArchitecture=1` 仅用于短期旧两模型回滚；默认路径不再加载旧 Siheyuan + Courtyard Park 拼装。
- `?fallbackArchitecture=1` 仍是显式 Greybox 调试开关，不属于正式视觉。
- Blender 中本来隐藏的备份、源件和旧边界节点在 Runtime 仅关闭可见性，不改变正式节点 Transform。

## First Walkable Gameplay Layer

- 临时 Spawn 继续使用 `west-entry`，以便从最终模型连接入口开始向核心区域行走。
- 第一版碰撞只保留大地面与四侧空气墙，目标是“不掉出世界、可持续走图”；旧回廊、房屋、池岸和假山坐标碰撞已退出默认布局。
- `CameraRig` 使用 Rapier 射线收短第三人称镜头，`PhysicsController` 提供 Grounded 状态。
- 使用 `?debugGameplay=1` 打开 HUD：Master/Legacy 模式、Player XYZ、FPS、区域 ID、Grounded。

## 旧 `tingyuxuan-layout` 分类

- KEEP：三层 Runtime 根、认知/记忆层、程序氛围系统。
- REMAP：Spawn、Trigger、Evidence、Audio、Checkpoint、Collider、Zone。
- DEPRECATE：旧正式建筑 placement；仅保留在 legacy rollback 集合。
- UNKNOWN：西院、北楼等章节空间名，等待 P2 实际走图后确认。

## 验收边界

自动门禁负责确认 Master 资产、默认加载路径、粗碰撞和工程构建。连续行走 5 分钟、穿模点和实际区域命名仍需浏览器人工走图记录后才能把 P0.5 标记为完成。

## 2026-08-30 自动验收结果

- `npm run typecheck`：通过。
- `npm run lint`：全工程通过；`NorthTowerRuntime.tsx` / `MissingRoomRuntime.tsx` 的 React 19 ref 初始化与 render 期间 ref 读取问题已修复。
- `npm test`：16 个测试文件、67/67 通过。
- `npm run build`：通过；构建前内容验证 47/47 通过。
- `npm run visual:capture` + `npm run visual:verify`：正式视角 5/5；每个视角均为 `architectureMode=master`、仅加载 `tyx-master-scene`、`grounded=true`，无 fallback 和 fatal error。
- Master Runtime 文件：99,122,896 bytes；SHA-256 `51b3fdb236393909973bcec6db62c39e0a4c59947e8edeecd6b626b50f1b321a`。
- WebGL2 自动截图实测约 19–45 FPS。接入与路线结果正确，但真实目标设备性能仍需单独 profile；无头截图数字不作为自动美术验收替代。

## Gameplay Map V1 接管状态（2026-08-30）

最终俯视路线已经进入 Runtime 数据层，不再以旧 `west-entry / west-courtyard / north-tower` 坐标作为空间事实：

- `ROUTE_01_START`：左下入口 / 默认 Spawn。
- `ROUTE_02_A_ENTRY`：进入 A 区。
- `ROUTE_03_A_LOOP`：A 区循环调查核心点。
- `ROUTE_04_A_EAST_EXIT`：A 区东侧出口。
- `ROUTE_05_B_MAIN_COURT`：B 区主院。
- `ROUTE_06_B_NORTHEAST_LINK`：B 区北东连接通道。
- `ROUTE_07_C_ENTRY`：C 区深园入口；第一轮只开放到此。

Runtime 已具备三层 Ground Patch、A/B/C 区域调试框、路线标记、第一轮空气墙 / progression lock。兼容旧存档的历史 Anchor ID 只复制新 Gameplay Anchor 的 `position/yaw`，不再维护第二套坐标。

新增 `npm run visual:audit-map` 作为 Gameplay Map V1 的自动验收入口。该审计：

1. 对 ROUTE_01～07 七个关键点逐点截图；
2. 从 ROUTE_01 使用真实 `PhysicsController` / Rapier 连续移动到 ROUTE_07；
3. 记录每一个抵达里程碑的坐标、区域、Grounded、最近 Route Anchor 和累计耗时；
4. 任一里程碑落地失败、进入错误区域、20 秒无进展、顺序缺失或终点不是 `AREA_C / ROUTE_07_C_ENTRY` 时直接失败；
5. 完成截图打开 `debugLayout=1`，用于同时检查区域框、路线与空气墙。

静态测试同时新增主路线对 `boundary / area-wall / progression-lock` 的最小玩家净空校验，防止后续调整空气墙时无意把 ROUTE_01～07 封死。

## 下一 Gate

`npm run visual:audit-map` 已通过：7 个锚点截图完成，真实 PhysicsController 连续路线在 31.1 秒内抵达 `ROUTE_07_C_ENTRY`，且 `loopTeleport=true`、`exitHandoff=true`。

下一步只保留真实人工连续走图。人工走图仍按 `[BLOCK]`、`[CLIP]`、`[FALL]`、`[CAM]`、`[SCALE]`、`[GOOD]`、`[DEAD]` 记录，因为自动路线只能证明设计主轴可通，不能替代玩家对实际建筑、转角、视觉遮挡和可探索支路的判断。完整结果见 `docs/development-records/v3-runtime-closure-2026-08-30.md`。
