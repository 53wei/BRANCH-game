# Runtime 世界尺度与镜头校准 Gate（2026-08-30）

## 当前 Gate

暂停 ROUTE_01～07 后续路线截图、章节推进和新的剧情落地。当前只允许处理：世界尺度、人物尺度、Physics、Camera、与尺度直接相关的 Gameplay Anchor/Collider 验证。三张比例图未通过人工视觉检查前，不进入下一阶段。

## P0 世界尺度：已锁定的实测基准

Master Scene 不再使用早期缩略导入 `0.2` 作为 Runtime 世界尺度。当前唯一根变换：

- position: `[-17.26, 6.767, -182.68]`
- rotationY: `Math.PI / 2`
- scale: `[0.64, 0.64, 0.64]`
- source scale: `0.2`
- runtime scale: `0.64`
- scale factor: `3.2`

建筑实测换算：

- character height: `1.693 m`
- wall height: `2.946 m`
- door clear height: `2.155 m`
- gate threshold height: `0.090 m`

校准来源：`MOD_A_WallGate_10m` 清洞高约 `3.3674` authored units，`MOD_A_WallStraight_16m` 高约 `4.6034` authored units；乘以 `0.64` 后分别约为 `2.155m` 和 `2.946m`。固定基准为 `TYX_MAIN_GATE_SOUTH`，Runtime 门中心维持在 `(9.3, 39.4)` 附近。

禁止通过把人物缩成 0.5 倍来掩盖建筑比例错误。后续任何 Master 根尺度变化都必须同步更新 Gameplay Map、Collider、Anchor，并重新完成本 Gate。

## P1 人物代理

物理角色仍按成年人体量（capsule `1.74m`）计算，但根据 2026-08-30 实机截图反馈，临时可见代理不再承担“真实人体标尺”职责：`PlayerAvatar` 视觉缩放到约 `1.43m`，老周代理同步缩小到约 `1.4m`。这是为了避免临时代理长期占据画面，不改变 Physics 尺度，也不代表最终人物美术尺寸。

临时角色继续使用低反差深色人形轮廓；老周以实体灯笼发光体 + 暖色点光源作为视觉识别重点。正式人物资产接入时重新恢复真实成人视觉尺度。

## P2 CameraRig

探索镜头统一为近肩第三人称：

- FOV: `65°`
- camera/player horizontal distance: 默认 boom `2.55m`，用距离换取更多前方视野
- shoulder offset: `0.44m`
- look target: capsule centre 上方 `0.22m`
- camera lift: `0.18m`，镜头实际高度约 `1.08m`
- look-ahead: `0.90m`
- exploration pitch clamp: `-0.48 .. 0.42 rad`
- investigation eye offset: `0.58m`

CameraRig 的相机位置现在从玩家位置计算，而不是从前方 look-ahead target 再向后延长，因此不会把实际玩家到镜头的距离无意拉回 3m 以上。`GameRuntime`、`PrologueRuntime`、`NorthTowerRuntime`、`MissingRoomRuntime` 均取消各自 3m 级旧距离覆盖，回归同一套校准值。

## P3 Physics / Gameplay 一致性

玩家物理基准集中在 `PLAYER_PHYSICS_CALIBRATION`：

- gravity: `-9.81 m/s²`
- capsule: half-height `0.55m`, radius `0.32m`, total height `1.74m`
- autostep max height: `0.28m`
- autostep min width: `0.18m`
- snap-to-ground: `0.22m`
- walk speed: `2.55m/s`
- fast walk speed: `4.0m/s`
- vertical ground probe speed: `2.2m/s`

Interaction 同样按米制统一：标准证据 `2.35m`、序章近距证据 `2.15m`、NPC `2.40m`、特殊观察点 `2.80m`；代理命中球标准半径 `0.72m`、NPC `0.78m`。这些值集中在 `INTERACTION_RANGE_CALIBRATION`，章节 Runtime 不再各自散落硬编码距离。

Gameplay Map V1 的 ROUTE、Ground、Air Wall、progression lock、Evidence Anchor 继续以米制世界坐标为事实来源；不再维护一套按照 `0.2` 缩略场景手工补偿的坐标。

## P4 三张强制验收图

`npm run visual:audit-prologue-spawn` 已改为只生成本 Gate 需要的三张图：

1. `scale-wall-character.png`：人物站在园墙/主门边界建筑旁，检查 1.693m 人物与 2.946m 园墙比例。
2. `scale-door-character.png`：人物站在主门洞附近，检查 2.155m 门洞相对人物头顶的净空。
3. `gameplay-shoulder-camera.png`：正常 ROUTE_01 探索镜头，检查前方道路、门洞、园墙和 NPC 的可读性，以及人物是否处于近肩构图而非高位俯视。

自动截图同时记录并校验：`characterHeight / wallHeight / doorHeight / masterScaleFactor / cameraFov / cameraPose`。任何一项漂移直接失败。

## 当前验证状态

代码与验收脚本已经落地，但**本轮不能宣称 Gate 已通过**。CodexPro 的本地 Bash runner 当前在启动命令前失败：WSL 报 `execvpe(/bin/bash) failed: No such file or directory`。因此本轮修改后的 `npm test`、`npm run typecheck` 和三张新截图尚未实际执行。

恢复本地 shell 后必须按顺序执行：

1. `npm test -- app/game/mechanics/CameraRig.test.ts app/game/runtime/PlayerAvatar.test.ts app/game/runtime/tingyuxuan-layout.test.ts app/game/runtime/tingyuxuan-gameplay-map.test.ts`
2. `npm run typecheck`
3. `npm run visual:audit-prologue-spawn`
4. 人工打开三张图逐张验收比例和构图。

只有第 4 步通过，才允许恢复路线截图和后续章节开发。
