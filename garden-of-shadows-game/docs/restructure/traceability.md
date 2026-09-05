# 《游园惊梦：四面证词》问题 → TASK → Runtime → 验收追踪矩阵

Updated: 2026-09-03

> 本文件对应 TASK-003。状态只按当前仓库事实更新，不以旧汇报、旧审计或“代码看起来像做过”代替 Runtime 证据。
>
> 状态：`DONE` / `DONE / VERIFY-DEFERRED` / `PARTIAL` / `TODO` / `AUDIT`。
>
> `AUDIT` 表示尚未按最新五段执行协议完整核验，**不等于未实现**；`VERIFY-DEFERRED` 只允许用于真实设备/浏览器/WSL 等环境阻塞，不能代替可在当前环境完成的工程工作。

## 0. 当前已确认的横向事实

| 项 | 当前事实 | 状态 |
|---|---|---|
| 三份 Source of Truth | 已新增 `docs/restructure/SOURCE_OF_TRUTH.md` 固定优先级与差分执行纪律 | DONE |
| TASK-003 追踪矩阵 | 本文件已建立，覆盖母文档第 3 章全部问题 ID | DONE |
| 地图朝向 | `runtime/map-config.ts` 的 `worldPoseToMapPose()` 已成为 MiniMap / FullMap 唯一位置+yaw变换；八方向与共享位置测试已接入 content gate | DONE / VERIFY-DEFERRED：待本地浏览器右转/地图同向补验 |
| 20/45/90 引导 | `guidance-config.ts` 已固定 20/45/90；序章/一/二/三章 Runtime 已消费 | PARTIAL：待阶段试玩确认 marker 视觉与接近目标降级 |
| 8 个剧情 CG | `story-cg.ts` 已注册 8 张；Viewer / NarrativeChapterRuntime 已有引用 | PARTIAL：待全剧情节点、回顾、skip/continue 验收 |
| 自动命令环境 | PowerShell 本地 runner 已恢复；TASK-017 已实际完成 typecheck、29 项专项测试、七锚点截图与连续行走 | DONE（TASK-017 范围） |
| 建筑碰撞覆盖 | `collider-coverage-map.md` 记录 1457 Mesh、76 候选、12 个 Physics 建筑 Collider、0 截断及 A/B/C 路线覆盖 | DONE（TASK-017） |

---

## 1. 母文档问题追踪

| ID | P | 问题摘要 | 负责 TASK | 当前状态 | 当前证据 / 缺口 | 关闭条件 |
|---|---:|---|---|---|---|---|
| NAR-01 | P0 | 序章“回来/没回来”难理解 | 006, 007, 014, 054, 055 | PARTIAL | 已建立 `prologue-content.ts` 单一内容层并逐场接入 V5.0 0-1～0-6；Runtime 顺序锁定为园门→前厅画像→离家记录→西院基线→水榭→原路返回异常。待浏览器首次流程验收 | 首次玩家可复述回来原因、老周关系、旧案；不提前知道第五人 |
| NAR-02 | P0 | 旧伪文学/抽象恐怖句 | 006～014, 055 | PARTIAL | TASK-014 已完成正式 player-facing 来源审计：当前 `app` 无“身体习惯比口供顽固”“像这里早就等过你一次”等旧句；新增 `player-facing-copy.test.ts` 防回归。历史 release 压缩包仍属 STALE / RELEASE BLOCK，且最终仍需 TASK-055 全章 walkthrough | 正式流程无不可落画面的抽象恐怖总结 |
| NAR-03 | P0 | 角色像谜语播报器 | 006～013, 027, 055 | AUDIT | 新 Runtime/Ink 已有大量改动，未逐角色对话核验 | 主要角色首次正式对话含身份/关系/生活层 |
| NAR-04 | P0 | 主线调查目标/结局不清 | 007～013, 023, 055 | PARTIAL | TASK-007～013 已按 V5 完整接入序章至终章；终章已由独立 `FifthTingYuXuanRuntime` 承担 F-1 真实走园、F-2 四人告别、F-3 写纸离园，并以 `FINAL_FACT_IDS` 锁定共同案件事实。五 Ending 只改变稳定媒介/余刺，不再手动选真相；待 TASK-023 状态闭环与 TASK-055 全章 walkthrough 后关闭 | 每章回答旧问题并生成新问题；终章主体事实完整 |
| NAR-05 | P0 | 证物替玩家下结论 | 028, 029, 033～039, 044 | AUDIT | Evidence / Notebook / 3D 检视需组合审计 | 玩家先看到客观事实，再形成判断 |
| UI-01 | P0 | HUD 模块同时抢屏 | 025, 026, 028, 031, 057 | AUDIT | `globals.css`/多个 Runtime 均有重构，待截图级核验 | 常规探索长期 UI ≤ 4，当前目标单一主视觉 |
| UI-02 | P0 | 主任务和解释无层级 | 026, 032, 057 | AUDIT | 待 UI 结构/CSS + 截图核验 | 2 秒截图第一眼能指出当前任务和下一步 |
| UI-03 | P0 | 旁白被当角色对白 | 006, 027, 055, 057 | PARTIAL | 序章已按 `spoken / inner / narration / action` 四类语义渲染，心声、环境、动作不再伪装成角色对白；其余章节仍需统一审计 | spoken/inner/narration/action 表现明确分离 |
| UI-04 | P0 | 对话可读性差 | 027, 032, 057 | PARTIAL | TASK-032 已建立 caption/small/body/dialogue/heading 中文层级 token，提升 speaker、正文、行走字幕、选项、案卷与文书对比度，并提供全局大字模式；待 TASK-057 的 1080p/1440p 截图关闭 | speaker/正文/选项 1080p 可读 |
| UI-05 | P1 | 三个选项粘在一起 | 030, 032, 057 | PARTIAL | TASK-030 已将选项改为独立编号纸签，具有明确间距、hover/focus/当前态及方向键、数字键、回车操作；待 TASK-032 字号对比度和 TASK-057 截图 QA 后关闭 | 选项为独立可辨卡片/纸签 |
| UI-06 | P0 | 开发术语/英文过量 | 014, 025, 026, 032, 053, 057 | PARTIAL | TASK-014 已清理正式 UI 中的 `NarrativeChapterRuntime`、旧追逐说明、“剧情与系统”、终章“一周目/认知媒介”等元语言；`debugGameplay/visualUi` 仅 development 可启用。后续 UI/视觉任务继续做全屏幕验收 | 正式试玩无 Runtime / Development / V0.x / Roadmap |
| UI-07 | P0 | 首页像开发 Roadmap | 025, 014, 057 | PARTIAL | TASK-014 静态确认首页正式入口为继续/新游戏/章节/设置/制作人员，当前 `app/page.tsx` 无 Roadmap/Development/V0.x 玩家文案；最终版式与 5 秒截图测试仍由 TASK-025/057 关闭 | 5 秒内知道游戏类型与入口 |
| UI-08 | P1 | 多套证据弹窗割裂 | 028, 029, 034, 035, 057 | AUDIT | EvidenceLedger / Notebook / modal 需统一核验 | 调查结果统一进入案卷体系 |
| DOC-01 | P1 | 入园簿不像一本簿 | 029, 036, 044 | PARTIAL | TASK-029 已将 ledger / record / letter 做成装订簿、划格登记纸和折痕信纸三种实体阅读样式，并支持翻页/缩放；具体世界内纸面资产仍由 036/044 关闭 | 不看标题也能识别旧登记簿 |
| DOC-02 | P0 | 四人/五人变化太快 | 029, 038, 051, 057 | PARTIAL | V5 已用“离园时间被刮改”替代旧版四人→五人入园簿设定；TASK-029 将平视原页与侧光逆毛页保留为可往返翻看的两页，不自动消失。CG 节点仍由 051/057 关闭 | 变化前后均可查看，关键变化不固定短计时消失 |
| TASK-01 | P0 | “确认3处空间参照”像策划语言 | 007, 026, 040 | AUDIT | 序章 guidance 文案已改动，需 player-facing 搜索 | 任务以剧情动机表达，不暴露 landmark 术语 |
| TASK-02 | P0 | “转角灯”等目标与世界不一致 | 033, 041, 042, 044 | AUDIT | 需目标名称/坐标/世界模型一致性审计 | 玩家自然用相同词描述目标 |
| TASK-03 | P0 | 任务缺因果 | 007～013, 041 | AUDIT | 需章节 Flow 逐任务核验 | 所有任务均由前一剧情动作产生 |
| TASK-04 | P0 | 任务都挤在入口 | 007, 041, 042 | AUDIT | 已有 gameplay route 及多区域记录，需对剧情 Beat 核验 | 序章形成进入—深入—回访旅程 |
| INV-01 | P0 | 调查=按 F 弹文字 | 033～039 | AUDIT | Mechanics / inspection 已新增大量实现，需 Runtime 绑定审计 | 至少 3 类核心证物有物件级调查过程 |
| INV-02 | P1 | 目标只有提示后才可发现 | 033, 040, 048 | AUDIT | 需 Interaction Focus + outline + marker 状态审计 | 关闭 marker 时多数主要调查物仍可发现 |
| INV-03 | P0 | 常驻黄色地面圈 | 040, 048 | PARTIAL | 20/45/90 延迟逻辑已证实；`TingYuXuanScene` / `NorthTowerScene` 仍有 guidanceMarker，需要确认默认 0～90s 不显示且视觉已弱化 | 接任务瞬间无黄色工程圈，90s 才低干扰出现 |
| INV-04 | P1 | 证词/勘误进度像仪器 | 026, 028, 037, 048 | AUDIT | 待 HUD / Notebook / cognition UI 审计 | 正常探索不被认知仪表覆盖 |
| MAP-01 | P0 | 右转箭头左转 | 021, 056 | PARTIAL | TASK-021 工程已收口：MiniMap / FullMap 共用 `worldPoseToMapPose()`，八方向合同与位置+方向同源测试已纳入 `validate:content`；当前插件命令环境阻塞，现场右转同向留待本地浏览器补验 | 自动测试通过 + 现场右转同向 |
| MAP-02 | P0 | 地图路线与实际走法不一致 | 022, 041, 056 | PARTIAL | TASK-022 已新增 `targetRef` + `resolveObjectiveStepPosition()`；第一/二章正式 objective 不再手写 targetPosition，GameRuntime 的地图 target、方向/距离与 world marker 共用同一解析结果；`MAP_ROUTE` 继续直接来自 `tingYuXuanRouteAnchors`。浏览器双截图由后续 QA 补验 | 地图目标、世界目标、实际路径同源 |
| MAP-03 | P1 | 全地图像后台 | 031, 032, 057 | PARTIAL | TASK-031 已删除右侧后台式信息栏，以全幅手绘园图为唯一主体；当前位置、调查点、已走路线与轻量任务签直接叠在图上，未到区域只保留“尚未绘入”的遮蔽。待 TASK-032/057 做分辨率与截图 QA 后关闭 | 第一视觉焦点是园林图而非侧栏 |
| NAV-01 | P1 | 世界箭头/距离数字突兀 | 040, 048, 057 | PARTIAL | 20/45/90 已实现；仍需 `objective-direction` 与 world marker 视觉/出现时机核验 | 新区域初始无巨型工程箭头；卡住后渐进升级 |
| LVL-01 | P0 | 漂亮区域未进入主流程 | 007～013, 041 | AUDIT | gameplay map 已覆盖 A/B/C 路线，但章节 Beat 映射未事实核验 | 主流程覆盖正门/前厅/西院/曲廊/水域/北楼等 |
| LVL-02 | P1 | 场景缺记忆地标 | 042, 041 | AUDIT | 已有灯/月洞门/漏窗等设计，需每区核验 | 关闭地图仍能识别主要区域 |
| ART-01 | P0 | 老周仍像球柱 | 043, 053, 060 | AUDIT | `PlayerAvatar` 存在不代表 NPC 已替换；需 Runtime 资产真值审计 | 正式路线老周为可识别人形正式资产 |
| ART-02 | P0 | 旧鞋像砖块 | 036, 044, 053 | AUDIT | 需运行资产 manifest / loader / fallback 审计 | 无文字可识别旧鞋，非 primitive |
| ART-03 | P0 | 二/三章白盒资产 | 044, 045, 053 | AUDIT | 北楼/儿童房 Scene 仍需逐关键物件核验 | 正式路线无 Box/Capsule 占位 |
| ART-04 | P0 | 近景互动层廉价 | 043～045, 053 | AUDIT | 需 0–3m 关键资产清单和截图 | 近景关键资产不低于主场景平均观感 |
| ENV-01 | P0 | 水和非水地面都蓝 | 046, 047, 057 | AUDIT | `UnifiedMaterials.ts` 已改，需截图语义核验 | 静态截图无需提示能区分水和石地 |
| ENV-02 | P0 | 地面马赛克/UV 问题 | 046, 052, 057 | AUDIT | Master/Runtime ground 已经历重构，需近地截图 | 无明显像素块、错误 UV、大方格 |
| ENV-03 | P1 | 周边死黑 | 047, 057 | AUDIT | 待灯光/雾/曝光截图 | 暗部有层次，路径和关键物可读 |
| ENV-04 | P2 | 雨雾灯像技术 Demo | 047, 049, 052, 057 | AUDIT | `AudioAtmosphere` / rain 已改，需整体氛围验收 | 关闭 HUD 仍有统一雨夜美术风格 |
| PHY-01 | P0 | 可穿墙/房屋 | 017, 018, 056 | PARTIAL | TASK-017 普通建筑链路已关闭；TASK-018 工程已补齐正门/月洞门复合碰撞、C 区 `214b32a0.o` 木阶/栏杆 trimesh 与专项注册门禁。当前插件无法重跑最终专项浏览器审计，统一留给本地 Windows runner / TASK-056 | 所有正式墙体不可穿，门洞可通行 |
| PHY-02 | P0 | 修墙后门洞被封死 | 018, 056 | PARTIAL | 正门已拆为左右门框+上梁+门槛，月洞门为左/右/上三段；`special-structure-collision.test.ts` 锁定双向 capsule 通行和门槛 autostep。当前版本浏览器专项重跑 VERIFY-DEFERRED | 门洞保持可通行，无整块封死 collider |
| PHY-03 | P0 | 相机穿墙 | 020, 056 | PARTIAL | TASK-020 工程已闭环：六个正式 3D Runtime 将 `PhysicsController` 注入第一人称 `CameraRig`；调查前移经 `cameraSafeDistance()` 压缩，Rapier ray 现使用当前 cognition collision group，避免错误认知墙干扰。贴墙 360°/窄廊现场验收 VERIFY-DEFERRED | 贴墙 360° 不看见建筑内部 |
| PHY-04 | P1 | 不能跳 | 019, 056 | PARTIAL | TASK-019 工程已闭环：正式 `PhysicsController` grounded-only jump 已进入六个 3D Runtime；movement calibration 与 dev `PlayerPhysics` 合并，新增 shared jump test，Help/Tutorial 已含 Space 小跳。实机跳跃/台阶/progression-lock 组合走查 VERIFY-DEFERRED | 地面可小跳，空中不可无限跳 |
| CAM-01 | P0 | 人/世界比例和视角不对 | 015, 016, 043, 056 | AUDIT | 已有尺度校准记录与 PlayerAvatar/CameraRig；需当前 Runtime 最终值核验 | 成人与门/栏杆/桌面比例自然，眼高可信 |
| ONB-01 | P0 | 重开后教程不出现 | 004, 024, 058 | AUDIT | CampaignSave / tutorial 状态已大改，需 New Game/Restart/Continue 矩阵 | New Game/Restart 有首次教学；Continue 不重复 |
| ONB-02 | P1 | 开场像说明书 | 024, 026, 040, 054 | AUDIT | `TutorialGuide`/HelpPanel 已存在，需实际首次流程核验 | 能力在首次需要时再教，不出现键位墙 |
| AUDIO-01 | P2 | 只有合成雨噪/低频 | 049, 052, 059 | AUDIT | `AudioAtmosphere.ts` 已改，需采样资源与区域 crossfade 审计 | 不同区域闭眼可听出空间差异 |
| CG-01 | P1 | 复杂人物表演缺失 | 051, 055, 057 | PARTIAL | 8 个 CG 已注册并有 Runtime 引用 | 8 节点按剧情触发、主动继续、回顾/跳过规则正确 |
| DEV-01 | P0 | Roadmap/版本号暴露 | 014, 025, 053, 057 | PARTIAL | TASK-014 已完成静态 player-facing copy inventory 与自动禁止词门禁；首页/正式 Runtime 无 Roadmap/V0.x/Development 文案，调试 query 仅 development 可用。历史 release 构建仍为 STALE，待可执行环境恢复后重建与 TASK-053/057 视觉发布验收 | 正式试玩无内部版本/审计/开发文案 |
| QA-01 | P0 | 故意异常和 Bug 混在一起 | 003, 004, 054～060 | PARTIAL | 已建立本追踪矩阵；已有部分自动/截图记录，但完整固定回归门禁尚未闭环 | 正常基线 + 异常 + 碰撞 + 地图 + 首次体验固定回归通过 |

---

## 2. TASK-001～060 差分状态索引（第一轮）

> 本表是“初始审计入口”，不是最终结论。只有已有直接证据的任务才提前标为 `PARTIAL` / `DONE`；其余统一 `AUDIT`，避免把“未检查”误写成“没做”。

| TASK | 状态 | 已知事实 / 下一步 |
|---|---|---|
| 001 | DONE / VERIFY-DEFERRED | 已建立 `docs/restructure/baseline/`、空存档/第一章中段存档、fixture test；确认历史 V0.1R 物理快照 `.work/recovery-20260829/garden-of-shadows-game/`，并新增先备份再恢复的 `scripts/restructure/restore-v01r-baseline.ps1`。统一改前截图、npm test/typecheck、浏览器精确版本因当前 WSL `/bin/bash` 缺失/历史证据不足延后到发布 QA，禁止伪写为已通过 |
| 002 | DONE / VERIFY-DEFERRED | 三份权威根文档已由 `SOURCE_VERSIONS.json` 锁定路径/角色/优先级/SHA-256；`SOURCE_OF_TRUTH.md` 与项目 README 固定剧情>母文档>TASK>旧代码，`EXECUTION_PROTOCOL.md` 固定不跳任务/剧情/问题与冲突处理；新增 source-of-truth contract test。npm 验证仍因 WSL `/bin/bash` 阻塞 |
| 003 | DONE / VERIFY-DEFERRED | 问题矩阵覆盖母文档全部问题 ID，并为每项记录负责 TASK、涉及证据/缺口和关闭条件；新增 `traceability-contract.test.ts` 自动从母文档提取问题 ID，检查矩阵唯一覆盖、至少一个 TASK owner 与关闭条件。npm 执行仍因 WSL `/bin/bash` 阻塞 |
| 004 | DONE / VERIFY-DEFERRED | `/dev/qa` 提供一键真 first-run 与隔离章节 Smoke；新增 `qa-session.ts` 将 smoke 存档构造与 query 常量集中为纯逻辑，正式 `persist()` 在 QA session 不写 localStorage；`qa-session.test.ts` 检查所有章节入口、锚点与隔离边界；`docs/qa/first-run-qa.md` 固定耗时/阻塞记录模板。生产环境 QA 页无操作，正式首页无入口。30 秒真实浏览器计时因当前运行环境延后 |
| 005 | DONE / VERIFY-DEFERRED | `runtime-asset-truth.md` 已按当前 Runtime 重新逐项核对老周/赵映/画像/茶点/离家记录/旧鞋/六杯/北楼/儿童房/Master；Release gate 已接入 `visual:verify-release` 与 `build:portable`，且修正为“只有茶具 anchor 仍判 BLOCK”，不会因删除 primitive 就假通过。当前老周正式人物、前厅茶点、第二章茶具等真实资产缺口继续作为后续 ART TASK 的 release blocker；门禁脚本实际执行因 WSL `/bin/bash` 延后 |
| 006 | DONE / VERIFY-DEFERRED | `content-schema.ts` 统一 spoken/inner/narration/action/choice/cg/interaction，并新增统一 presentation role/label；Ink parser、DialogueRunner、Prologue 以及四个 3D Runtime 的移动中叙事均消费统一语义渲染 `NarrativeInline`；序章稳定 ID 已接入，迁移纪律记录于 `narrative-schema-migration.md`，新增 contract test。后续 TASK-007～014 负责逐章把 V5 内容完整迁入，不再各自定义语义。npm 验证因 WSL 阻塞 |
| 007 | DONE / VERIFY-DEFERRED | V5.0 0-1～0-6 已逐场进入 Runtime，canonical 顺序固定为园门→前厅画像→离家记录→西院基线→水榭→原路返回异常；`prologue-content.test.ts` 现在直接从 V5 母稿抽取序章文本，与 Runtime 内容逐句比对并检查序章不提前出现“第五人”。真实浏览器 first-run walkthrough 因当前运行环境延后 |
| 008 | DONE / VERIFY-DEFERRED | 第一章 1-1～1-6 的正式对白/心理已在 `west-onboarding.ink` 与 V5 母稿逐场对齐；新增 `west-v5-conformance.test.ts` 直接比对母稿与 Ink。修复进入第一章时错误复用 `prologue.dialogue.complete` 导致早餐 1-1 被跳过的问题，改用 `west.dialogue.breakfast-complete`；`DialogueRunner` 默认直接编译当前 `.ink` 源，避免旧 JSON 覆盖新版剧情；系统提示不再冒充老周/沈夫人 Bark。实际 `npm test` 已执行但 WSL 报 `/bin/bash` 缺失，故运行验证延后 |
| 009 | DONE / VERIFY-DEFERRED | 第二章 2-1～2-4 已从旧 25 行摘要 Ink 重写为完整 V5 人物场景：钱先生无意识摆出第六杯→玩家实查生活痕迹→钱先生拿出离园记录→DocumentViewer 主动阅读→完整纸面/记忆对话→柳生完整旧画场景→玩家复现特定观看角度→完整前厅汇合与老周备份钥匙。`NorthTowerRuntime` 现在保存/恢复对话进度，三种证据操作彼此不同，且只有 `north-completion` 全场景结束后才写入第五人确认；新增 `north-v5-conformance.test.ts` 逐场比对 V5 对白/心理。正式茶具资产仍由 TASK-044 的 release blocker 负责，不用 primitive 冒充；运行验证受 WSL `/bin/bash` 阻塞 |
| 010 | DONE / VERIFY-DEFERRED | 第三章 3-1～3-4 已接入完整 V5 DialogueRunner：先以钱先生旧房契建立“北墙少了三米多体积”，再用老周/柳生/钱先生/沈夫人四份认知分别固定门、窗、边界、家具；四条件同时成立后先呈现普通儿童房和被磨掉名字的身高刻痕，旧盒子只负责触发完整身份场景，不再直接写 `missing-room.identity-confirmed` 或 500ms 自动结束。`room-identity` 完整播放徽章、生日卡、布鞋、“这间房是我的”“七年前我回来过”与“为什么删我”后才完成章节；新增 `missing-room-v5-conformance.test.ts` 锁定母稿逐句一致性、身份确认时机与对话恢复。正式儿童房资产质量仍由 TASK-045 负责；运行验证受 WSL `/bin/bash` 阻塞 |
| 011 | DONE / VERIFY-DEFERRED | 第四章已删除旧“四张摘要卡 + 一句信件”正式流程，新增 `deleted-person.ink` 完整接入 V5 4-1～4-6：沈夫人保存物品而非销毁、老周封路与认知不确定、钱先生过度周全的离开安排、柳生藏原画而非烧毁、沈老爷完整未寄信、赵映读信后的两段心理以及“离开后又折返”的新矛盾。未寄信改为两页 `DocumentViewer`，保留“我不是要你消失 / 我是要你走得出去”完整上下文；章末仍明确保护动机不能抵消替赵映决定人生、撒谎和自我欺骗造成的伤害。新增 `deleted-person-v5-conformance.test.ts` 比对全部对白/心理、完整信件和 Ink knot；运行验证受 WSL `/bin/bash` 阻塞 |
| 012 | DONE / VERIFY-DEFERRED | 第五章已从旧 `CHAPTER_FIVE_BEATS` 摘要卡彻底迁出，新增独立 `YouDidNotReturnRuntime`：玩家先在同一正式 Master Scene 中沿第一章侧路反向走出，再按七年前路线折返回旧房，5-1/5-2 均由真实 CharacterController 行走触发；其后 `you-did-not-return.ink` 完整接入 V5 5-3～5-8 水榭争吵、木阶事故、四人赶到、保护性删除蒙太奇、救治延误与回到现在。新增 `young-zhaoying` / `master` speaker、赵映独立 collision group、CG-05/06/07 hook、双向路线物理合同与 `you-did-not-return-v5-conformance.test.ts`，并删除旧摘要 Runtime 分支。章节只在 5-8 完整结束后完成，固定事实明确无推人、无隐藏凶手、无毒药/邪教。`npm test` 再次实际执行但仍在 npm 前被 WSL `/bin/bash` 缺失阻断，故运行验证延后 |
| 013 | DONE / VERIFY-DEFERRED | 独立 `FifthTingYuXuanRuntime` 已完整承载 V5 F-1～F-3；F-1 在正式 Master Scene 中按正门→侧路→旧房→水榭重走且关闭雨/任务光圈/距离数字，F-2 保留四人完整告别，F-3 写下“我回来过 / 我也会再离开”并从正门离园。`FINAL_FACT_IDS` 固定七项共同案件事实，`deriveEndingLens` 仅依据 `cognitionUsage` 产生 domestic/spatial/documentary/pictorial/composite 稳定方式；Ending E 仅保留无字幕/无音效的正式建筑空间余刺。旧 `FinaleRuntime` / `fact-assembly` / `lens-selection` / `chooseLens` / `FINALE_GOODBYES` 正式入口与残留 CSS 已物理清除，并由 `fifth-tingyuxuan-v5-conformance.test.ts` 防回归。npm 运行验证仍受本机 WSL `/bin/bash` 缺失阻塞 |
| 014 | DONE / VERIFY-DEFERRED | 已建立 `player-facing-copy-audit.md` 与 `player-facing-copy.test.ts`；清理旧角色名、旧追逐说明、策划式“独立观察/矛盾确认”、案卷元系统文案、终章“一周目/认知媒介”解释和旧 Ending 内部命名；正式 `debugGameplay/visualUi` 仅 development 可启用。陈旧 `west/north *.json` 剧情正文已物理清空为 tombstone，旧 Ink→JSON `prebuild` 链被禁用，避免第二剧情源重生。当前源码静态扫描通过；历史 `release/` 压缩 JS 仍是旧构建并标记 STALE / RELEASE BLOCK。npm/test/typecheck 无法进入 npm，原因仍为 WSL `/bin/bash` 缺失，故 release 重建和运行验证延后 |
| 015 | DONE / VERIFY-DEFERRED | 已建立 `world-scale-calibration.md`；正式 Runtime 锁定 `1 world unit = 1 meter`、ground `Y=0`、Gameplay Anchor reference `Y=0.9m`、Master root scale `0.64`。门洞 2.155m、园墙 2.946m、门槛 0.09m、成人 1.693m 继续使用既有真实测量；所有 Gameplay Anchor Y 与序章 scale audit/spawn/interaction 已绑定统一常量。`measure-master-scale.py` 新增 door/wall/railing/table/step/windowSill 六类真实 Blender 候选及 Runtime 米制 bounds 输出，缺类明确进入 `missingReferenceCategories`，不填猜测值。三张尺度截图姿势已存在但本轮无法重抓；栏杆/桌面/台阶/窗台实际数值与视觉验收因 WSL `/bin/bash` 阻塞保持 MEASUREMENT/VERIFY-DEFERRED |
| 016 | DONE / VERIFY-DEFERRED | 新增 `runtime/player-calibration.ts` 作为 Capsule / feet / eyeHeight / FOV / step / slope 单一身体尺度源；正式 `PhysicsController` 与旧 dev `PlayerPhysics` 已统一 Capsule 1.74m、autostep 0.28m、snap 0.22m、42°/48° slope，不再保留第二套身体参数。`PlayerAvatar` feet 改由 Capsule 几何推导；CameraRig 统一成人参考眼高约 1.64m、exploration 65°、investigation 58°，序章旧 70° FOV 与独立 eyeHeight 覆盖已删除。Prologue/Game/North/Missing/Chapter5/Finale spawn 均绑定统一 Capsule 中心高度，第一～三章交互距离改从实际 camera position 计算。已更新 CameraRig / PlayerAvatar 回归测试并建立 `player-body-camera-calibration.md`；运行与成人门洞视觉验收受 WSL `/bin/bash` 阻塞 |
| 017 | DONE | `architecture-collision.ts` 输出 Mesh/候选/排除/区域/路线报告；删除 96 静默上限；六个正式 Runtime 共用注册链；Physics 分类计数与浏览器门禁已接入。29 项碰撞/路线测试、七锚点 debugMap 与连续行走通过，证据见 `collider-coverage-map.md` |
| 018 | DONE / VERIFY-DEFERRED | 正门/月洞门复合 Box、门槛 autostep、C 区 `214b32a0.o` 木阶/栏杆 trimesh 已进入六个正式 Runtime；专项审计不会再覆盖 phase-one acceptance。当前版本浏览器专项重跑由本地 Windows runner 补验 |
| 019 | DONE / VERIFY-DEFERRED | `PLAYER_MOVEMENT_CALIBRATION` 统一正式/开发物理参数；`PhysicsController` 与 `PlayerPhysics` 均为 grounded-only jump，Space 已进入六个正式 3D Runtime 与 Mechanics Playground；新增 shared jump test。实机跳跃/台阶/progression-lock 组合验证由本地补跑 |
| 020 | DONE / VERIFY-DEFERRED | 第一人称 `CameraRig` 已由六个正式 Runtime 统一注入 `PhysicsController`；investigation 前移经 Rapier `cameraSafeDistance()`，并按当前 cognition collision group 过滤。新增认知墙 camera obstruction 防回归；贴墙/窄廊实机视觉验收待本地补跑 |
| 021 | DONE / VERIFY-DEFERRED | `worldPoseToMapPose()` 现为 MiniMap / FullMap 唯一世界位置+yaw变换；八方向合同与共享位置变换测试已纳入 content gate。现场右转同向截图待本地补验 |
| 022 | DONE / VERIFY-DEFERRED | 新增 `ObjectiveTargetRef` / `objective-target.ts`；第一/二章正式 objectives 已迁移 anchor/interactable/trigger ID，GameRuntime 的 world marker、方向距离与 map target 共用解析结果；第一章搜索范围也从实际 trace points 派生。浏览器 world/map 双截图待本地补验 |
| 023 | DONE / VERIFY-DEFERRED | 存档升级为单一 schema v3 / `garden-of-shadows.save.v3`，不迁移旧 schema；`campaign-progress.ts` 成为七章 completion/unlock/ending 唯一入口，所有 Runtime 已移除各自手写 completed/unlocked 逻辑。每章固定 `${chapterId}.complete`，旧 `prologue.complete` / `west.chapter.complete` / `north.chapter.complete` 兼容 flag 已删除；checkpoint 统一序列化 cognition、evidence、borrow、contradiction、objective、dialogue、chase 与 finale state。新增 progression/save/mechanics contracts；npm/typecheck 因当前 WSL `/bin/bash` 缺失统一 VERIFY-DEFERRED |
| 024 | DONE / VERIFY-DEFERRED | New Game 与从序章 Restart 统一回到干净 campaign，仅保留 settings；Continue 保留 `tutorial.controls.seen`；Tutorial 状态压缩为单一 `seen` 真值，删除冗余 `autoShow` 与“不要再显示”双状态。`tutorial-state.ts` 统一显示/确认语义，Prologue/Game Runtime 已接入；QA chapter jump 使用隔离内存存档且预标记 tutorial seen，不写正式 SAVE_KEY。新增 tutorial/campaign/QA contracts；当前 npm/typecheck 仍因 WSL `/bin/bash` 缺失统一 VERIFY-DEFERRED |
| 025 | DONE / VERIFY-DEFERRED | 正式首页保持唯一案卷目录入口，只含继续/新游戏/章节/设置/制作人员；首屏新增“中式悬疑 · 第一人称 3D 调查 · 空间叙事解谜”与不剧透案件简介，默认高亮当前继续/开始项。继续复用正式 `hero-hearing-rain.png` 场景主视觉；旧 Hero/SiteNav/CaseGrid/Roadmap CSS 与响应式残留已删除，正式首页源码无 Roadmap/V0.x/Development 面板。5 秒识别与最终视觉截图待本地浏览器补验 |
| 026 | DONE / VERIFY-DEFERRED | 新增单一职责 `ui/ExplorationHud.tsx`，序章/第一章/第二章/第三章统一为目标 + 可选 MiniMap + 弱准星 + 近距 `[F]` 交互 + 底部短句；持久“当前证词”、修正进度、观察统计与桌面控制条已移出常驻 HUD。交互 action 文案不再硬编码 `[F]`，按键由 HUD 统一渲染；目标标题/说明均单行截断，旧 memory/case-progress/chapter-test-route CSS 与隐藏状态 DOM 已删除。Runtime 顶栏改为弱化中央章节名 + 右上返回入口，使左上只承载当前目标；实际 UI 数量/遮挡截图待本地浏览器统一补验 |
| 027 | DONE / VERIFY-DEFERRED | `content-schema.ts` 现为 spoken / inner / narration / action 等唯一表现语义源；`dialogue.ts` 强制每条 Ink 显式合法 speaker/kind/line，禁止 narrator 作为 spoken，并从非 spoken 物理剥离 voice/portrait。`DialogueRunner` 删除旧 `defaultRightSpeaker` 双立绘推断与 `any` 构造分支，只按当前 spoken 角色渲染姓名/已有正式立绘；inner 固定中文括号与独立样式，narration/action 无人物名和头像，历史记录通过 `data-line-kind` 保留类型。序章自定义剧情卡已改为复用 `NarrativeInline`，不再自造“旁白/演出/环境”伪 speaker，inner 也不再显示角色立绘。新增 `narrative-semantics.test.ts` 扫描六份 canonical Ink；缺失的沈老爷/柳生/老周 guilty 专用正式立绘保持显式 ART BLOCK，不用错误肖像替代。npm/typecheck 仍被当前 WSL `/bin/bash` 缺失阻断，实际视觉/测试统一 VERIFY-DEFERRED |
| 028 | DONE / VERIFY-DEFERRED | 玩家层已统一到 `ui/CaseFilePanel.tsx`：证物 / 人物 / 问题 / 地图 / 回顾五类信息保持单一入口，七段正式 Runtime 均接入 `CaseFilePanel` 与 N 键访问。第一章旧 `notebookRef` / `showNotebook` / 第二套 KeyN / notebook JSX 与 `.notebook*` CSS 已物理删除，不再保留第二套玩家产品；案卷打开时各 Runtime 均清空/阻断移动输入并暂停对话或引导计时。新增 `case-file-architecture.test.ts` 防止旧 Notebook 回生。目标测试已实际发起，但当前 CodexPro bash 仍在 npm 进入前被 WSL `/bin/bash` 缺失阻断，因此运行与视觉验收统一 VERIFY-DEFERRED |
| 029 | DONE | 共享 `DocumentViewer` 已支持键鼠翻页、缩放、主动关闭、页位提示与 paperScratch 翻页回调；ledger / record / letter 拥有明确不同的装订、划格和折痕样式。序章依 V5 呈现六点十分与纸角浅压痕，但明确不显示压痕原数字、修改人或目的；第二章把平视记录与侧光逆毛保留为两页，可任意往返，三份 V5 时间事实同页呈现。三份正式文书均可从统一案卷重新打开扫描件；`document-content.test.ts` 锁定分章信息边界、双页变化与案卷留存合同 |
| 030 | DONE | `DialogueRunner` 的每项选择现为独立编号纸签，显示“选择回应方式”而非黏成正文；支持方向键循环、Home/End、数字键直选、回车/空格确认与鼠标 hover/focus。选择后立即保存 Ink 状态，再推进分支，避免终止型选择重开后重复。当前 V5 正式母稿没有玩家对白选择，未擅自新增会改变案件事实的分支；该 UI 在出现作者定义选项时只改变既有分支，不改固定事实。`choice-navigation.test.ts` 锁定键盘与即时存档合同 |
| 031 | DONE | `FullMap` 已改为全幅摊开园图：移除大侧栏，手绘资产占据主要可视面积；玩家朝向、当前位置、已知区域、当前调查点与搜索范围均直接标在地图上，目标和世界仍复用 TASK-022 同源坐标。`discoveredMapRoute()` 只绘制已走区域路线，未解锁区域由墨色遮蔽且不泄露内部地点；顶部只保留当前位置，底部任务签与收图操作保持轻量。八方向合同与新增已知路线测试共同锁定地图语义 |
| 032 | DONE / VERIFY-DEFERRED | `GameSettings.textScale` 已加入标准/大字两档并兼容旧 v3 存档，根页面把选择应用到全局中文层级 token；首页与游戏内设置均可即时调整。speaker、对话正文、行走字幕、目标、交互提示、选择纸签、案卷事实和文书正文已统一字号/行距/对比度。字幕设置纠正为“行走字幕”，只隐藏探索短句与提示，不能误删无配音时仍必须阅读的主剧情；对话速度只控制逐字显示，文书和关键文字继续由玩家主动推进。1080p/1440p/DPR 截图由 TASK-057 最终验收 |
| 033 | DONE / VERIFY-DEFERRED | `InteractionController` 已统一真实模型与隐形逻辑代理的注册协议，并增加单一中心射线的两段距离语义：中距（交互距离 1.7 倍内）只对当前真实物件施加克制暖色材质提示，近距才返回 `canInteract`、显示 HUD `[F] + 具体动作/对象名` 并允许触发。焦点切换、禁用、面板打开与销毁都会精确恢复原材质并触发 blur，同屏最多一个物件获得提示；序章画像/旧箱、第一章痕迹/漏窗/踏石/奖励、第二章旧画、第三章四类认知痕迹/重构房间/旧盒均绑定实际视觉根节点，没有正式模型的茶具/登记纸/NPC 仍保持资产阻塞而未用 primitive 冒充。第二、三章只聚焦当前剧情可调查项；世界 marker 默认不可见，仍只在 90 秒后级引导出现。专项 4 文件 14 tests 与 typecheck 已通过；“多数证物无需 marker 可发现”的实机截图/盲走验收并入 TASK-057。 |
| 034 | DONE / VERIFY-DEFERRED | 新增共享 `ObjectInspectionController` 与 `ObjectInspector`：从真实世界 Object3D 建立独立材质克隆，保持原几何与世界物件来源；物件在现有相机前自动归一化，可拖动/方向键旋转、滚轮/加减缩放，并以局部方向 + facing threshold 定义必须转到视线前才能记录的关键观察区。第一章四类现场痕迹观察后才写 `discoveredEvidence`，正式踏石先拿起确认再执行 Borrow；第三章正式旧盒先检查生锈锁孔，再用老周旧钥匙进入身份剧情。检视期间移动/跳跃/切换认知/引导计时/世界焦点均暂停，退出只移除 camera child clone，不改变玩家位置、yaw/pitch 或相机世界姿态。纸面证据继续路由 TASK-029 DocumentViewer。当前资产库没有可合法绑定的伞/鞋/钥匙 3D 模型，框架类型与合同已覆盖三类但正式实例不得用 primitive 冒充；V5 序章本身为旧画像/旧箱/离家记录，相关资产闭环转 TASK-044/057 实机验收。 |
| 035 | DONE / VERIFY-DEFERRED | `mechanics/types.ts` 的 `EvidenceDefinition` 已拆分 id、channel、`observableFacts`、source/location、relatedCharacters、discoveredFlag、optional protagonistReaction、relatedQuestionIds；`EvidenceLedger` 保持这些字段的防御性复制，原始证据卡 `interpretations` 为空，不再用单一 description 混写事实与结论。`runtime/case-file-content.ts` 已把序章～第四章现场事实归入同一结构，并补齐第四章装箱旧物、封死侧路、离开安排材料、画框背后原画、未寄出的信五条正式证据；“为什么删除”“为什么折返”等结论独立进入 Questions，由多条 flag/章节事实解锁。`case-file-content.test.ts` 增加第四章保护计划证据合同。目标测试已发起但受 WSL `/bin/bash` 缺失阻断，故运行验证仍 VERIFY-DEFERRED |
| 036 | DONE / VERIFY-DEFERRED | V5 剧情真相源已取代旧计划中的“旧伞/旧鞋/入园簿”序章组合，正式序章严格实现为前厅旧画像、凉掉的茶与桂花糕、沈夫人旧箱和离家登记：画像可主动靠近检查修补处；前厅完整演出结束时，茶点客观事实与画像分别写入案卷（修复此前茶点演出存在但 flag 永远未写入的问题）；旧箱使用已授权正式 `IncenseBox_LP`，离家纸张统一进入 TASK-029 DocumentViewer。记录依 V5 保留六点十分与浅压痕，但不提前揭露原数字、修改人或目的。旧伞刻字/旧鞋磨损不在 V5 序章正文，禁止为了满足旧任务措辞复活被剧情真相源覆盖的线索；茶点正式实物模型仍由 TASK-044 release blocker 负责，最终前厅实机验收转 TASK-057。 |
| 037 | DONE / VERIFY-DEFERRED | 第一章现已按 V5 明确串成“沈夫人先给出完整墙面→到西院听老周描述侧路→玩家分别拿起观察水痕/泥印/灯架擦痕/折枝→同地点核对两份证词→亲自走入老周版本并被送回→检查重复出现且右下角破损的漏窗→从老周版本借看沈夫人记忆中的青石→切回沈夫人拿起确认→锚在循环落脚点→回老周版本验证仍存在→进入夹院检查旧脚印”。修复了 `gardener-corridor-loop` 触发体与 `corridor-count` 调查点完全重叠、玩家尚未按 F 就被传走的流程死点：物理触发仍在 ROUTE_03，调查点移动到传送后的 A_BASELINE，并在首次真实回环前拒绝提前确认；目标方位也会在回环前指向入口、回环后指向重复地标。新增破损漏窗认知线稿和短暂“同一位置：A→B”切换反馈；Borrowed View 只允许在老周认知通过漏窗观察，不能从沈夫人侧对着不可见代理绕过。未锚定踏石切认知仍销毁，已锚定物件与 collider 跨认知稳定；章末湿脚印作为独立 ObjectInspector 事实写入案卷并打开“是否折返”新问题。专项路线/视觉/V5/检视测试通过；无提示首次玩家能否自行解释 Borrow/Anchor 仍转 TASK-054/057 实机验收。 |
| 038 | DONE / VERIFY-DEFERRED | 第二章的三种取证现已形成互不替代的操作：第六杯保留为主宅茶桌上的生活痕迹入口（正式茶具仍由 TASK-044 资产门禁阻塞，不以 Cylinder 冒充）、离园记录必须在 `DocumentViewer` 中主动阅读、雨夜人影必须切到柳生认知并复现特定观看角度。三条事实归档后会直接打开统一案卷的“问题”页，以“生活痕迹 / 文字记录 / 图像框景”三张来源卡交叉核对；玩家确认后才进入 V5 的前厅归纳对话并在对话完成后写入 `north.fifth-person.confirmed`。正式 Runtime 已删除世界中的 `fifth-person-board` 交互、B_MISSING_ROOM 假总结点及其方向/世界标记，文案只确认“第五人存在”，不提前判断身份或责任。专项 5 文件 20 tests、typecheck、lint 已通过（lint 仅有既存 4 条 warning）；实机茶桌陈设验收随 TASK-044。 |
| 039 | DONE / VERIFY-DEFERRED | 第三章现按 V5 让四份认知各自固定不可替代的条件：老周的门槛/门轴、柳生旧画的窗、钱先生丈量出的完整缺失体积、沈夫人的床/矮书桌/箱子生活位置；门窗线段和地面房间轮廓会在取得后保留，玩家能在正式 Master 北墙区域看见“这里少了一块”。四条件齐备后不再出现 Box/Ghost room 或系统结论弹窗：已许可 `tyx-arch-house-a` 正式房屋壳在 2.6 秒内从轻微错位逐渐对齐并恢复为不透明实体材质，结构认知线同步退场，普通暖光与正式儿童房 CG 保持生活化气氛，V5 原文对话在对齐过程中继续演出；床下正式旧盒只在房间对话结束后出现，并沿 TASK-034 观察小锁、使用旧钥匙后才进入身份段落。床、矮书桌、发夹、校徽、生日卡、童鞋等独立正式近景资产仍由 TASK-045 补齐，当前绝不用 Box primitive 伪造；专项 3 文件 13 tests、typecheck、lint 已通过（lint 仅有既存 4 条 warning），0–3m 实机视觉验收随 TASK-045。 |
| 040 | DONE / VERIFY-DEFERRED | 正式探索 Runtime 已统一为 0–20 秒只显示目标与环境、20 秒出现轻量方向/距离、45 秒出现自然对白或赵映心理提示、90 秒才显示世界提示；`ObjectiveDirector` 与各章节共用同一阈值函数。新增 3.2m 静默区和 8m 方向区：玩家已明显接近目标时会把提示自动降为无提示或仅方向，不再继续把世界标记压在交互物上。第一、二、三、五章均补齐方向层，主流程 20 秒不再提前弹文字答案，第五章改用统一 `ExplorationHud` 与心理提示。所有正式 Master 世界提示都使用低透明度 `Guidance_SoftPatch` subtle 样式，目标切换、任务完成、面板/对话或终章都会即时清理；专项 4 文件 10 tests、typecheck、lint 已通过（lint 仅有既存 4 条 warning），90 秒实机视觉与提示音质验收并入 TASK-057。 |
| 041 | AUDIT | 剧情 Beat→完整园林路线 |
| 042 | AUDIT | 区域记忆地标/正常→异常→回访 |
| 043 | AUDIT | 老周/NPC 正式世界模型 |
| 044 | AUDIT | 核心证物资产 |
| 045 | AUDIT | 北楼/儿童房白盒资产 |
| 046 | AUDIT | PBR 地面/水体/湿石 |
| 047 | AUDIT | 灯光/雾/阴影/后处理 |
| 048 | AUDIT | Marker/箭头/距离视觉清理 |
| 049 | AUDIT | 分区环境声 |
| 050 | AUDIT | 交互音效 |
| 051 | PARTIAL | 8 CG 注册 + Viewer/Runtime 引用已存在；待完整节点验收 |
| 052 | AUDIT | 性能/资产加载/WebGPU/WebGL2 |
| 053 | AUDIT | 最终视觉与 fallback |
| 054 | TODO | 必须由真实首次玩家盲测；当前尚不能宣称完成 |
| 055 | AUDIT | 可先自动/静态 QA，最终需 walkthrough |
| 056 | AUDIT | 自动 + 人工组合回归 |
| 057 | AUDIT | UI 截图 QA |
| 058 | AUDIT | 存档/章节/失败恢复 QA |
| 059 | VERIFY | 演示设备/浏览器/分辨率最终验证依赖实际设备 |
| 060 | TODO | 最终发布门禁；在前置范围闭合前禁止 DONE |

---

## 3. 顺序关闭规则

本矩阵不再定义另一套“P0 分组跳转顺序”。执行顺序只来自 `游园惊梦_重构TASK执行计划_V1.0.md` 和 `EXECUTION_PROTOCOL.md`：从最前一个未闭环 TASK 开始，一个 TASK 完成后，立即反向更新它覆盖的问题行，再进入下一个 TASK。

P0/P1/P2 仍用于判断问题严重性和发布门禁，但**不得用来跳过编号靠前、尚未闭环的 TASK**。一个问题跨多个 TASK 时，只有最后一个必要 TASK 及其运行证据都满足后，问题行才能从 `PARTIAL/AUDIT` 升级为 `DONE`。
