# Wave 2｜TASK-018～022 工程收口记录

更新时间：2026-09-04

> 执行纪律：先按 TASK 文档回顾目标与 DoD，再核查当前 Runtime；保留正确实现，只补真实缺口。当前 ChatGPT→CodexPro 命令执行仍被 WSL `/bin/bash` 缺失阻塞，因此本轮新增代码以静态/结构审计闭环，npm/typecheck/浏览器重跑统一标记 `VERIFY-DEFERRED`，不虚报通过。

## TASK-018｜门洞、栏杆、台阶与特殊通行结构

工程状态：`DONE / VERIFY-DEFERRED`

- `app/game/runtime/special-structure-collision.ts` 以复合 Box 保持正门/月洞门净空，并从最终 Master 节点 `214b32a0.o` 提取 C 区木阶/栏杆静态 trimesh。
- `app/game/runtime/architecture-collision-runtime.ts` 将特殊结构与普通建筑碰撞统一注册到六个正式 3D Runtime。
- `app/game/runtime/special-structure-collision.test.ts` 覆盖正门双向通过、门槛 autostep、月洞门双向通过、证词锁、序章门锁、trimesh 注册和栏杆/跳跃高度关系。
- `scripts/visual/capture-regression.mjs` 已修复专项审计覆盖 `phase-one-acceptance.json` 的问题：`--special-structures` 与 `--master-nodes` 现在只写各自 metrics，不污染正式 phase-one acceptance。
- 历史 `special-structure-captures/capture-metrics.json` 仍含旧节点 `20b9b240.o`，不得作为当前最终证据；较新的 `phase-one-acceptance.json` 已出现 `214b32a0.o` 与 8 个 required box。当前版本专项浏览器重跑留待本地 Windows runner。

## TASK-019｜标准移动、跑步与跳跃

工程状态：`DONE / VERIFY-DEFERRED`

- `app/game/runtime/player-calibration.ts` 新增 `PLAYER_MOVEMENT_CALIBRATION`，统一 gravity / walk / fast-walk / jump。
- 正式 `PhysicsController` 与 dev `PlayerPhysics` 共用同一 movement calibration；`PlayerPhysics` 不再保留独立假重力/速度体系。
- `PlayerPhysics` 新增 grounded-only `requestJump()`、垂直速度、落地归零；Mechanics Playground 的 Space、Shift、WASD 已消费同一套参数。
- 六个正式 3D Runtime 已有 Space→`PhysicsController.requestJump()`，正式 Physics 继续负责 grounded、autostep、snap、slope。
- 新增 `app/game/mechanics/PlayerPhysics.test.ts`；正式路线已有 `tingyuxuan-layout.test.ts` grounded jump / air-jump 防回归。

## TASK-020｜Camera Collision

工程状态：`DONE / VERIFY-DEFERRED`

- 正式 CameraRig 是第一人称，不存在第三人称 boom；exploration 镜头保持 capsule 眼位，investigation 只允许 0.18m 水平前移。
- `PhysicsController.cameraSafeDistance()` 使用 Rapier ray cast，并显式传入当前 player collider collision group；相机 obstruction 与当前认知层保持一致，不会被本认知应忽略的 testimony wall 误挡。
- progression lock 仍被 camera query 忽略，避免纯剧情门锁造成镜头视觉压缩。
- `CameraRig.test.ts` 已覆盖无 exploration boom、调查前移碰撞压缩；`tingyuxuan-layout.test.ts` 新增 wife/gardener cognition camera obstruction 分组测试。
- 贴墙 360°、窄廊、门框/柱子最终浏览器走查留待本地验证。

## TASK-021｜MiniMap / FullMap 八方向统一

工程状态：`DONE / VERIFY-DEFERRED`

- `app/game/runtime/map-config.ts` 新增唯一 `worldPoseToMapPose()`，同时转换世界位置与 yaw。
- `MiniMap.tsx` 与 `FullMap.tsx` 均改用该函数，不再各自拼方向变换。
- `map-config.test.ts` 保留 N/NE/E/SE/S/SW/W/NW 八方向合同，并增加位置+方向同源测试。
- 现场“右转时地图箭头同向”留待本地浏览器验证。

## TASK-022｜Objective / Marker / Map 单一坐标源

工程状态：`DONE / VERIFY-DEFERRED`

- `TutorialStep` 新增 `targetRef`（anchor / interactable / trigger）；`targetPosition` 只保留 legacy fallback，禁止新增正式目标继续手抄坐标。
- 新增 `app/game/runtime/objective-target.ts`，将目标 ID 统一解析到 Gameplay Map anchor、Layout interactable 或 trigger。
- 第一章与第二章正式 objective manifest 已迁移到 `targetRef`。
- `GameRuntime` 的世界 marker、方向/距离与地图 target 现在共同消费 `resolveObjectiveStepPosition()`。
- 第一章墙脚搜索范围改为由 `CH1_TRACES` 自动求中心，不再在组件内另写 `4.2 / 42.55`；玩家可见 `Anchor` 开发术语已改为“循环地标前的踏石位置”。
- 新增 `objective-target.test.ts`，约束正式西院/主宅 objectives 不再保存重复 targetPosition，并验证 anchor/interactable/trigger 三类来源。

## 当前验证阻塞

ChatGPT→CodexPro 的 allowlisted bash 仍返回：

```text
WSL ERROR: execvpe(/bin/bash) failed: No such file or directory
```

这不是代码失败。按照执行协议，本轮不停止后续工程；需要在本地 Windows Codex runner 统一补跑：

1. `npm run typecheck`
2. `npm run validate:content`
3. TASK-018 special-structure visual/walk audit
4. TASK-019 jump + stairs + progression-lock walkthrough
5. TASK-020 wall/door/pillar/narrow-space camera walkthrough
6. TASK-021/022 MiniMap + FullMap + world marker 双截图
