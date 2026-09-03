# UI / 剧情背景图 / 地图 / 新手引导完整开发计划

Updated: 2026-08-30T23:21:00+08:00
Workspace: E:\C_Projects\game
Target agent: Codex / CodeS

## 当前唯一执行基线

详细计划：`garden-of-shadows-game/docs/development-plans/ui-story-image-guidance-plan-v1.md`

执行顺序改为：先完成 UI / 引导 / 序章 / 第一章完整可玩，再做整体打磨，最后才做性能与重验证。Master 建模继续冻结，不再为 UI、路线、剧情或性能问题修改正式 A/B/山体/门窗/贴图。

以下旧 Master Visual Truth 内容继续作为“建模不得回退”的保护约束，但不再是当前开发主线。

# 已完成并继续保留的 Master 保护约束

## P0 — 冻结性能优化与场景删减
- 立即停止任何通过隐藏/删除正式模型、地形、山体、建筑、植被、贴图来换 FPS 的操作。
- 保留已有 profile 报告，但当前不继续性能优化。
- `TingYuXuan_Master.blend / TingYuXuan_Master.glb` 是唯一视觉空间事实；Gameplay 必须迁就建模，不允许为了旧 Route 把 Master 视觉删掉。

## P1 — 恢复 Master Source-Faithful Runtime
正常 Runtime 必须保留并强制可见：
- `A_OuterGarden_Environment`
- `A_MountainBackdrop_Group`
- `A_TransitionPlanting`
- `A_ExpandedBoundary`
- `B_CoreGarden_Primary`

说明：
- `B_CoreGarden_Primary` 是正式 B 建模，未删除；`B_CoreGarden_Backup` 才是备份，可以隐藏。
- 禁止按 `Sketchfab_model` / `skfb_offset` 这类通用包装根名隐藏，因为会连带隐藏整棵可见子树。
- 只允许隐藏明确 backup/source-template；任何 formal A/B/environment root 不允许 hidden。

## P2 — 地面恢复
- Master 模式下，Blender 原始建筑/铺地继续优先；Runtime Ground Patch 只保留 Rapier 碰撞，不再直接渲染旧的大矩形 A/B/C 地表块。
- 正常 Runtime 允许一层统一的程序化 `WorldGround_ProceduralEarthCover` 作为连续土地底层，用来填掉当前白底、断层和场景外露空洞；它不能替代/隐藏正式建筑，也不能形成分区矩形接缝。
- 只有 `runtimeGround=1` / `debugOverlay=1` / `debugMap=1` 才显示旧 Runtime Ground Patch。
- 地面最终目标：连续、暗湿土/苔色、无明显方块边界；正式台阶、木地板、石铺地应自然高于土地层。

## P2.5 — 夜景围挡与亮度
- 不允许“周围一圈全是星空”。真实层级固定为：正式园林/山体 → 程序远景树线 → 两层暗山脊 → 低空雾 → 头顶夜空。
- `WorldEnvelope_NightSky` 只负责天空；`WorldEnvelope_Stars` 只分布在较高仰角。因为当前是雨夜，星星必须稀疏、偏暗，只像云缝里偶尔露出来。
- 增加 `WorldEnvelope_Moon`：月盘 + 很弱的冷色光晕，位置在高空，不做巨大科幻月亮。
- 增加 `WorldEnvelope_MountainBack/Front` 两层远山轮廓，以及 `WorldEnvelope_ForestTrunks/Crowns` 远景树林环；它们都在可玩区外围，只承担真实世界边缘和纵深，不参与玩法碰撞。
- 这是视觉围挡，不是空气墙；物理 World Boundary 仍由 Rapier 独立负责。
- 夜景只做轻微提亮：不要做白天感。当前方向是略提高 Hemisphere / moon key / ACES exposure，并降低一点雾密度，让建筑轮廓、瓦面、墙体可辨。

## P3 — Debug 与正式 Gameplay 完全分离
- 正常游戏：`http://localhost:3000/`，不使用 map audit 参数。
- `debugMap=1` / `mapAudit=1` 才允许 76m 俯视地图相机。
- `debugOverlay=1` 只显示碰撞/Trigger，可保持玩家相机。
- `visualTest=1` 本身不得跳过序章；只有 `visualScenario=...` 或 `skipNarrative=1` 才能跳剧情。

## P4 — 视觉验收，未通过不得继续剧情开发
在正常第一人称、不启用 debugMap/runtimeGround 的情况下检查：
1. 主门外：外围山体/terrain存在，不能是黑色虚空。
2. A 区：原始铺地/地形存在，不得出现 Runtime 大矩形地面覆盖。
3. 朝 B 区观察并实际走到 B：`B_CoreGarden_Primary` 建筑/园林必须存在。
4. 与 Blender 总览对照：整体仍是两组主要院落/园林 + 外围完整 terrain/mountain 的同一 Master，只是第一人称看不到全图。
5. 若山体与 Spawn/Route 冲突，改 Spawn/Route/Collider；禁止再次隐藏山体。

## P5 — 可玩内容
视觉 Gate 通过后继续：
- 完整序章 6–8 分钟。
- 第一章 10–14 分钟。
- 第一人称。
- 序章：旧信→门口老周→入园→A区空间基线→证物→空间异常→第二次老周→标题漂移。
- 第一章：现实痕迹→夫人的墙/老周的路→Loop→Borrowed View→Borrow→Anchor→打破Loop→夹院→湿脚印/纸条/身高刻痕→无面人→A到B。
- 首次完整试玩目标 17–22 分钟，硬底线≥15分钟。

## P6 — Playtest / Collision
- 先完成从 New Game 到第一章结束的完整连续试玩。
- 修 Spawn、真实建筑碰撞、门洞、空气墙、剧情锁、穿模、掉落。
- 空气墙只围整张可玩地图外围；不能用小笼子围序章，也不能替代真实建筑碰撞。

## P6.5 — 允许的阻塞性卡顿修复：灯光 Pipeline 预热
- 建模继续冻结，不通过删模型/山体/贴图解决卡顿。
- 当前 Master 本身已经 preload；进入亮区时的严重停顿优先按“PointLight 可见性切换导致 WebGPU/WebGL shader/pipeline 现场编译”处理，而不是继续猜资产没加载。
- 所有 range-limited PointLight 在启动后保持稳定 `visible=true`，只通过 `intensity` 平滑淡入/淡出；禁止玩家走入范围时 `visible false -> true` 改变 renderer light set。
- 序章和第一章在开始动画循环前调用 `renderer.compileAsync(scene, camera)`，把 Master + 当前完整灯光组合的 pipeline 编译成本移动到加载阶段。
- 允许初始加载多等一点，目标是消除“走到灯旁边突然整页冻结”的运行中 hitch。
- 若此改动后仍有冻结，再单独记录进入点前后 `frame time / lights / streaming / loadedAssetBytes`，区分是灯光 pipeline、Portal render target 还是其他实时资源，不允许因此改 Master 几何。

## P7 — 最后才做正式性能优化
- 用完成后的真实场景+真实剧情+真实雨/灯/Portal/Loop/Borrow负载做 Profile。
- 优化依据 CPU/GPU/frame time/draw calls/triangles/materials/lights 等实测。
- 优先 culling/instancing/LOD/material batching/更新频率/灯光范围等无损手段。
- 禁止通过永久隐藏 `A_MountainBackdrop_Group`、`B_CoreGarden_Primary`、正式建筑、正式贴图来达标。

详细回滚记录：`garden-of-shadows-game/docs/development-records/master-visual-truth-rollback-2026-08-30.md`。

## Implementation contract

- Work from this plan in small, reviewable steps.
- Keep edits scoped to the requested task and existing project conventions.
- Run focused verification before handing work back.
- Update .ai-bridge/agent-status.md with files touched, checks run, results, blockers, and review notes.
- Save the final review diff to .ai-bridge/implementation-diff.patch when practical.
- Append notable execution events to .ai-bridge/execution-log.jsonl when the implementation agent supports logging.
