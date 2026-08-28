# TingYuXuan Asset Decisions

本文件记录《游园惊梦：四面证词》听雨轩场景的资产分级、正式用途和禁止回退规则。来源许可与哈希以 `downloaded-3d-assets.json` / `license-ledger.md` 为准。

## 分级

| Source ID | 级别 | 决策 | Runtime 用途 |
|---|---|---|---|
| ancient-chinese-courtyard-house | A | 低面数、结构简单，标准化比例后直接使用 | 北楼 / 内宅外轮廓、远景降级 |
| ancient-chinese-courtyard-park | B | 保留真实园林外观；使用区域流式加载，不先用减面破坏视觉 | 西院、曲廊、园墙、框景与月洞门周边 |
| chinese-pavilion | B | 修正 Pivot / 比例 / 落地后进入 Runtime 处理链 | 备用景观点亭阁，不作为主水榭 |
| chinese-pavilion-memoriam | A | 正式清洗后直接使用 | 水榭、台基、长凳、岩石来源 |
| low-bridge | B | 从原始 GLB 通过 Blender 导入/导出可复现地转换为 Metallic/Roughness 工作副本 | 水院低桥 |
| traditional-chinese-siheyuan-courtyard | B | 作为入口正式建筑基线；视觉定型后再做 KTX2/Meshopt | 正门、前厅、院墙、屋面主来源 |

## 三层边界

- `gameplaySkeleton`：Collision、Trigger、任务点、路线、传送与认知区域；正式运行默认隐藏。
- `visualAssets`：正式 GLB / glTF 资产。Greybox 不得自动进入此层。
- `proceduralDressing`：雨、雾、灯光、水面、水渍、苔藓、少量程序植被变化与记忆差异。

## 正式场景模块

当前正式场景不再依赖程序 BoxGeometry 伪装建筑。当前已纳入完整听雨轩运行拓扑的模块包括：

1. Siheyuan Entrance Compound —— 正门 / 前厅 / 院墙 / 屋面。
2. Courtyard Park West Garden —— 西院 / 两次转折曲廊 / 园墙 / 框景 / 漏窗与月洞门过渡。
3. House Outline —— 北楼与内宅外轮廓。
4. Pavilion A —— 水榭正式主视觉。
5. Pavilion B —— 修正 Pivot / 比例后的备用景观点亭阁，进入 Runtime 但不抢占主水榭职责。
6. Bridge Low A —— 水院低桥，使用可复现材质兼容转换链路。
7. Rock Set A —— 假山主结构。
8. Quaternius subset —— 西院 / 水院使用的少量树、灌木、岩石与地被。
9. Moon-gate gameplay geometry —— 门洞、Trigger 与 Collision 独立于视觉模型。

这些模块通过区域流式加载进入场景；入口仍保持最小 preload，不再因为“后续区域已开发”而把所有资源一次性塞入首屏。

`TYX_ARCH_Kit_A.glb` 仅保留为显式 `?fallbackArchitecture=1` 的历史 Greybox，不属于正式模块。

## 流式加载

首帧只要求入口 Siheyuan。其余正式区域均按空间范围延迟加载：西院 / 曲廊加载 Courtyard Park 与西院植被，继续接近时再加载假山、水院、水榭、Low Bridge、北楼和内宅。`TINGYUXUAN_RUNTIME_ZONES` 已覆盖完整听雨轩拓扑，但不会把这些资产重新塞回入口 preload。区域加载逻辑位于 `tingyuxuan-layout.ts` 与 `TingYuXuanScene.ensureAreaAssets()`。

## 优化原则

- Source 永不覆盖；Working Copy 与 Runtime 独立。
- 视觉定型后，正式 Runtime 使用 KTX2/Basis + Meshopt；不在视觉确认前做 Simplify。
- 25 MiB 单文件与 18 MiB preload 为发布参考预算，不得把真实建筑提前替换回 Greybox。
- 通过区域加载、纹理压缩、Shadow Budget、Draw Call 审计解决网页性能；若仍不足，再针对测得的瓶颈做 LOD / 适度减面。

## 发布阻断

功能测试、Asset Preview 或构建成功都不能替代视觉验收。正式发布必须同时满足：

- 第一章当前 Phase One 路线（出生点 → 前厅 → 西院 → 两次转折曲廊 → 漏窗 / 月洞门）可走通；
- 出生点正视、前厅、西院、曲廊、漏窗 / 月洞门五张真实场景截图完成；
- 截图中 `TYX_ARCH_Kit_A` / legacy `WestCorridorScene` 不承担正式视觉；
- `release-approval.json` 的视觉状态由 pending 改为 approved 后方可执行 `assets:approve`。
