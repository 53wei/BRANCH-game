# 《游园惊梦：四面证词》
# 序章 + 第一章 15 分钟 Playable 完整开发计划 V1.0

**版本日期：** 2026-08-30  
**目标工程：** `garden-of-shadows-game`  
**空间 Source of Truth：** `TingYuXuan_Master.blend` / `TingYuXuan_Master.glb`  
**产品体验 Source of Truth：** `游园惊梦_完整GDD_V4.1_认知结局系统补强版_Master_Source_of_Truth.docx`  
**叙事展开参考：** `游园惊梦_ND_V3.1_不可靠认知与多结局重构版.md`  
**当前地图映射参考：** `游园惊梦_最终地图剧情与Gameplay完整开发计划_V2.0.md`  
**本计划用途：** 交给本地 Codex 直接执行。先把 Runtime 基础层修到可玩，再把序章 + 第一章重编成一个至少 15 分钟、正常目标 17–22 分钟、具备完整剧情与核心认知玩法的 Vertical Slice。

---

# 0. 最高原则：不要继续修补旧路线，要基于最终 Master 重做可玩切片

当前项目不再遵循“旧剧情空间写死 → Runtime 硬套模型”的逻辑。

从本轮开始统一遵循：

```text
最终 Master Scene 是空间事实
↓
先测清楚真实门、墙、廊、院、假山、出口的位置
↓
再把剧情 Beat、证据、NPC、认知冲突映射到这些实际空间
↓
剧情可以重写，体验目标不能丢
```

## 0.1 不允许改掉的核心

以下是作者事实 / V4.1 主题层，不因空间重排而改变：

1. 玩家从游戏开始就在自己的“第五份认知”中，只是误以为这是客观现实。
2. 主角案发当晚确实回来过。
3. 主角没有推沈老爷。
4. 沈老爷在雨中木阶意外摔倒，摔倒后仍能交流。
5. 四个人后来分别从家庭生活、空间、文字记录、图像观看四个媒介中删除主角痕迹。
6. 删除主角不是单纯驱逐或栽赃，而是为了让主角离开危险源、保护主角。
7. 保护行动客观上延误了沈老爷救治，共同促成悲剧。
8. 不存在一个传统意义上的单一凶手。
9. 四份证词都不完整；人物不是简单说谎，而是“经历 → 主动修改 → 多年后真的记成另一个版本”。
10. 玩家自己的认知同样不可靠。
11. 终局由玩家一路使用、保留、锚定的认知碎片形成“第五种听雨轩”，不是系统播放唯一真相 CG。
12. 多结局改变的是认知稳定方式，不改变固定案件事实；没有 True End / Bad End 排序。

## 0.2 可以大胆改写的部分

本轮序章和第一章允许重新设计：

- 具体对白；
- NPC 站位；
- 证据数量；
- 证据具体是什么；
- 哪个院子承担哪个 Story Beat；
- Loop 发生在哪段实际曲廊 / 假山 / 转角；
- 哪扇实际门承担“有 / 无”的认知冲突；
- 哪个构件承担 Borrow / Anchor；
- 哪个小空间承担奖励点；
- 何时触发无面人；
- 灯光、声音、文字漂移的时机；
- 序章和第一章的内部节奏。

不要死守“西廊”“北楼”等旧名字。若 Master 中另一块空间更漂亮、更合理，就迁移剧情功能。

---

# 1. 本轮 Definition of Done

只有同时满足下面条件，才能说“序章 + 第一章 Vertical Slice 完成”。

## 1.1 Runtime 基础 Gate

- 默认第一人称，不显示玩家临时人偶。
- 出生点就在正式主入口门洞前约 1.2–2.0m，而不是城墙外围黑地。
- 初始朝向正对门洞内部。
- 按 W 1–3 秒能从门外正常进入 A 区。
- 没有 `prologue-pocket-*` 小笼子式空气墙。
- World Boundary 只在整张可玩地图外围。
- Architecture Collider / Progression Lock / World Boundary 三类数据严格分开。
- 门洞不被自动 AABB 墙碰撞封死。
- 玩家能走到可见墙体前约 0.3–0.5m，不能穿墙。
- 正式窗、门、格栅、屋檐、墙体、贴图不因“性能优化”被误隐藏。
- 性能问题先 Profile，不允许通过永久降画质掩盖。

## 1.2 叙事与 Gameplay Gate

正常首次游玩：

- 序章目标约 6–8 分钟。
- 第一章目标约 10–14 分钟。
- 总体目标 17–22 分钟。
- 最低通过线：首次正常路线 ≥ 15:00。
- 至少约 60% 时间是玩家主动行动：走、观察、调查、对照认知、Loop、Borrow/Anchor、逃脱，而不是被动字幕。
- 熟练玩家不能在 5–7 分钟内直接把核心流程冲完。

第一章结束时玩家必须自然得到：

> “不是夫人错、老周对；他们可能真的记得两个不同的园子。”

并留下更深一层疑问：

> “如果他们的园子都不完整，那我现在看到的这个园子，凭什么就是客观现实？”

---

# 2. P-1：先读取真正的 V4.1 DOCX，再开始大规模剧情改写

CodexPro 文本接口不能直接解析二进制 DOCX，本地 Codex 执行时必须自行提取。

## 实现

优先使用 `python-docx`；如果环境没有，就直接用 Python 标准库 `zipfile + xml.etree.ElementTree` 读取：

`游园惊梦_完整GDD_V4.1_认知结局系统补强版_Master_Source_of_Truth.docx`

提取为临时文本：

`garden-of-shadows-game/docs/gdd/GDD_V4.1_extracted.md`

要求：

- 不改原 DOCX；
- 保留标题、段落、表格主要文本；
- 搜索并重点复核：`ReconstructionProfile`、认知结局、第一人称/镜头、Borrow、Anchor、Loop、Evidence、序章、第一章、第五种听雨轩；
- 如果与本计划存在明显冲突，以 V4.1 产品目标优先，但不要违背用户本轮明确指令“默认第一人称、建模迁就剧情改为剧情迁就建模、序章+第一章至少15分钟”。

---

# 3. P0：先测真实主门，不再猜坐标

当前已知：

- `TYX_MAIN_GATE_SOUTH` 约在 Runtime `x≈9.3, z≈39.4` 一带；
- 当前 `ROUTE_01_START=[11.5,0.9,52.2]` 已经由实机截图证明错误；
- `ROUTE_02_A_ENTRY=[6.5,0.9,45.8]` 也只算旧校准数据，不再直接信任；
- 旧 `prologue-gate-lock` 在 `[7.05,1.65,46.15]`，说明过去的数据体系发生过多次迁移。

## 修改文件

- `app/game/runtime/TingYuXuanScene.ts`
- `app/game/runtime/tingyuxuan-layout.ts`
- `app/game/runtime/tingyuxuan-gameplay-map.ts`
- `app/game/PrologueRuntime.tsx`
- `scripts/assets/inspect-master-entry.mjs`（可复用/扩展）

## 任务

### P0.1 Gate Audit

在加载最终 Master 后读取 `TYX_MAIN_GATE_SOUTH`：

- world position；
- Box3 min/max；
- center；
- size；
- world quaternion；
- 门洞平面方向；
- 选定“外侧 normal”和“内侧 normal”。

如果 `TYX_MAIN_GATE_SOUTH` 是父组而不是门洞本体，递归查找 Gate / Door / WallGate 相关 child，选择能代表门洞净空的节点。

### P0.2 Debug Top View

开发态加入 `?debugLayout=1` 时的俯视审计：

同时可视化：

- Master Scene；
- 主门中心；
- 主门门洞 bounds；
- Spawn；
- ROUTE_01；
- ROUTE_02；
- World Boundary；
- Architecture Collider；
- Progression Lock；
- Memory Wall；
- A 区可玩包围范围。

颜色必须区分，禁止所有 Collider 同色。

建议：

- World Boundary：青色；
- Architecture Collider：绿色；
- Progression Lock：红色；
- Memory Wall：紫色；
- Spawn：白色；
- ROUTE：黄色 / 红色线路。

### P0.3 输出记录

产出：

`docs/development-records/entrance-gate-audit-2026-08-30.md`

写清：

- gate center；
- gate width / height；
- outside spawn candidate；
- inside entry candidate；
- yaw；
- 哪个方向是园内。

## P0 验收

必须有一张俯视图和一张第一人称门前截图。

如果仍无法一眼判断“玩家站在主门哪一侧”，停止，不继续剧情。

---

# 4. P1：探索模式彻底改成第一人称

用户本轮明确覆盖旧 `investigation.md` 中“常态第三人称”的设计。本切片默认第一人称。

## 修改文件

- `app/game/mechanics/CameraRig.ts`
- `app/game/mechanics/CameraRig.test.ts`
- `app/game/PrologueRuntime.tsx`
- `app/game/GameRuntime.tsx`
- `app/game/NorthTowerRuntime.tsx`
- `app/game/MissingRoomRuntime.tsx`
- `app/game/runtime/PlayerAvatar.ts`

## 设计

### Exploration

- camera = physics capsule centre + eye offset；
- Rapier capsule centre 当前约离地 `0.9m`；
- lens eye target：离地 `1.60–1.68m`；
- 默认先设 `1.64m`；
- 因此 eye offset 约 `+0.74m`，最终用实际 ground pose 校准；
- FOV 默认 `70°`；
- 可配置 68–74°；
- pitch `-1.15 .. 1.05 rad`；
- yaw 正常无限旋转；
- 不用 boom / shoulder offset / explorationDistance；
- 不做强 head bob；
- 不做相机漂浮；
- 不用第三人称 camera collision 缩 boom。

### Investigation

仍然第一人称：

- 文档 / 小物调查时 FOV 可收至 55–60°；
- 允许相机向焦点前移 0.1–0.25m；
- 退出后恢复相同 yaw/pitch；
- 不切到玩家背后。

### 玩家视觉模型

- `PlayerAvatar` 类保留以免破坏测试 / 将来镜面或剧情固定镜头；
- 正常 Runtime `player.root.visible=false`；
- 不再为了第一人称继续调这个临时胶囊人偶。

## 测试

- CameraRig first-person 单测；
- `player y=0.9` 时 camera y≈1.64；
- 90° / 180° 转身相机位置不绕玩家转圈；
- 靠墙不会被 boom 推回身体内部；
- investigation → exploration heading 保持；
- 实机截图不出现玩家自己的头、背、裙摆。

---

# 5. P2：重做 Spawn、门禁、空气墙和碰撞分类

## 5.1 Spawn

由 P0 测出的 gate center + outside normal 自动/半自动确定：

```text
spawn = gateCenter + outsideNormal * 1.2~2.0m
```

要求：

- 站在铺装/地面上；
- 不在墙体 AABB 内；
- 不在树干/植被卡片中；
- 不在门槛上；
- 面朝园内；
- 抬头能看到门楼；
- 老周站在门边而不是挡在相机正中央。

`ROUTE_02_A_ENTRY` 重新放到门洞内约 1.5–3m。

## 5.2 删除错误的序章小笼子

当前必须停用/删除：

- `prologue-pocket-north`
- `prologue-pocket-south`
- `prologue-pocket-east`
- `prologue-pocket-west`

它们不是用户定义的“空气墙”。

## 5.3 World Boundary

用户定义：

> 空气墙 = 围绕当前整体可玩 A+B（后续 A+B+C）外围的一圈保护边界，防止玩家跑出模型世界。

因此 World Boundary：

- 只在整个可玩区域外沿；
- 可先用大矩形；
- 边界与最外层可见园墙 / 地形留 2–5m buffer；
- 主门外必须留出开场站位空间；
- 玩家在园内靠墙时不应该先碰到空气墙。

## 5.4 Progression Lock

`prologue-gate-lock` 改名/语义明确为剧情锁。

本轮为了先验证路线：

- 默认禁用；
- 等序章对话逻辑完成后，才在“门未开放”状态启用；
- 对话结束后明确 `setColliderEnabled(..., false)`。

剧情锁不是空气墙。

## 5.5 Architecture Collider

本轮停用正式 Runtime 中的 `world.architectureCollisionBoxes()` 自动猜墙注入。

原因：复杂墙段 Box3 很容易把门洞封死。

短期：

- Ground；
- 手工确认的园墙简单 Collider；
- World Boundary；
- Memory Wall；
- Progression Lock。

中期：Blender 增加 `COLLIDER_WALL_* / COLLIDER_GATE_* / COLLIDER_GROUND_*` 低模碰撞节点，Runtime 读取专用碰撞层。

## 自动测试

新增一个真正的路径测试：

```text
Spawn
→ 连续向 Gate center 移动
→ 穿过门洞
→ 到 ROUTE_02_A_ENTRY
```

必须成功。

还要测试：

- World Boundary 不与 Spawn→Gate 路径相交；
- Progression Lock disabled 时路径通；
- Progression Lock enabled 时门前被挡；
- Memory Wall 只根据 cognition 生效；
- 玩家可走到实体墙前，但不能穿过。

---

# 6. P3：视觉基准恢复，性能问题先诊断

## 6.1 禁止事项

不要继续把以下应急改动当最终优化：

- 永久 `forceWebGL: true`；
- 永久关闭 AA；
- 永久 pixel ratio 0.65/0.78；
- 永久全部关闭阴影；
- 删除正式贴图；
- 隐藏正式 window / door / lattice / roof / wall。

## 6.2 Master Fidelity Audit

审计：

`TINGYUXUAN_MASTER_HIDDEN_NODES`

允许隐藏：

- backup；
- source template；
- 明确坏掉的 vegetation card；
- 穿过可玩区域的 backdrop；
- 调试对象。

不允许隐藏：

- 正式窗；
- 正式门；
- 正式格栅；
- 正式墙；
- 正式屋顶；
- 正式门框；
- 正式主建筑。

并验证 `prepareFormalVisual()` 不把材质改得和原 GLB 差异过大。

## 6.3 Performance Profile

新增：

`scripts/perf/profile-runtime.mjs`

同一 Spawn、同一相机、同一浏览器窗口分别测 15–20 秒：

A. 完整视觉  
B. 只关雨  
C. 只关 procedural dressing  
D. 只关额外 PointLight  
E. 只关动态 shadow  
F. WebGPU  
G. WebGL2  
H. Master-only  
I. Master + gameplay dressing

输出：

- avg FPS；
- 1% low 或 p99 frame time；
- avg/p95/p99 frame time；
- draw calls；
- triangles；
- points；
- textures；
- materials；
- lights；
- shadow caster count；
- loaded asset bytes；
- render resolution；
- pixel ratio；
- backend。

产出：

- `docs/development-records/performance-profile-2026-08-30.md`
- `docs/development-records/performance-profile-2026-08-30.json`

优先做不损画质的优化：

1. 不必要每帧对象遍历；
2. 复用材质；
3. Instancing；
4. 静态合批；
5. Frustum Culling；
6. 区域流式加载；
7. Portal 非可见时暂停；
8. 雨粒子只在相机附近更新；
9. 降低无意义透明层 overdraw；
10. 降低不影响画面的 Shadow caster 数量。

画质降级最后再讨论。

---

# 7. 新序章《你没有回来》——目标 6–8 分钟

序章不能再只在门外看三个测试物件。要建立：

1. 玩家与听雨轩的私人关系；
2. “我明明已经走了”的初始自我叙述；
3. A 区正常空间基线；
4. 第一次文字不稳定；
5. 第一次空间不稳定；
6. 第一章需要验证的问题。

## 总流程

```text
Beat 0 黑屏旧信
→ Beat 1 门前老周阻拦
→ Beat 2 进入门洞 / 前庭
→ Beat 3 A区基准空间自由调查
→ Beat 4 三组旧痕迹
→ Beat 5 第一次空间异常
→ Beat 6 老周第二次对话 / 给予认知核对原则
→ Beat 7 标题字义漂移
→ 第一章《不存在的路》
```

## Beat 0：黑屏旧信（35–55 秒）

雨声先出现，画面后出现。

正文：

> 如果你看到这封信，我应该已经死了。  
> 七年前的中元夜，有一件事被所有人记错了。  
> 你回到听雨轩以后，不要急着问谁在撒谎。  
> 先确认一件事情。  
> 你那一晚，**没有回来。**

Semantic Morph：

```text
没有回来
→ 回来过
→ 没有回来
```

第一次不解释。

Morph 视觉：墨迹轻微重写，不用 RGB glitch。

## Beat 1：门前老周（60–90 秒）

玩家第一人称站在主门前。

老周不要站正中间，站门柱 / 灯笼旁，留出门楼作为构图主体。

对白第一段：

**老周：**
> 你不该回来。

**赵映：**
> 我七年前就走了。

**老周：**
> 我知道。

**赵映：**
> 那你为什么说“回来”？

**老周：**
> 因为你上一次，也是从这道门进去的。

**赵映：**
> 我没来过。

**老周：**
> 所以我才不想让你进去。

停顿。门内传来铜铃，远处一盏灯亮。

### 轻分支 A：玩家追问

选项不是 Trust 选择，不改变真相，只改变一句回应并记录 reconstruction tag。

A1：`“你看见我进去的？”`

老周：
> 我记得我看见过。  
> 可这七年，我越来越不敢确定那是不是“看见”。

记录 `prologue.question.visual-memory`。

A2：`“为什么所有人都说我没回来？”`

老周：
> 因为后来，只有这么记，很多事才说得通。

记录 `prologue.question.documentary`。

A3：`“你到底在怕什么？”`

老周：
> 我怕的不是你。  
> 我怕这座园子还记得你。

记录 `prologue.question.spatial`。

不要显示任何“+空间倾向”UI。

## Beat 2：门开启，进入 A 区（30–50 秒）

门 / progression lock 开启。

玩家走过门洞。

老周从后面说：

> 先别急着找死人。  
> 先把你眼前的园子记清楚。

这里第一次把“记空间”变成剧情要求。

## Beat 3：A 区基准空间（90–150 秒）

必须让玩家真实走过至少 3 个 Landmark，不要用 HUD 一次性告诉答案。

由 P0 Debug Audit 后，优先从 Master 中选最漂亮、最明确的真实构图：

- `LANDMARK_GATE_BACK`：回头看到主门；
- `LANDMARK_WINDOW_ROW`：一段窗 / 漏窗，可数 4–6 个节奏重复；
- `LANDMARK_LANTERN`：一盏倾斜 / 独特灯；
- `LANDMARK_MOON_GATE`：月洞门 / 框景；
- `LANDMARK_ROCKERY`：假山转折；
- `LANDMARK_CORRIDOR_BEND`：明显曲廊拐角。

至少三处经过时只触发很轻的主角自语：

> 这段墙我记得。  
> ……至少我以为我记得。

或：

> 六扇。  
> 小时候我总觉得少一扇会更好看。

这类句子给第三章“窗数 / 房间尺寸”埋伏笔。

记录：`prologue.baseline.landmark.*`。

序章必须至少完成 3 个 baseline landmark 才能进入末尾异常。

## Beat 4：三组旧痕迹（90–150 秒）

不要三件都堆门外。

### Evidence P1：旧伞——家庭 / 身体痕迹

放在门房 / 廊下合理位置。

检查：

> 伞柄内侧刻着一个“映”字。  
> 不是你现在的笔迹。  
> 握痕却正好落在你最习惯的位置。

赵映：
> 我以前真的用过它？

记录 channel：`domestic + physical`。

### Evidence P2：入园簿——文字记录

放在门房桌 / 柜台，而不是巨大临时四脚台堵路。

显示：

> 中元夜，入园四人。

Morph：

```text
四 → 五 → 四
```

合上以后日志只记录“四人”。

记录 channel：`documentary`。

### Evidence P3：旧鞋 / 湿鞋印——空间 / 身体

不一定保留笨重鞋模型。若 Master 有门槛、泥地、石路，可以直接做一双旧鞋 + 一段鞋底磨损观察。

> 七年前的尺码，刚好合脚。  
> 鞋跟右外侧的磨损，和你现在穿的鞋一样。

记录 channel：`spatial + physical`。

要求玩家至少检查 2/3，且必须包含入园簿。

## Beat 5：第一次空间异常（45–75 秒）

这是序章新增最重要部分。

玩家已经经过一个明确 Landmark 后，再回到同一视线位置：

- 一扇刚才存在的门 / 月洞门短暂变成完整墙面；或
- 某段窗列少一扇；或
- 回廊开口短暂封死。

只持续 1–3 秒，随后恢复，或者玩家转头再看恢复。

不要直接开放完整 cognition UI。

赵映：
> ……刚才这里有门。

老周远处：
> 你确定？

赵映：
> 我刚从这里看过去。

老周：
> 那就记住你刚才看见的。  
> 等会儿再看看别人记得什么。

这一步建立：玩家自己的 baseline 也并非绝对事实。

## Beat 6：第二次和老周对话（60–90 秒）

满足：baseline≥3 + evidence≥2 + ledger + first-anomaly。

赵映：
> 如果我没回来，这些东西为什么认识我？

老周：
> 有东西留下来，不等于那个人回来过。

赵映：
> 你自己听听这句话。

老周：
> 七年前，我们四个人都知道有第五个。  
> 后来，我们四个人都记得只有四个。

赵映：
> 你到底想让我信谁？

老周：
> 谁都别先信。  
> 一个人记错，不算证据。  
> 同一个地方，两个人都记得，而且两种记法不能同时成立——  
> 你就站在那里，两边都看一遍。

赵映：
> 那我的记忆呢？

老周停顿：

> 也一样。

这句是本序章真正的主题钉子。

然后赋予第一章 cognition 切换权限。

## Beat 7：序章结尾（30–45 秒）

老周：
> 赵映。

玩家回头。

老周：
> 如果一会儿有人问你，七年前你回来过没有……  
> 你就先说没有。

赵映：
> 为什么？

老周：
> 因为他们四个都是这么记得的。

停顿：

> **包括你。**

标题：

```text
序章 · 你没有回来
       ↓
序章 · 你回来过
       ↓
第一章 · 不存在的路
```

---

# 8. 第一章《不存在的路》——目标 10–14 分钟

第一章核心不是“按 Tab 看两层贴图”，而是完整经历三次模型崩塌：

```text
模型 1：夫人和老周中一定有人撒谎
↓ 崩塌
模型 2：老周的路存在，所以老周是对的
↓ Loop 崩塌
模型 3：选一个版本走到底
↓ 崩塌
结论：必须组合两个互相矛盾但都不完整的认知
```

## 总流程

```text
1. A区自由复查 / 找行动痕迹
2. 顾蘅秋：这里从来是墙
3. 切老周：这里一直有路
4. 进入侧路
5. Loop 回到熟悉地标
6. 对照两个版本，确认两边都不完整
7. Borrowed View 先看见另一版本局部
8. Borrow 一个稳定构件
9. Anchor
10. 切 cognition，锚定构件仍存在
11. 走通混合路线
12. 进入夹院奖励点
13. 短促无面人事件 / 空间压迫
14. 打开 A→B 出口
15. 湿脚印向 B 延伸
```

## Ch1 Beat 1：先让玩家自己发现“有人走过这里”（2–3 分钟）

不要开场就让顾蘅秋站在任务点等玩家。

A 区开放一个小型半自由调查环。

至少 4 个痕迹里要求玩家确认 3 个：

### Trace A：墙脚水痕

> 水线在墙前突然断掉，却像从墙另一侧继续。

### Trace B：泥脚印

> 两三枚不完整鞋印朝墙面消失。

### Trace C：倒灯 / 灯架擦痕

> 灯架底部被向内侧拖过，不像风吹倒。

### Trace D：植物折断 / 苔痕

> 靠墙一侧的枝叶长期被人从同一高度蹭过。

这些证据不是收藏品，而是给“这里需要一条路”建立现实约束。

主角自语不要下答案：

> 如果这里一直是墙……  
> 这些东西是怎么留下的？

完成 3/4 后触发顾蘅秋出现/回声。

## Ch1 Beat 2：顾蘅秋认知（1–1.5 分钟）

顾蘅秋可以优先使用高质量 2D 证词肖像 + 场景回声，不需要马上造低质量完整 3D 人。

对白：

**顾蘅秋：**
> 这里从来没有路。

**赵映：**
> 墙脚有泥。灯也被人碰过。

**顾蘅秋：**
> 泥能留在墙边。  
> 灯也会被风吹倒。  
> 你若想找一条路，什么痕迹都能变成路。

**赵映：**
> 那这面墙后面是什么？

**顾蘅秋：**
> 还是墙。  
> 从你小时候起就是。

这里第一次正式进入 wife cognition。

要求玩家自己走到墙前，验证：

- 可见墙完整；
- collider 也完整；
- 不能穿。

### 可选追问

1. `“你为什么记得我小时候？”`

顾蘅秋：
> 我当然记得。  
> ……有些事，记得和留下，不是一回事。

记录 `domestic` 倾向轻量 tag。

2. `“如果我说这里有路呢？”`

顾蘅秋：
> 那是你把别人的路，记成了自己的。

记录 `protagonist-uncertainty`。

## Ch1 Beat 3：老周认知——路出现（1–1.5 分钟）

切到 gardener cognition 时不要整屏滤镜闪烁。

用空间变化 + 雨声 / 苔色 / 灯光让玩家感知：

- 原墙局部退成一条窄路；
- collider 同步切换；
- 老周版本的路上有长期通行痕迹。

老周：

> 这条路我走了二十年。  
> 送柴、修墙、下雨抄近路，都从这儿过。

赵映：
> 夫人说这里一直是墙。

老周：
> 她没撒谎。  
> 我也没撒谎。

赵映：
> 两句话不能同时成立。

老周：
> 句子不能。  
> 园子未必。

这句可作为第一章核心台词之一。

## Ch1 Beat 4：Loop（2–3 分钟）

玩家沿老周侧路前进。

必须利用 Master 实际空间做“看起来真的一直向前”：

- 假山遮挡；
- 曲廊拐角；
- 树 / 月洞门框景；
- 视线断开后触发 Loop teleport；
- 位置变换要保持 yaw、速度、脚步声连续。

Loop Landmark 必须在序章已经建立过记忆，优先：

- 同一盏灯；
- 同一漏窗；
- 同一块刻痕；
- 同一转角门框。

第一次回到原处，不弹“LOOP!”。

赵映：
> ……这盏灯。

继续走 5–10 秒再次出现。

赵映：
> 我没有回头。

老周：
> 我知道。

赵映：
> 你的路也走不通。

老周：
> 我只记得怎么进去。  
> 我已经记不起自己当年怎么出来了。

这句话直接对应 V4.1 老周“身体记得路线，但理由被删”的人物悲剧。

## Ch1 Beat 5：第二次对照——两个版本都缺一部分（45–75 秒）

在 Loop Landmark 原地切回 wife cognition。

玩家发现：

- 老周版本：有入口，但出口不断回环；
- 夫人版本：没有入口，但另一个东侧门洞 / 稳定构件仍存在。

主角：

> 一份记忆让我进来。  
> 另一份记忆里，出口才存在。

不要 UI 宣布答案。

## Ch1 Beat 6：Borrowed View 教学（45–75 秒）

利用真实月洞门 / 漏窗 / 框景开口做 Borrowed View。

玩家在当前 cognition 下透过框景，实时看到另一 cognition 中的局部空间。

第一版只同时激活一个 Portal，远离后暂停渲染。

目的不是炫 Portal，而是让玩家先视觉理解：

> “那边有一个我当前世界里不存在的条件。”

## Ch1 Beat 7：Borrow + Anchor 真正可玩（2–3 分钟）

必须使用现有 `BorrowAnchorController` 和 `MechanicsOrchestrator`，不要再写一套假机制。

### Borrowable 的选择规则

必须从实际 Master 场景中选一个视觉上合理、尺寸较小、能解释为“局部认知条件”的构件，例如：

- 一块门槛踏石；
- 一段窄石板；
- 一个可作为路标的石墩；
- 一扇半开的栅门状态；
- 一个能跨过小缺口的桥板。

不要借整栋房、整面大墙。

### 推荐谜题

假设实际地图中可找到一个 0.8–1.5m 的路面缺口 / 高差 / 被封 threshold：

1. wife cognition 中看见稳定踏石 / 门槛构件；
2. 通过 Borrowed View 确认它在另一 cognition 的路线位置有用；
3. F 借景；
4. 将构件放到白名单 Anchor；
5. Anchor 占唯一槽位；
6. Tab 切 gardener cognition；
7. 被锚定构件继续存在并保持 collision；
8. 玩家借此越过 Loop 断点；
9. 进入正常情况下到不了的夹院。

如果 Master 没有合适“跨坑”，就改成“保留夫人版本的东侧门槛 / 门扇开启状态”，但必须保证：

> 单一 wife 无法到达它；单一 gardener 到达后它不存在；只有组合后能通过。

### 教学文本

只在第一次失败后给一句：

> 你不需要决定哪一个是真的。  
> 只需要确认哪一部分现在有用。

这句话非常重要，它就是终章机制的缩影。

## Ch1 Beat 8：夹院奖励空间（60–100 秒）

不要解谜后立即弹“任务完成”。

给玩家一个真正的探索奖励：一个安静、小型、普通生活空间。

建议放 3 个可选叙事点：

### Reward 1：墙面旧刻痕

> 有人曾在这里用钝物刻过身高。  
> 最上面一条被磨掉了名字，只剩年份。

不告诉玩家是自己。

### Reward 2：被压住的纸条

> “雨大。别走正门。”

字迹未知。

这个纸条到第五章会被重新解释成主角当晚折返路线的一部分。

### Reward 3：湿脚印

一串只有局部的旧脚印从侧路方向进入园内，又朝 B 区方向消失。

主角：
> 七年前，有个人从这里进来。

老周：
> 也可能是从这里出去。

主角：
> 你连方向都记不清？

老周：
> 我记得我把路封了。  
> 可我已经不确定，是先有人走过，还是先有这条路。

不要提前揭示脚印就是主角。

## Ch1 Beat 9：无面人短事件（30–60 秒，可根据性能开关）

保留当前 `faceless-owner-west`，但缩短成“空间压迫 + 短促逃离”，不要长追逐拖时长。

触发条件：

- loop 已确认；
- cognition combination 已成功；
- 玩家拿到夹院湿脚印。

表现：

玩家回头时，刚刚不存在的回廊尽头出现一个没有脸的人。

它不冲脸。

远处低声叫：

> 赵映。

玩家 HUD 不显示“RUN”。老周只说：

> 别回老周的路。  
> 用另一份园子出去。

玩家利用已经理解的认知切换进入 A 东侧出口。

如果性能不足，可以第一版不做移动 AI，只做 15–20m 远处 apparition + 逼近音效 + 触发门关闭，重点是让玩家产生压力。

## Ch1 Beat 10：A→B 出口 / 第一章收束（45–75 秒）

玩家穿过东侧实际出口。

身后空间稳定下来。

地面出现 / 保留一串朝 B 区主宅延伸的湿痕。

老周 / 旁白：

> 现在你至少知道一件事。  
> 顾蘅秋记得的园子，和我记得的园子，不是同一个。

赵映：
> 可两边都有真的东西。

老周：
> 所以别再问哪边是真的。

赵映：
> 那我该问什么？

老周：
> 问那个人为什么需要这条路。

停顿。

主角看向 B 区方向的湿脚印。

标题 / Objective 更新：

> **第一章完成：不存在的路**  
> 新问题：七年前，究竟是谁从这里回来？

本轮 Slice 在 B 区边缘停止，不进入第二章正式内容。

---

# 9. 认知倾向与分支：现在就埋，但不要出现 Trust UI

现有 `MechanicsOrchestrator.profile` 已有：

- cognitionUsage；
- borrowSources；
- anchoredSources；
- evidenceDiscoveryOrder；
- evidenceChannelWeights；
- reconstructionTags。

本轮要真正用起来。

## 9.1 第一章行为记分

不是“你相信谁？”按钮。

根据玩家行为隐式记录：

### Spatial / 老周倾向

- 在 gardener cognition 停留更久；
- 主动重复走 Loop；
- 使用空间证据；
- 从 gardener 来源 Borrow。

### Domestic / 夫人倾向

- 复查家庭旧物；
- 选择保留 wife cognition 的稳定物件；
- Anchor 来自 wife；
- 回看旧刻痕 / 生活痕迹。

### Documentary

序章反复打开入园簿 / 查看日志；后续章节继续累计。

### Pictorial

通过 Borrowed View / 框景观察异认知；后续柳生章节继续累计。

### Composite

同一谜题真实使用不同认知，不让一个 cognition usage 绝对碾压；并成功 Anchor 跨认知构件。

## 9.2 保存

当前 `ReconstructionProfile` 注释写着 session-only，V4.1 最终结局要求它必须跨章节。

本轮至少：

- 把 profile 的必要字段加入 save；
- 旧存档提供默认值；
- 测试 serialize → restore 后 cognition usage / anchored source / evidence order 不丢。

如果这一步改动过大，可先建立持久化 schema 并保存序章/第一章数据，不需要本轮实现结局计算。

---

# 10. 对话系统实现原则

## 10.1 所有关键对白进入 Ink

当前 `PrologueRuntime.tsx` 大量 `gateLines / confrontationLines / farewellLines` 写死数组。

本轮建议逐步迁移到：

- `prologue-rain.ink/json`（可新建）；
- `west-onboarding.ink/json`。

Runtime 负责世界状态，Ink 负责对白和分支。

## 10.2 分支规则

允许：

- 玩家追问不同方向；
- 主角语气差异；
- 可选环境调查；
- 认知倾向记录。

不允许：

- 选择一个人“相信/不相信”；
- 选择错误导致系统惩罚；
- 选择改变固定案件事实；
- 提前泄露第五人就是玩家。

## 10.3 Semantic Morph 第一批

序章最多 4 次：

1. 信：`没有回来 → 回来过 → 没有回来`；
2. 入园簿：`四 → 五 → 四`；
3. 可选老周句：`上一次 → 这一次 → 上一次`，若过强就删；
4. 标题：`你没有回来 → 你回来过`。

第一章只增加 1 次 Level 2：

某个调查记录：

```text
这里没有路
→ 这里有过路
```

不要第一章就大量使用“祂”。

---

# 11. NPC 与角色资产策略

## 11.1 玩家

第一人称，不需要正式可见玩家模型才能完成本 Slice。

## 11.2 老周

当前临时几何人偶只允许作为短期开发代理，不允许作为视觉验收状态。

本轮 Codex 可以：

1. 先将老周在正式画面中表现为暗处轮廓 + 灯笼，减少模型暴露；
2. 同时建立角色资产任务清单，寻找明确许可的免费 / 开源人物：CC0 或 CC-BY 优先；
3. 不允许未经许可直接抓模型进发布包；
4. 优先找：中老年男性、写实/半写实、可换材质、FBX/GLB、带骨骼；
5. Mixamo 可用于动画流程，但资产许可要单独核对。

如果没有合适角色，本轮宁愿用远景剪影 / 2D 高质量肖像对话，不要再用巨大胶囊人偶正面占画面。

## 11.3 顾蘅秋

第一章可先使用：

- 证词肖像；
- 声音；
- 远处剪影；
- 回忆固定构图。

不要求本轮做正式高质量实时面部人物。

---

# 12. 任务、Anchor 与 Flag 重构

保留历史 chapter id 以兼容存档：

- `prologue-rain`
- `west-corridor-loop`

但内部 Beat 重新整理。

## 12.1 新 Gameplay Anchor 建议

不要立即给绝对坐标。先 P0 测图，再填写：

```text
GATE_MAIN_OUTSIDE
GATE_MAIN_INSIDE
A_BASELINE_GATE_VIEW
A_BASELINE_WINDOW_ROW
A_BASELINE_LANTERN
A_BASELINE_MOONGATE
A_TRACE_WATERLINE
A_TRACE_MUD
A_TRACE_LANTERN
A_TRACE_PLANT
A_WIFE_WALL
A_GARDENER_PATH_ENTRY
A_LOOP_ENTRY
A_LOOP_LANDMARK
A_BORROW_VIEW
A_BORROW_SOURCE
A_ANCHOR_TARGET
A_REWARD_COURTYARD
A_WET_FOOTPRINT
A_EAST_EXIT
B_EDGE_PREVIEW
```

现有 `ROUTE_01~04` 可保留作为粗路线 ID，但必须绑定到这些实测语义点，而不是反过来让剧情迁就旧坐标。

## 12.2 Beat Flags

序章：

```text
prologue.letter.complete
prologue.gate.dialogue.complete
prologue.entered-a
prologue.baseline.gate
prologue.baseline.window
prologue.baseline.landmark3
prologue.evidence.umbrella
prologue.evidence.ledger
prologue.evidence.shoes
prologue.first-anomaly
prologue.examiner-appointed
prologue.complete
```

第一章：

```text
west.trace.waterline
west.trace.mud
west.trace.lantern
west.trace.plant
west.trace.minimum-confirmed
west.wife-wall-observed
west.gardener-path-observed
west.contradiction.waterline
west.loop.triggered
west.loop.recognized
west.borrow-view.seen
west.borrow.used
west.anchor.used
west.cognitive-combination-used
west.reward-courtyard-entered
west.wet-footprint-found
west.faceless-event
west.a-exit-open
west.chapter.complete
```

## 12.3 Narrative Gates

Gate 1：序章第一次异常

```text
baseline landmarks >= 3
AND evidence >= 2
AND ledger seen
```

Gate 2：授予认知切换

```text
first-anomaly
AND second steward dialogue complete
```

Gate 3：Loop

```text
wife wall observed
AND gardener path observed
AND traces >= 3
```

Gate 4：Borrow/Anchor

```text
loop recognized
AND both cognition local conditions observed
```

Gate 5：A 出口

```text
cognitive-combination-used
AND reward-courtyard-entered
AND wet-footprint-found
```

---

# 13. UI / 引导

## 13.1 第一人称 HUD

保留极少元素：

- 当前目标卡；
- 中心交互提示；
- 必要时 cognition 名称 / 小图标；
- 不常驻大方向箭头。

## 13.2 World Marker

不要一路金色光柱。

第一遍探索：

- 依赖灯光、构图、声音；
- 卡住 20–30 秒后才显示 subtle ground ring；
- 再卡住才显示方向。

## 13.3 Cognition 切换

第一次教学后可以用 Tab，但 UI 文案不要是“选择真相”。

显示：

> 当前借用：顾蘅秋的记忆

或：

> 当前借用：老周的记忆

强调“借用”，不是“切到正确世界”。

---

# 14. 音频和恐怖节奏

序章 + 第一章至少设计以下 Audio Beats：

1. 黑屏纯雨声；
2. 门前雨声 + 近处屋檐滴水；
3. 门内第一次铜铃；
4. 进入 A 后雨声被墙体遮挡，形成空间层次；
5. Semantic Morph 极轻纸 / 墨摩擦；
6. 第一次空间异常时不要 jump scare，只让雨声短暂少一层；
7. wife cognition 更干净、室内感；
8. gardener cognition 更湿、苔藓、水沟、近地低频；
9. Loop 第二次重复时，同一铃声以完全相同的时机出现，让玩家自己意识到重复；
10. 无面人出现前雨声被压低，远处叫名字；
11. 进入 B 边缘后雨声重新打开，形成章节结束感。

不要用电子 glitch 音。

---

# 15. 自动测试矩阵

## 15.1 Type / Unit

- `npm run typecheck`
- `CameraRig.test.ts`
- `PlayerAvatar.test.ts`（调整为第一人称默认不可见后同步断言）
- `tingyuxuan-layout.test.ts`
- `tingyuxuan-gameplay-map.test.ts`
- `mechanics.test.ts`
- `interaction.test.ts`
- `west-chapter-walkthrough.test.ts`

## 15.2 Spawn / Gate Physics

自动移动：

```text
spawn → gate → gate-inside → A baseline
```

必须：

- 不被 World Boundary 挡；
- 不穿墙；
- 不卡门槛；
- grounded；
- 总路径长度合理。

## 15.3 Cognition Collider

同一地点：

wife：墙 collider enabled  
gardener：path collider open

切换时 collision 与视觉同帧或同 transition 完成，不允许“看见路但撞空气墙”。

## 15.4 Loop

- 第一次进入 link 成功；
- cooldown 防立即重复；
- teleport 后 heading / velocity 基本连续；
- 回到 landmark；
- 玩家离开 Loop 后不会永久反复触发。

## 15.5 Borrow / Anchor

测试：

1. 未 Borrow 不能 Anchor；
2. 非白名单不能 Borrow；
3. Borrow 后未 Anchor，切 cognition 时消失；
4. Anchor 后切 cognition 仍存在；
5. collision 仍存在；
6. reset 后恢复；
7. checkpoint save/restore 后 anchor state 正确。

## 15.6 Beat Coverage

新增一个状态测试/telemetry，要求按顺序至少发生：

```text
spawn-at-gate
→ gate-dialogue
→ enter-A
→ baseline-landmarks>=3
→ prologue-evidence>=2 + ledger
→ first-cognitive-anomaly
→ prologue-complete
→ traces>=3
→ wife-wall-observed
→ gardener-path-observed
→ loop-triggered
→ loop-recognized
→ borrowed-view-seen
→ borrow-used
→ anchor-used
→ cognitive-combination-used
→ reward-courtyard
→ wet-footprint
→ A-exit-open
→ chapter1-complete
```

缺核心 Beat 不允许标 playable complete。

---

# 16. 人工试玩与时长测试

本地 Codex 如果能启动浏览器，必须进行至少两轮。

## Round A：首次玩家模拟

从 New Game 开始，不跳过剧情，不故意速通。

记录：

- total duration；
- prologue duration；
- chapter1 duration；
- dialogue time；
- walking time；
- investigation time；
- puzzle time；
- 第一次卡住 >30s 的位置；
- 哪个目标不清楚；
- 哪段重复没有信息价值。

标准：总计 ≥ 15:00，推荐 17–22min。

## Round B：熟练速通

知道答案后合理速通核心流程。

如果 < 10min：说明核心内容本身过薄，需要增加有意义的探索 / 对照，不要用强制等待补时长。

## 玩家理解问题

试玩结束让测试者回答：

1. 七年前主角到底有没有回来？——此时应该“不确定，但明显有矛盾”。
2. 顾蘅秋和老周谁撒谎？——正确体验应该是“不能简单这么判断”。
3. Loop 说明什么？——老周版本也不完整。
4. 为什么需要 Borrow/Anchor？——因为单一认知无法走通。
5. 湿脚印是谁的？——此时还不知道。
6. 当前默认园子一定是真的吗？——玩家应该开始怀疑。

---

# 17. 视觉验收截图

至少产出：

1. `01-first-person-main-gate.png`  
   第一人称，主门完整可见，玩家不在城墙黑地。

2. `02-enter-a-zone.png`  
   穿过门洞进入 A。

3. `03-baseline-landmark.png`  
   序章正常认知地标。

4. `04-wife-wall.png`  
   同地点 wife 完整墙。

5. `05-gardener-path.png`  
   同地点 gardener 路出现。

6. `06-loop-landmark-repeat.png`  
   Loop 后重复地标。

7. `07-borrowed-view.png`  
   框景内显示另一认知。

8. `08-anchor-persist.png`  
   切认知后锚定物仍存在。

9. `09-reward-courtyard.png`  
   夹院奖励空间。

10. `10-chapter-end-footprints.png`  
    湿脚印向 B 区延伸。

另有 Debug：

11. `debug-topdown-colliders.png`

必须显示 World Boundary / Architecture / Progression / Memory 分类。

---

# 18. 文件级实施清单

预计主要修改：

## Runtime / Space

- `app/game/runtime/tingyuxuan-gameplay-map.ts`
- `app/game/runtime/tingyuxuan-layout.ts`
- `app/game/runtime/TingYuXuanScene.ts`
- `app/game/runtime/PhysicsController.ts`
- `app/game/runtime/RendererAdapter.ts`
- `app/game/runtime/RuntimeAssetLoader.ts`（只有 Profile 证明必要时）

## Camera / Interaction

- `app/game/mechanics/CameraRig.ts`
- `app/game/mechanics/CameraRig.test.ts`
- `app/game/mechanics/InteractionController.ts`

## V4.1 Mechanics

- `app/game/mechanics/MechanicsOrchestrator.ts`
- `app/game/mechanics/BorrowAnchorController.ts`
- `app/game/mechanics/CognitionController.ts`
- `app/game/mechanics/LoopController.ts`
- `app/game/mechanics/NarrativeGateController.ts`
- `app/game/mechanics/EvidenceLedger.ts`
- `app/game/mechanics/types.ts`
- `app/game/mechanics/save.ts`

## Narrative

- `app/game/PrologueRuntime.tsx`
- `app/game/GameRuntime.tsx`
- `app/game/manifests/prologue-rain.ts`
- `app/game/manifests/west-corridor.ts`
- `app/game/manifests/west-onboarding.ts`
- `app/game/narrative/west-onboarding.ink`
- `app/game/narrative/west-onboarding.json`
- 推荐新增 `app/game/narrative/prologue-rain.ink/json`
- `app/game/narrative/DialogueRunner.tsx`
- `app/game/narrative/dialogue.ts`
- `app/game/narrative/SemanticMorphText.tsx`

## Save / Campaign

- `app/game/campaign-save.ts`
- `app/game/campaign-save.test.ts`
- `app/game/manifests/campaign.ts`
- `app/game/manifests/campaign.test.ts`

## Scripts / QA

- `scripts/assets/inspect-master-entry.mjs`
- 新增 `scripts/perf/profile-runtime.mjs`
- `scripts/visual/capture-regression.mjs`
- `docs/development-records/*`

---

# 19. 强制开发顺序

本地 Codex 不要同时把所有东西乱改。

严格：

```text
Stage 0：提取 V4.1 DOCX
↓
Stage 1：主门 / Spawn / Collider Debug Audit
↓
Stage 2：第一人称 Camera + 玩家自体隐藏
↓
Stage 3：删除小空气墙 + World Boundary 重做 + 门洞走通
↓
Gate A：必须第一人称从门前走进 A
↓
Stage 4：恢复 Master 视觉基准 + Performance Profile
↓
Stage 5：序章 Beat 0–7 完整实现
↓
Gate B：序章至少约 6min，空间基线成立
↓
Stage 6：第一章痕迹调查 + wife/gardener cognition
↓
Stage 7：Loop
↓
Stage 8：Borrowed View + Borrow/Anchor
↓
Stage 9：夹院奖励 + 湿脚印 + A出口
↓
Gate C：序章+第一章正常首次游玩 >=15min
↓
Stage 10：视觉/性能收口
```

Gate A 没过，不做 Stage 5。

Gate B 没过，不做后续章节。

Gate C 没过，不进入第二章继续开发。

---

# 20. 本轮明确禁止

1. 禁止继续开发 ROUTE_05～07 / 第二章以后内容。
2. 禁止把玩家第三人称代理继续当正式画面调来调去。
3. 禁止用小型 prologue pocket 空气墙把玩家关起来。
4. 禁止为让路线通过偷偷缩小玩家 physics capsule。
5. 禁止继续凭截图肉眼猜 Spawn，而不测 `TYX_MAIN_GATE_SOUTH`。
6. 禁止自动用渲染 Mesh 大 AABB 猜所有墙并直接作为正式碰撞。
7. 禁止删除正式建筑窗、门、格栅、贴图来换性能。
8. 禁止同时关雨、阴影、降分辨率后宣称“找到性能问题”。
9. 禁止用长不可跳对白、慢速移动、重复走廊硬凑 15 分钟。
10. 禁止增加“相信夫人 / 相信老周”Trust 菜单。
11. 禁止在第一章提前宣布第五人就是玩家。
12. 禁止把 Ending E 标 True Ending。
13. 禁止在序章滥用“祂”或高频 Semantic Morph。
14. 禁止 Runtime 擅自移动 / 缩放正式 Master 建筑以迁就 Gameplay；剧情和 Anchor 要迁就 Master。

---

# 21. 本地 Codex 最终交付报告格式

完成后不要只说“通过”。必须返回：

## A. 实际空间数据

```text
gate center:
gate bounds:
spawn:
spawn yaw:
inside A anchor:
world boundary bounds:
```

## B. 第一人称

```text
camera eye height:
FOV:
player visible: false
```

## C. Collider

列出：

- World Boundary 数量；
- Architecture Collider 数量；
- Progression Lock 数量；
- Memory Wall 数量；
- 自动 architectureCollisionBoxes 是否禁用。

## D. 剧情 Beat

逐项 PASS/FAIL：

- letter morph；
- gate dialogue；
- enter A；
- baseline landmarks；
- evidence；
- first anomaly；
- wife wall；
- gardener path；
- loop；
- borrowed view；
- borrow；
- anchor；
- reward courtyard；
- footprints；
- A exit。

## E. 时长

```text
Prologue:
Chapter 1:
Total:
Active play percentage:
```

## F. 性能

提供完整 baseline 和 A/B Profile 表，不能只报一个 FPS。

## G. 截图

列出 10 张正式验收图 + 1 张 collider debug topdown 的路径。

## H. 尚未解决的问题

明确列出，不允许把 blocker 藏掉。

---

# 最终一句开发目标

本轮不是把“红色 ROUTE 01→04”跑通就算完成。

真正的目标是做出一个玩家愿意连续玩至少十五分钟的完整开场：

> **玩家在雨夜重新进入一座自己以为熟悉的园林；先发现文字不可信，再发现自己的空间记忆也不可信；接着亲自证明夫人与老周都没有一个完整答案，最后必须把两份互相矛盾的认知拼在一起，才能走出第一座院子。**

如果这个体验成立，后面第二章“多出来的人”、第三章“我的房间”、终章“第五种听雨轩”才有真正的基础。
