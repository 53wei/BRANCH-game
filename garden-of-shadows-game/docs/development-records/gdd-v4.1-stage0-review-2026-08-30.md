# GDD V4.1 Stage 0 提取与复核记录

日期：2026-08-30  
源文件：`游园惊梦_完整GDD_V4.1_认知结局系统补强版_Master_Source_of_Truth.docx`  
提取文件：`docs/gdd/GDD_V4.1_extracted.md`  
源文件 SHA-256：`4a7887d28d94864e3fa20094752462b8464369345a21dcb06615a5238323e894`

## 提取完整性

- 使用标准库 OOXML 提取器读取 `word/document.xml` 与 `word/styles.xml`。
- 按原文档顺序保留标题层级、正文段落与表格主要文本。
- 提取后源 DOCX 的 SHA-256 与提取前一致，原件未修改。
- 提取结果包含 4,406 行、约 67,466 个文本字符（UTF-8 Markdown 文件约 126,915 bytes）。

## 重点复核结论

### 与本轮计划一致

- Cognition Switch 必须同步视觉、碰撞、交互、灯光、音频和谜题状态，不能只是滤镜。
- Loop 第一版采用遮挡、Sensor 与成对变换，保留朝向、移动意图和连续音频。
- Borrow 仅允许白名单构件，并必须生成有真实碰撞的 Runtime 实例。
- Anchor 第一版只有一个槽位；锚定后构件跨认知存在，并支持 reset、checkpoint 和 softlock recovery。
- Evidence 只保存可观察事实，不写入“谁撒谎”；重大结论依赖多通道证据。
- Reconstruction Trace 记录玩家实际使用、保留和组合认知的行为，不恢复 Trust UI。
- 五种结局家族共享案件硬事实；Composite 不是 True Ending。
- 第一章机制链明确为 Switch → Loop → Borrowed View → Borrow → Anchor → 夹院脚印。
- Save 必须持久化 current cognition、evidence、puzzle、anchor、reconstruction trace、doors 和 narrative gates 等逻辑状态，不保存 Runtime Mesh JSON。
- 性能必须先做浏览器 Profile，再针对真正瓶颈优化。

### 明确冲突及裁决

| 主题 | GDD V4.1 | 本轮明确指令 | 本轮裁决 |
| --- | --- | --- | --- |
| 默认镜头 | 第三人称探索、第一人称调查 | 默认 Gameplay 全程第一人称 | 使用第一人称；保留未来第三人称所需的空间净空与接口兼容性 |
| 序章标题与细节 | 《回园》，旧 Beat 结构 | 《你没有回来》，按最终 Master 重排 Beat | 使用本轮 6–8 分钟新序章；保留“先建立正常空间基线，再出现第一根异常”的产品目标 |
| 空间映射 | 文档中的西院/水榭为设计映射 | 最终 Master Scene 是空间事实 | 先实测 Master，再把相同叙事功能迁入最合适的实际空间 |
| 总时长 | Demo 为更大范围目标 | 序章 + 第一章首次正常游玩至少 15 分钟，推荐 17–22 分钟 | 以本轮时长 Gate 为准，禁止用被动等待填充 |

## Stage 0 Gate

状态：PASS。

进入 Stage 1 时继续受以下约束：Master Scene 空间事实优先；不猜主门坐标；不修改原 DOCX；不推进第二章及 ROUTE_05～07。
