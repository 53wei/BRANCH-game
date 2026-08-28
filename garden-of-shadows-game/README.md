# 游园惊梦：四面证词 · V0.1R Onboarding Slice

PC Web 叙事解谜游戏。当前版本仍是 `V0.1R` 开发阶段，不是 V1.0。仓库已包含序章、第一至第四章的可玩逻辑；第二章已经整合《假山旧路》与《北楼暗账》。正式发布门禁仍以第一章主路径真实视觉验收为先，不因后续章节白盒代码存在而跳过该门禁。

主要输入：`WASD` 移动、鼠标观察、`F` 勘验、`Tab` 切换证词、`M` 打开勘误簿、`H` 定位当前测试点；对话使用鼠标、空格或回车推进。

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

- Vinext / React 站点壳与当前六段战役总览。
- Three.js `WebGPURenderer`，自动降级 WebGL 2，并可在设置中强制 WebGL。
- Rapier 胶囊体角色控制器；无跳跃。
- 夫人与园丁两种记忆层、独立观察、空间矛盾确认、信任重构、回廊循环与叙事追逐。
- `garden-of-shadows.save.v2` 存档，不读取或删除旧《不死世界》存档。
- 固定章节完成事件 `garden-of-shadows:chapter-complete`。
- `inkjs` 分支对话、左右工笔重彩立牌、对话历史与已读跳过。
- 单一主任务、方向距离、3D 目标标记及 60/120/180 秒自适应软提示。
- 正式视觉采用 `gameplaySkeleton / visualAssets / proceduralDressing` 三层：程序建筑已从正常 `visualAssets` 退出，`TYX_ARCH_Kit_A` 只保留显式 fallback/debug。
- 主路径使用真实 `Traditional Chinese Siheyuan`（出生点/正门/前厅）和 `Ancient Chinese Courtyard Park`（西院/曲廊/月洞门过渡）。Courtyard Park 进入区域后延迟加载，首帧不再同时预载两套大型场景。
- 完整听雨轩的区域流式加载已开放：假山、水院、水榭、Low Bridge、北楼和内宅会在玩家接近对应区域时加载，不再只是停留在 placement 数据层。
- 水院已补池岸、桥前石径、水面细微动态与水榭灯光；假山侧路、北楼前庭、内宅前庭也建立了连续的空间过渡，程序几何仍只承担地表/水体/路径/碰撞等 dressing 或 gameplay 职责。
- `/dev/assets-preview` 同时支持 Source 与 Runtime 资产预览；`/credits`、Asset Manifest、License Ledger、KTX2/Basis/Meshopt 链路保留。

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
- [视觉基础与章节整合总览](./docs/development-records/visual-foundation-chapter-integration-v1.md)

旧项目 `../undying-world-game/` 及 `../game-chapter-01/`、`../game-chapter-02/` 仅作历史参考，不接受新剧情状态或新功能。
