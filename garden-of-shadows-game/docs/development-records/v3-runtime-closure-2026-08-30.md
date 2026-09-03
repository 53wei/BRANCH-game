# 《游园惊梦》Codex 接续开发 V3.0 执行报告（更正稿）

日期：2026-08-30

> 更正说明：旧稿只用 `grounded=true` 判断出生正确，这是错误的。它只能证明玩家胶囊接触了 Collider，不能证明人物可见、相机高度正确、镜头未被树或锁碰撞压缩，也不能证明出生构图位于城墙下。本稿只保留当前代码、自动测试和重新生成的浏览器截图能够支持的结论。

## A. 代码验证

- `npm run typecheck`：PASS。
- `npm run lint`：PASS。
- `npm test`：70/70 PASS（18 个测试文件）。
- `npm run build`：PASS；构建前内容验证 48/48 PASS。
- `npm run visual:audit-prologue-spawn`：PASS，并重新生成出生点截图与遥测。
- `npm run visual:audit-map`：PASS，并重新生成 7 个锚点截图及一次连续行走审计。
- 非阻断告警：客户端仍有大于 500 kB 的构建分块；Rapier compat 在测试初始化时仍输出依赖内部的旧参数告警。

## B. 序章与出生点

### 当前已经由真实浏览器截图确认

- `ROUTE_01_START`：已根据实机截图与路线规划图从错误的墙体/院落接缝 `[7.25, 0.90, 46.95]` 移到外侧起步石地 `[11.50, 0.90, 52.20]`。
- 旧坐标附近存档会在序章启动时自动迁移到新起点，避免继续出生在墙线/高台视觉位置。
- 旧相机姿态 `y≈1.45m` 已作废；当前低位探索镜头目标高度约 `y≈1.08m`，需以新一轮实机截图复核。
- `cameraCollisionId=""`：相机没有被 `prologue-gate-lock` 或场景 Collider 压到人物体内。
- `playerAvatarVisible=true`：人物场景节点已实际挂入 Runtime。
- `spawnVisualOccluders=[]`：相机到人物的视线没有可见 Master 节点遮挡。
- `interactionPrompt=""`：玩家出生时不再直接落入证据交互提示范围。
- `architectureMode="master"`、`AREA_A`、最近锚点为 `ROUTE_01_START`。

证据：`docs/development-records/prologue-spawn-captures/prologue-route-01-spawn.png` 与同目录 `capture-metrics.json`。

### 本次针对截图问题的实际修正

- 新增 `PlayerAvatar`，并接入序章、第一章、第二章、第三章四个可玩 Runtime；物理胶囊中心转换为脚底视觉坐标。
- 相机按 Rapier 胶囊中心重新标定为胸肩高度，降低 target/lift，并增加可配置 look-ahead。
- 相机射线忽略只用于流程封门的 `progression-lock`，但玩家仍会被该锁阻挡。
- 将老周移到人物侧前方，避免 NPC 与玩家轮廓重合。
- 将入园簿、旧鞋、旧伞移出初始相机 boom 与出生交互半径；入园簿由悬浮盒体改为有支撑的小案。
- 序章证据引导改为低透明小型地面环，不再显示遮住画面的高光柱。
- 隐藏穿过出生点的远景山体组及已由屏幕射线确认的异常入口植被卡片；城墙与正式建筑节点未移动。
- 旧树丛/旧悬空坐标存档会迁回当前有效锚点。

### 必须说明的限制

当前 `PlayerAvatar` 是程序几何临时人物，用来恢复可见角色、尺度和第三人称构图；仓库中没有可直接使用的赵映正式角色 GLB、骨骼动画和角色材质，因此“正式人物美术完成”仍是未完成项。老周同样仍是计划允许的低成本临时暗轮廓。

序章 Morph、四→五→四、老周 Gate、Evidence 条件与 `ROUTE_02` handoff 已有运行时代码和自动测试支持；从新档完整演出一遍、对白节奏和实际操作手感仍需人工试玩，不能用单张截图代替。

## C. 路线

`npm run visual:audit-map` 使用真实 `PhysicsController` / Rapier 连续移动，并记录 Grounded、区域、最近锚点、Loop 传送和章节交接：

| 路段 | 自动结果 | Grounded | 区域交接 | 当前结论 |
|---|---|---:|---|---|
| 01→02 | PASS | 是 | AREA_A | 可到 A 区入口 |
| 02→03 | PASS | 是 | AREA_A | 可到 Loop 核心 |
| 03→04 | PASS | 是 | AREA_A | Gardener Loop 真实触发并回传 |
| 04→05 | PASS | 是 | AREA_A→AREA_B | 章节出口 handoff 真实触发 |
| 05→06 | PASS | 是 | AREA_B | 主院至东北连接通畅 |
| 06→07 | PASS | 是 | AREA_B→AREA_C | 可到 C Entry；C 深区仍锁住 |

- 连续行走耗时：31.117 秒。
- `loopTeleport=true`，`exitHandoff=true`。
- 最终位置：`[-21.503, 0.89, 14.437]`。
- 最终最近锚点：`ROUTE_07_C_ENTRY`。
- 自动路线证明主轴不掉出 Gameplay Ground；它不等于全部支路、转角和视觉空气墙已由人手走完。

证据：`docs/development-records/gameplay-map-v1-captures/capture-metrics.json` 与同目录 8 张截图。

## D. 章节真实完整度

- 序章：独立 Runtime、最终 Master、剧情状态链和交接已实现；正式角色资产与完整人工演出验收未完成。
- 第一章《不存在的路》：`ROUTE_02→05`、双证词碰撞、Loop、无脸人追逐和 A→B 交接已有实现与自动 walkthrough；完整人工剧情试玩未完成。
- 第二章《多出来的人》：运行在最终 Master 的 B 区；第六只茶杯、离园记录、特定视角人影和综合板三个证据通道已接通；证据尺度、站位可读性和灯光仍需人工逐项验收。
- 第三章《不存在的房间》：运行在最终 Master 的 B 区；门/窗/边界/家具四条件、完整房间和儿童旧盒子链已接通；半透明房间的空间对齐、近距离观感与演出仍需人工验收。
- P10 递进 Morph 目前只在序章完整接入。第一章“没有路→有路”、第二章“五只→六只”、第三章“那个孩子→你→我”尚未按同一 `SemanticMorphText` 演出链接入，因此不能标记为完成。

## E. 本轮可确认修改的核心文件

出生、相机、角色与碰撞：

- `app/game/PrologueRuntime.tsx`
- `app/game/GameRuntime.tsx`
- `app/game/NorthTowerRuntime.tsx`
- `app/game/MissingRoomRuntime.tsx`
- `app/game/mechanics/CameraRig.ts`
- `app/game/mechanics/CameraRig.test.ts`
- `app/game/runtime/PhysicsController.ts`
- `app/game/runtime/PlayerAvatar.ts`
- `app/game/runtime/PlayerAvatar.test.ts`

最终地图、证据与视觉：

- `app/game/runtime/tingyuxuan-gameplay-map.ts`
- `app/game/runtime/tingyuxuan-gameplay-map.test.ts`
- `app/game/runtime/tingyuxuan-layout.ts`
- `app/game/runtime/tingyuxuan-layout.test.ts`
- `app/game/runtime/TingYuXuanScene.ts`
- `app/globals.css`
- `scripts/assets/inspect-master-entry.mjs`
- `scripts/visual/capture-regression.mjs`

存档、章节和既有 V3 收口还涉及 `app/game/campaign-save.ts`、`app/page.tsx`、章节 manifests 与相应测试。工作树中存在大量更早的用户/其他轮次改动，本报告没有把整个 dirty worktree 都归为这一次出生点修正。

## F. V3 完成标准核账与未完成内容

### 已有自动证据支持

- 序章独立 Runtime、序章到第一章交接、第一章不重复序章。
- 序章两次 Morph 与入园簿四→五→四的解析/日志策略。
- 老周 Gate、Evidence 条件、`ROUTE_02` handoff。
- 第一章 `ROUTE_02→05`、认知墙碰撞切换、Loop 与 A→B handoff。
- `ROUTE_01→07` Ground 主轴连续，A/B/C Entry 自动行走不掉地。
- 外围、区域边界、C 深区 progression lock 已注册；Debug Layout 可显示碰撞类别。
- 第二、第三章使用最终 Master Runtime。
- Save normalization、章节/锚点/姿态/认知/evidence/puzzle flags 的测试覆盖。

### 尚不能标记为完成

1. **正式玩家角色**：现在是可见且尺度正确的临时程序人物；正式赵映模型、骨骼、待机/行走/奔跑动画仍缺。
2. **完整人工剧情试玩**：尚未从 New Game 连续人工跑完序章→第一章→第二章→第三章，自动测试不能评估对白节奏、操作手感和演出停顿。
3. **全地图非 Debug 视觉走查**：主轴自动通过，但支路、建筑转角、所有空气墙的视觉理由、GLB/Runtime 拼缝和局部穿模仍需人工逐段检查。
4. **P10 后续章节 Morph**：第一、第二、第三章推荐的文字漂移递进尚未接入正式演出。
5. **美术收口**：老周、证据道具、缺失房间和部分引导仍是低成本 Runtime 表现；需要正式资产/材质/动画替换。
6. **性能**：最终序章无头 WebGL2 截图约 24.4 FPS、81 draw calls、590,387 triangles，低于计划的 45 FPS 参考线；必须在真实前台浏览器/目标 GPU 复测并优化。
7. **包体分块**：生产构建通过，但仍有大于 500 kB 的客户端分块告警。

下一步优先级：先人工完整跑一遍序章→第三章并记录具体坐标/遮挡；随后接入正式赵映角色资产和 P10 后续 Morph；最后做非 Debug 全图视觉收口与目标设备性能优化。
