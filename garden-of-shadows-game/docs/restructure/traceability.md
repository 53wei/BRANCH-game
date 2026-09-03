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
| 地图朝向 | `runtime/map-config.ts` 有统一 yaw→map 变换；`map-config.test.ts` 有八方向测试 | PARTIAL：待现场右转/地图同向验收 |
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
| UI-04 | P0 | 对话可读性差 | 027, 032, 057 | AUDIT | 待 CSS / 1080p 截图核验 | speaker/正文/选项 1080p 可读 |
| UI-05 | P1 | 三个选项粘在一起 | 030, 032, 057 | AUDIT | 待选择 UI 实现审计 | 选项为独立可辨卡片/纸签 |
| UI-06 | P0 | 开发术语/英文过量 | 014, 025, 026, 032, 053, 057 | PARTIAL | TASK-014 已清理正式 UI 中的 `NarrativeChapterRuntime`、旧追逐说明、“剧情与系统”、终章“一周目/认知媒介”等元语言；`debugGameplay/visualUi` 仅 development 可启用。后续 UI/视觉任务继续做全屏幕验收 | 正式试玩无 Runtime / Development / V0.x / Roadmap |
| UI-07 | P0 | 首页像开发 Roadmap | 025, 014, 057 | PARTIAL | TASK-014 静态确认首页正式入口为继续/新游戏/章节/设置/制作人员，当前 `app/page.tsx` 无 Roadmap/Development/V0.x 玩家文案；最终版式与 5 秒截图测试仍由 TASK-025/057 关闭 | 5 秒内知道游戏类型与入口 |
| UI-08 | P1 | 多套证据弹窗割裂 | 028, 029, 034, 035, 057 | AUDIT | EvidenceLedger / Notebook / modal 需统一核验 | 调查结果统一进入案卷体系 |
| DOC-01 | P1 | 入园簿不像一本簿 | 029, 036, 044 | AUDIT | 需查 paper evidence / asset / interaction | 不看标题也能识别旧登记簿 |
| DOC-02 | P0 | 四人/五人变化太快 | 029, 038, 051, 057 | AUDIT | CG Viewer 支持主动 continue 的实现线索存在 | 变化前后均可查看，关键变化不固定短计时消失 |
| TASK-01 | P0 | “确认3处空间参照”像策划语言 | 007, 026, 040 | AUDIT | 序章 guidance 文案已改动，需 player-facing 搜索 | 任务以剧情动机表达，不暴露 landmark 术语 |
| TASK-02 | P0 | “转角灯”等目标与世界不一致 | 033, 041, 042, 044 | AUDIT | 需目标名称/坐标/世界模型一致性审计 | 玩家自然用相同词描述目标 |
| TASK-03 | P0 | 任务缺因果 | 007～013, 041 | AUDIT | 需章节 Flow 逐任务核验 | 所有任务均由前一剧情动作产生 |
| TASK-04 | P0 | 任务都挤在入口 | 007, 041, 042 | AUDIT | 已有 gameplay route 及多区域记录，需对剧情 Beat 核验 | 序章形成进入—深入—回访旅程 |
| INV-01 | P0 | 调查=按 F 弹文字 | 033～039 | AUDIT | Mechanics / inspection 已新增大量实现，需 Runtime 绑定审计 | 至少 3 类核心证物有物件级调查过程 |
| INV-02 | P1 | 目标只有提示后才可发现 | 033, 040, 048 | AUDIT | 需 Interaction Focus + outline + marker 状态审计 | 关闭 marker 时多数主要调查物仍可发现 |
| INV-03 | P0 | 常驻黄色地面圈 | 040, 048 | PARTIAL | 20/45/90 延迟逻辑已证实；`TingYuXuanScene` / `NorthTowerScene` 仍有 guidanceMarker，需要确认默认 0～90s 不显示且视觉已弱化 | 接任务瞬间无黄色工程圈，90s 才低干扰出现 |
| INV-04 | P1 | 证词/勘误进度像仪器 | 026, 028, 037, 048 | AUDIT | 待 HUD / Notebook / cognition UI 审计 | 正常探索不被认知仪表覆盖 |
| MAP-01 | P0 | 右转箭头左转 | 021, 056 | PARTIAL | `worldYawToMapDegrees()` + 八方向测试已存在 | 自动测试通过 + 现场右转同向 |
| MAP-02 | P0 | 地图路线与实际走法不一致 | 022, 041, 056 | AUDIT | `MAP_ROUTE` 已直接来自 `tingYuXuanRouteAnchors`，这是正确方向；仍需目标/marker 同源核验 | 地图目标、世界目标、实际路径同源 |
| MAP-03 | P1 | 全地图像后台 | 031, 032, 057 | AUDIT | `FullMap`/地图图像资产已存在，待视觉核验 | 第一视觉焦点是园林图而非侧栏 |
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
| PHY-01 | P0 | 可穿墙/房屋 | 017, 018, 056 | PARTIAL | TASK-017 已统一六个 3D Runtime 的 Master→简化 Collider→Rapier 注册；逐墙 0.08m 穿越反测、七锚点截图和 26.543s 连续路线均通过。特殊门洞/栏杆/台阶仍由 TASK-018 关闭 | 所有正式墙体不可穿，门洞可通行 |
| PHY-02 | P0 | 修墙后门洞被封死 | 018, 056 | AUDIT | 需门框 collider 结构核验 | 门洞保持可通行，无整块封死 collider |
| PHY-03 | P0 | 相机穿墙 | 020, 056 | AUDIT | `CameraRig.ts` 已存在，需 obstruction 绑定 + 现场核验 | 贴墙 360° 不看见建筑内部 |
| PHY-04 | P1 | 不能跳 | 019, 056 | AUDIT | `PlayerPhysics.ts` 已存在，需 jump/grounded 核验 | 地面可小跳，空中不可无限跳 |
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
| 018 | AUDIT | 门洞/台阶/栏杆 collider |
| 019 | PARTIAL | 已由 `PhysicsController` 统一接管重力/grounded 小跳，Space 已接入序章与一/二/三章，教程和自动测试同步；待 Runtime 实跳、台阶与 progression lock 验收 |
| 020 | AUDIT | camera obstruction |
| 021 | PARTIAL | 统一 yaw→map 函数 + 八方向测试已存在；待现场 |
| 022 | PARTIAL | MAP_ROUTE 已由 gameplay anchors 生成；仍需 objective/marker 同源核验 |
| 023 | AUDIT | 存档/章节完成/五结局状态 |
| 024 | AUDIT | New Game / Restart / Tutorial 边界 |
| 025 | AUDIT | 首页产品入口 |
| 026 | AUDIT | 常驻 HUD |
| 027 | AUDIT | 四类文本表现 |
| 028 | AUDIT | 案卷统一信息架构 |
| 029 | AUDIT | 纸面证物/入园簿 |
| 030 | AUDIT | 选择 UI |
| 031 | AUDIT | FullMap 园林地图 |
| 032 | AUDIT | 可读性/设置 |
| 033 | AUDIT | Interaction Focus |
| 034 | AUDIT | 3D 物件检视 |
| 035 | AUDIT | Evidence 数据分层 |
| 036 | AUDIT | 序章旧伞/旧鞋/入园簿 |
| 037 | AUDIT | 第一章 Borrow/Anchor 调查 |
| 038 | AUDIT | 第二章三通道证据体验 |
| 039 | AUDIT | 第三章房间重构 |
| 040 | PARTIAL | 20/45/90 核心计时已接入多个 Runtime；待视觉/降级验收 |
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
