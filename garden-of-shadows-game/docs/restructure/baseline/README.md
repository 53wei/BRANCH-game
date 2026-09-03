# TASK-001 重构基线证据包

Updated: 2026-09-03

> Source: 《游园惊梦_重构TASK执行计划_V1.0》TASK-001。
> 本目录只记录“重构基线/可回退事实”，不把后续实现成果冒充为重构前状态。

## 1. 当前基线身份

- Workspace root: `E:\C_Projects\game`
- Main app: `garden-of-shadows-game`
- Git branch: `codex/restructure-v1`
- 当前工作树：**dirty，存在大量已修改/新增文件**。
- 历史恢复快照：`.work/recovery-20260829/garden-of-shadows-game/`，其 README 明确标识为 `V0.1R Onboarding Slice`，早于本轮重构，并包含当时完整 app/docs/public/scripts 与 visual-regression 证据。
- 安全回退脚本：`scripts/restructure/restore-v01r-baseline.ps1`。脚本要求显式 `-ConfirmRestore`，执行前会先把当前 app 完整备份到 `.work/pre-baseline-restore-<timestamp>/`，再从历史恢复快照还原；不会碰工作区根部 `.git`。
- 当前没有专用 git tag，但已经存在一个**物理快照 + 有保护的恢复脚本**，因此“可回退”不再依赖猜测某个 commit。

## 2. TASK-001 六项执行内容逐项状态

| # | 计划要求 | 当前证据 | 状态 |
|---|---|---|---|
| 1 | 建立本轮重构基线标签/分支 | 分支 `codex/restructure-v1` 已存在；历史 V0.1R 物理快照位于 `.work/recovery-20260829/garden-of-shadows-game/`，并提供先备份再恢复的 PowerShell 回退脚本 | DONE（非 git tag 路径） |
| 2 | 记录 build/test 真实通过/失败项 | 2026-09-03 已实际尝试 `npm test` 与 `npm run typecheck`；两者都在进入 npm 前因 WSL `execvpe(/bin/bash) failed: No such file or directory` 退出。`npm run validate:content` 另被 safe-bash allowlist 拦截 | BLOCKED |
| 3 | 保存首页、序章、一/二/三章关键截图 | 仓库已有一批 2026-08-29～30 的运行/视觉截图，但缺少能严格证明“重构前首页/序章/二章/三章”的统一基线组 | PARTIAL |
| 4 | 保存新游戏空存档与章节中段存档 | 本目录新增 `empty-new-game.json` 与 `west-midpoint.json`，字段按当前 schema v2 创建/核对 | DONE（静态） |
| 5 | 记录浏览器与渲染后端 | 既有视觉回归记录明确为 localhost Chromium 自动截图链路，`rendererBackend = webgl2`，architecture=`master`；具体浏览器版本未记录 | PARTIAL |
| 6 | 建立 baseline 证据目录 | 本目录已建立，并固定证据索引与缺口 | DONE |

## 3. 已存在、可以复用的历史运行证据

以下文件早于本轮 2026-09-03 的严格重启，可作为“此前版本曾实际运行”的证据，但**不能自动等价为完整重构前基线**：

### 3.1 视觉回归截图（2026-08-29）

- `docs/visual-regression/after/spawn-front-view.png`
- `docs/visual-regression/after/front-hall.png`
- `docs/visual-regression/after/west-courtyard.png`
- `docs/visual-regression/after/curved-corridor.png`
- `docs/visual-regression/after/moon-gate-window.png`
- 遥测：`docs/visual-regression/phase-one-acceptance.json`

该遥测中明确记录：

- renderer backend: `webgl2`
- architecture mode: `master`
- master scene asset loaded
- required shots 无 error modal / fallback architecture

### 3.2 既有开发记录

- `docs/development-records/01-first-person-main-gate.png`
- `docs/development-records/02-enter-a-zone.png`
- `docs/development-records/debug-topdown-colliders.png`
- `docs/development-records/prologue-spawn-captures/prologue-route-01-spawn.png`
- `docs/development-records/gameplay-map-v1-captures/`
- `docs/development-records/gameplay-map-walk-audit/`
- `docs/development-records/runtime-scale-camera-calibration-2026-08-30.md`

这些文件保留，不移动、不覆盖。

## 4. 缺失的基线证据 —— 禁止伪造

当前仍缺少以下 TASK-001 明确要求：

1. **重构前可回退 tag/commit**：当前工具只能确认分支和工作树状态，不能据此声称存在 baseline tag。
2. **统一的首页基线截图**。
3. **统一的序章关键截图组**。
4. **统一的第一章关键截图组**（现有视觉截图只能覆盖部分空间，不等于完整章节）。
5. **统一的第二章关键截图组**。
6. **统一的第三章关键截图组**。
7. **当前 build/test/typecheck 的重新执行结果**。
8. **浏览器精确版本号**。

如果后续命令/浏览器运行能力恢复，应先补这些证据再将 TASK-001 标记 DONE；不得使用 2026-09-03 之后的新实现截图假装成“改前”。

## 5. 存档基线

- `empty-new-game.json`：标准新游戏空存档，序章未开始、教程未看。
- `west-midpoint.json`：第一章中段样本，已完成序章并进入西院，保留一个尚未完成的侧路核对目标。

用途：

- 验证 normalize/load；
- 后续比较 New Game / Continue / Restart；
- 防止章节状态测试完全依赖开发者浏览器 localStorage。

## 6. 当前 TASK-001 关闭判断

**结论：工程交付 DONE；运行/截图验证 DEFERRED（环境阻塞）。**

已经完成：重构工作分支、V0.1R 历史物理快照、受保护的一键恢复脚本、baseline 证据目录、历史运行证据索引、空存档/中段存档与对应 fixture test。

按照本轮约定，“本地无法验证可以暂时跳过验证但必须留下真实阻塞”，以下仅作为 deferred verification，不影响继续提取 TASK-002：

- `npm test` / `npm run typecheck`：CodexPro 当前 WSL 缺 `/bin/bash`，命令未进入 npm；
- 首页/序章/一二三章统一的重构前截图：现有恢复快照没有完整五状态截图组，不能用重构后的画面伪造；
- 浏览器精确版本：历史遥测只保留 WebGL2/backend 信息。

这些项目必须在 TASK-054～060 QA/发布门禁前补齐；任何后续文档不得把它们改写成“已验证通过”。
