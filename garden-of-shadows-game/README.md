# 游园惊梦：四面证词 · V0.1R Onboarding Slice

PC Web 叙事解谜游戏。当前版本是 `V0.1R` 新手垂直切片，不是 V1.0。序章与《西廊回环》已经合并为连续体验：角色对话先建立身份与规则，再由任务导演引导玩家完成两次证词交叉核验、一次信任选择和一次叙事追逐。

主要输入：`WASD` 移动、鼠标观察、`F` 勘验、`Tab` 切换证词、`M` 打开勘误簿；对话使用鼠标、空格或回车推进。

## 本地运行

要求 Node.js 22.13+。

```bash
npm install
npm run dev
```

质量门禁：

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 当前实现

- Vinext / React 站点壳与九章战役总览。
- Three.js `WebGPURenderer`，自动降级 WebGL 2，并可在设置中强制 WebGL。
- Rapier 胶囊体角色控制器；无跳跃。
- 夫人与园丁两种记忆层、独立观察、空间矛盾确认、信任重构、回廊循环与叙事追逐。
- `garden-of-shadows.save.v2` 存档，不读取或删除旧《不死世界》存档。
- 固定章节完成事件 `garden-of-shadows:chapter-complete`。
- `inkjs` 分支对话、左右工笔重彩立牌、对话历史与已读跳过。
- 单一主任务、方向距离、3D 目标标记及 60/120/180 秒自适应软提示。
- 正式视觉采用 `gameplaySkeleton / visualAssets / proceduralDressing` 三层：程序建筑已从正常 `visualAssets` 退出，`TYX_ARCH_Kit_A` 只保留显式 fallback/debug。
- Phase One 主路径使用真实 `Traditional Chinese Siheyuan`（出生点/正门/前厅）和 `Ancient Chinese Courtyard Park`（西院/曲廊/月洞门过渡）。Courtyard Park 进入区域后延迟加载，首帧不再同时预载两套大型场景。
- `/dev/assets-preview` 同时支持 Source 与 Runtime 资产预览；`/credits`、Asset Manifest、License Ledger、KTX2/Basis/Meshopt 链路保留。
- 水院、水榭、桥、假山、北楼和内宅 placements 仍保留在数据层，但当前 `PHASE_ONE_RUNTIME_ZONES` 不会在第一阶段正常游玩中自动激活。

正式配音尚未进入构建。`docs/assets/voice-manifest.json` 已锁定 Azure 付费预置声线和 SSML 模板，但生成 OGG/MP3 需要项目方在本地配置 Azure Speech 凭据，密钥不得提交。

## 文档入口

- [GDD v2](./docs/gdd/GDD_v2.md)
- [案件时间线](./docs/narrative/case-timeline.md)
- [证据矩阵](./docs/narrative/evidence-matrix.md)
- [八章谜题依赖](./docs/design/puzzle-graph.md)
- [美术规范](./docs/art/art-bible.md)
- [资产许可台账](./docs/assets/license-ledger.md)
- [AIGC 来源台账](./docs/assets/aigc-ledger.md)
- [测试与验收](./docs/qa/acceptance.md)

旧项目 `../undying-world-game/` 及 `../game-chapter-01/`、`../game-chapter-02/` 仅作历史参考，不接受新剧情状态或新功能。
