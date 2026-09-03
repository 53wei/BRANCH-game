# TASK-014｜Player-facing Copy Inventory / 旧文本弃用清单

Updated: 2026-09-03

> 目标：正式玩家流程只消费 V5 剧情文本与明确的玩家语言。内部 ID、Runtime 名称、旧角色、旧追逐、Roadmap、旧编译剧情不得重新成为第二事实源。

## 1. 正式玩家文案来源

| Surface | 正式来源 | 当前处理 |
|---|---|---|
| 首页 / 设置 / 章节选择 | `app/page.tsx` | 首页为案卷目录；设置已删除旧“追逐”说明；无 Roadmap / V0.x / Development 玩家文案 |
| 序章剧情 | `narrative/prologue-content.ts` + V5 | 由 Source Conformance Test 约束 |
| 第一章剧情 | `narrative/west-onboarding.ink` | Runtime 直接读取 `.ink?raw`；旧 JSON 不再是剧情源 |
| 第二章剧情 | `narrative/north-tower-ledger.ink` | Runtime 直接读取当前 Ink Source；旧 JSON 不再是剧情源 |
| 第三章剧情 | `narrative/missing-room.ink` | V5 conformance；`MemoryLayer.character` 旧名“周守圃”已改回“老周” |
| 第四章剧情 | `narrative/deleted-person.ink` | 独立 V5 conformance；异常入口不再显示组件名 |
| 第五章剧情 | `narrative/you-did-not-return.ink` | 独立 V5 conformance |
| 终章剧情 | `narrative/fifth-tingyuxuan.ink` + `FifthTingYuXuanRuntime.tsx` | 终章不再显示“一周目/认知媒介/不增加案件事实”等开发解释 |
| 章节回顾 | 各 Chapter Manifest `logline` | 七章按剧情事实表达；第一～三章已删除“玩家/独立通道/共同参照”等策划摘要；四～终章删除“本周目倾向/制造密室”等开发摘要 |
| 案卷 | `ui/CaseFilePanel.tsx` + `runtime/case-file-content.ts` | 地图页删除“不是另一个系统”等元说明 |
| 控制 / 帮助 | `runtime/guidance-config.ts` | “剧情与系统”改为“剧情与菜单” |
| Ending 名称 | `manifests/campaign.ts` | 使用 V5 正式名称：家还记得你 / 路还在 / 纸上有你 / 画外之人 / 第五种听雨轩 |

## 2. 已弃用 / 已阻断

| 旧内容 | 处理 | 状态 |
|---|---|---|
| `FinaleRuntime` / `fact-assembly` / `lens-selection` / `chooseLens` | Runtime 与全局 CSS 已物理清除 | REMOVED |
| `顾蘅秋` / `周守圃` 正式剧情污染 | 当前 `app` 正式内容已清除；只允许在防回归测试中作为禁止词出现 | REMOVED |
| 第一章旧无脸人 / chase 文本 | 陈旧 `west-onboarding.json` 正文已清空为 tombstone；当前 Ink 无旧追逐 | REMOVED |
| `west-onboarding.json` / `north-tower-ledger.json` 作为剧情源 | 两文件只保留 `deprecated` tombstone；无 Ink AST / 玩家剧情正文 | DISABLED |
| Ink→JSON 旧预编译链 | `prebuild` 不再执行；旧 compile 命令改为明确失败，防止重新制造第二剧情源 | DISABLED |
| `身体习惯比口供顽固` / `像这里早就等过你一次` | 当前 `app` 正式玩家源无命中 | REMOVED |
| `Runtime Gameplay Map` / `Roadmap` / `Development` / `V0.x` | 正式玩家源无对应文案；内部类型名/注释不视为玩家文案 | REMOVED FROM PLAYER SURFACE |
| `debugGameplay` / `visualUi` query | 仅 development 环境可生效 | DEV-ONLY |

## 3. 自动门禁

`app/game/narrative/player-facing-copy.test.ts`：

- 扫描正式页面、主要 Runtime、案卷、帮助、Chapter Manifest 与六份正式 Ink；
- 禁止旧角色、旧追逐、旧伪文学、Roadmap/Runtime/True Ending 等典型 player-facing copy；
- 检查两个旧 JSON 只能是无剧情 tombstone；
- 检查 `prebuild` 不再生成编译 JSON。

测试已加入 `npm run validate:content`。

## 4. Release 构建状态

`release/portable-client` 与 `release/Garden-of-Shadows-Demo-0.1.0-demo-Windows-x64` 是此前生成的历史构建，静态搜索仍能在其压缩 JS 中找到旧文本。它们不再代表当前源码，且在本轮源码清理后必须重新构建才能作为正式发布物。

当前本地 runner 在进入 npm 前即因 WSL `/bin/bash` 缺失失败，因此本轮无法重新生成 release：

`VERIFY-DEFERRED — Local runner cannot enter npm because WSL /bin/bash is unavailable.`

在新的 `build:portable` 成功产出并覆盖旧 release 前，旧 release 目录视为 **STALE / RELEASE BLOCK**，不得作为 TASK-014 当前源码验收证据，也不得对外发布。
