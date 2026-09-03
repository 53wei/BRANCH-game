# V4.2 计划执行状态

Updated: 2026-08-29

## 当前完成

### B0 — Repo Reality Audit ✅
- 19 个系统逐项审计完成
- 结果：16 REUSE / 3 PATCH / 2 DEPRECATE / 3 MISSING
- 文档：`docs/design/mechanics/repo-reality-audit.md`

### B2 — GameMechanicsOrchestrator ✅ (NEW)
- `mechanics/MechanicsOrchestrator.ts` — 中央协调器
- 统一管理：CognitionController, BorrowAnchorController, LoopController, EvidenceLedger, NarrativeGateController, PuzzleController
- 包含 `ReconstructionProfile` (V4.1 要求)
- 8 个单元测试全通过

### B3 — CognitionState ✅
- `CognitionController` 已存在，通过 orchestrator 接入 GameRuntime
- 认知切换时自动更新 ReconstructionProfile

### B4 — Borrowed View ✅
- `BorrowedViewPortal.ts` 已存在，render target 实现
- 通过 orchestrator bindings 接入

### B5 — Loop ✅
- `LoopController` 已存在，cooldown + transform continuity
- 通过 orchestrator 暴露 API

### B6 — Borrow + Anchor ✅
- `BorrowAnchorController` 已存在，支持 borrow → anchor → persist → reset
- 通过 orchestrator `executeBorrow` / `anchor` 暴露

### B7 — Evidence / Narrative Gate ✅
- `EvidenceLedger` + `NarrativeGateController` 已接入 orchestrator
- Ch1 矛盾确认直接触发追逐 (V4.2: 无 Trust 中间步骤)

### Trust 废弃 ✅
- Ch1 移除 trust 对话触发
- 矛盾确认后直接 `startChase()`
- North Tower trust 保持向后兼容
- 文档：`docs/design/mechanics/trust-deprecation.md`

### GameRuntime 集成 ✅
- orchestrator 在 boot 时实例化
- `switchMemory` 路由通过 orchestrator
- 证据发现路由通过 orchestrator
- checkpoint 序列化捕获 mechanic state
- 文档：`docs/design/mechanics/mechanics-orchestrator.md`

## 进行中 / 待完成

### P0 (第一阶段必须)

| 项目 | 状态 | 说明 |
|---|---|---|
| CameraRig 接入 GameRuntime | DONE | `GameRuntime`、序章、北楼与缺失房间 Runtime 均使用 `CameraRig` |
| 交互控制器接入 GameRuntime | DONE | `GameRuntime` 与北楼 Runtime 使用 `InteractionController` |
| Dev mechanics playground | DONE / POLISH | `/dev/mechanics` 已可交互演示 Switch / Loop / Borrow / Anchor；已补动态目标链与 `anchor.verified` 跨认知验收 |

### P1 (第二阶段)

| 项目 | 状态 | 说明 |
|---|---|---|
| AudioZone 系统 | DONE / POLISH | `AudioAtmosphere` 已按空间分区平滑切换程序化雨声与室内底噪；正式声音资产待替换 |
| Ch2 Evidence Skeleton | DONE | 第六只茶杯、离园记录、特定视角雨夜人影三个独立通道与综合板已接通 |
| Evidence Recontextualization | MISSING | Ch4 需求 |
| View-dependent evidence | MISSING | Ch2 需求 |
| CharacterAnimationState 接入 | PARTIAL | 类存在，未接入 runtime |

### P2 (终章)

| 项目 | 状态 | 说明 |
|---|---|---|
| Ch3+ Borrow/Anchor 扩展 | PLANNED | 复用现有系统 |
| 第五种现实 / 多结局 | PLANNED | ReconstructionProfile 已就绪 |

## 文件变更清单

### 新建
- `app/game/mechanics/MechanicsOrchestrator.ts` — 中央协调器
- `app/game/mechanics/mechanics.test.ts` — 8 个测试
- `docs/design/mechanics/mechanics-orchestrator.md` — 设计文档
- `docs/design/mechanics/trust-deprecation.md` — 废弃说明
- `docs/design/mechanics/repo-reality-audit.md` — 更新审计报告

### 修改
- `app/game/GameRuntime.tsx` — 接入 orchestrator，移除 Ch1 trust 触发
- `docs/design/mechanics/repo-reality-audit.md` — V4.2 更新

## 下一步建议

1. **立即可做**：实际跑 `/dev/mechanics`，按“Loop → Borrow → Anchor → 切换验证 → 过水 → 脚印”完整走一遍，并根据试玩只修读不懂/走不通的问题
2. **本周**：将 CameraRig 接入 GameRuntime，替换手动相机逻辑
3. **下周**：配置 Ch1 BorrowableConfig 并在假山 Loop 区域接入 Borrowed View
4. **Blender 交接**：用户完成西院 Integration Ready 版本后，Codex 接入 collision/anchor/portal/triggers
