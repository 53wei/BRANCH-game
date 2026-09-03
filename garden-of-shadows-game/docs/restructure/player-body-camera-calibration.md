# TASK-016｜Player Capsule / Avatar / Camera 身体感统一校准

Updated: 2026-09-03

## 1. 单一身体尺度来源

正式 Runtime 不再分别声明 Capsule、Avatar feet、eyeHeight 或探索 FOV。

统一来源：

`app/game/runtime/player-calibration.ts`

当前合同：

| 参数 | 值 | 说明 |
|---|---:|---|
| World scale | 1 unit = 1m | 继承 TASK-015 |
| 成人参考身高 | 1.693m | 建筑尺度参照 |
| Capsule half-height | 0.55m | Rapier capsule cylinder half-height |
| Capsule radius | 0.32m | Rapier capsule radius |
| Capsule total height | 1.74m | 0.55×2 + 0.32×2 |
| Spawn/reference centre Y | 0.90m | 与 Gameplay Anchor reference 共源 |
| Capsule bottom at reference Y | 0.03m | `0.90 - (0.55 + 0.32)`；CharacterController 会处理 grounded/snap |
| Eye offset from capsule centre | 0.74m | 第一人称镜头 |
| Reference eye world height | 1.64m | `0.90 + 0.74`，接近成年视线 |
| Exploration FOV | 65° | 所有正式 3D Runtime 统一 |
| Investigation FOV | 58° | 近距检视只缩 FOV，不改变身体尺度 |
| Investigation forward offset | 0.18m | 仅水平向前，不跟随 pitch 改变眼高 |
| Autostep max | 0.28m | 与 TASK-018 台阶专项继续联动 |
| Autostep min width | 0.18m | 统一 CharacterController |
| Snap to ground | 0.22m | 统一 CharacterController |
| Max slope climb | 42° | 统一 PhysicsController / PlayerPhysics |
| Min slope slide | 48° | 统一 PhysicsController / PlayerPhysics |

## 2. 已清除的第二套身体参数

此前存在两套不同 CharacterController 参数：

- 正式 `PhysicsController`：autostep 0.28 / snap 0.22；
- `mechanics/PlayerPhysics`：autostep 0.36 / snap 0.28。

现在二者都引用 `PLAYER_BODY_CALIBRATION`，旧 dev/mechanics 路径不能再把另一套 Capsule / step / slope 参数带回正式 Runtime。

## 3. Avatar feet / ground

`PlayerAvatar` 是正式第一人称的 geometry-free anchor，不渲染 primitive 身体。

旧实现：

`root.y = pose.y - 0.9`

这把 Anchor 高度误当成 Capsule 几何尺寸。

新实现：

`root.y = pose.y - (capsuleHalfHeight + capsuleRadius)`

也就是通过 `playerPoseToFeetY()` 从真实 Capsule 形状计算脚底参考位置。后续接入正式人物或脚部阴影时必须继续使用此 feet plane，不得重新写固定 `0.9`。

## 4. CameraRig

CameraRig 现在默认从 `PLAYER_BODY_CALIBRATION` 读取：

- eyeHeight；
- exploration FOV；
- investigation FOV；
- investigation forward offset。

序章原有的 `world.camera.fov = 70` 与独立 `eyeHeight: 0.74 / explorationFov: 70 / investigationFov: 58` 覆盖已经删除。

`TingYuXuanScene` 的初始 PerspectiveCamera 也使用同一 exploration FOV 与 near plane。

正式 Runtime 当前没有第三人称模式；因此不存在“切第三人称后缩放世界”的合法路径。未来如果增加第三人称，只允许改变相机位置，不允许改变 Player / Master / NPC scale。

## 5. 正式 Runtime 一致性

以下 Runtime 的 spawn 最低 Y 已统一到同一 Capsule 中心合同：

- PrologueRuntime（通过 TASK-015 `GAMEPLAY_ANCHOR_REFERENCE_Y`）；
- GameRuntime；
- NorthTowerRuntime；
- MissingRoomRuntime；
- YouDidNotReturnRuntime；
- FifthTingYuXuanRuntime。

第一～三章需要 center-screen interaction 的场景，interaction distance 现在从实际 `world.camera.position` 计算，而不是从 `pose.y + 0.85/0.9` 或 Player capsule centre 计算，避免不同章节出现隐性“手臂长度/眼高”差异。

## 6. 自动回归

已有并更新：

- `app/game/mechanics/CameraRig.test.ts`
  - 成人参考眼高；
  - 65° exploration FOV；
  - 58° investigation FOV；
  - investigation 不改变眼高；
  - 原地 90° / 180° 不绕玩家公转；
  - 第一人称探索不使用 third-person boom；
  - 调查前移受 architecture collision 限制。
- `app/game/runtime/PlayerAvatar.test.ts`
  - geometry-free；
  - feet Y 由 Capsule 几何推导；
  - 正式 Runtime 不显示 primitive avatar。
- `app/game/runtime/tingyuxuan-layout.test.ts`
  - Capsule 成人尺度与世界米制关系。

## 7. 视觉验收

TASK-015 已定义：

- `scale-door-character.png`
- `gameplay-shoulder-camera.png`

TASK-016 恢复 runner 后必须重新抓取成人门洞对比图，并确认：

1. 第一人称眼高看门框时接近成年人视线；
2. 门洞不会因为镜头 70° 广角而显得异常矮小；
3. Investigation 只产生近距观察感，不产生巨人/儿童视角；
4. feet / ground 不悬浮、不陷地。

当前本地 WSL `/bin/bash` 无法启动 npm/截图脚本，因此视觉验收保持：

`VERIFY-DEFERRED — Local runner cannot enter npm because WSL /bin/bash is unavailable.`
