# 《游园惊梦：四面证词》
# 听雨轩 Master Scene 建模与空间布局执行计划 V1.0
## Blender Scene Assembly × 剧情空间硬约束 × 视觉构图 × Runtime Binding

**版本日期：** 2026-08-29  
**文档状态：** 当前正式场景 / 建模生产执行文件  
**上层产品基线：** `Master GDD V4.1`  
**配套生产计划：** `完整制作与质量迁移执行计划 V5.0`  
**空间 Source of Truth：** `TingYuXuan_Master.blend`

---

# 0. 本文件解决什么问题

这不是 Runtime 计划，也不是剧情重写。

本文件只解决：

> **听雨轩最终到底要长什么样；必须有哪些剧情空间；这些空间应该如何拼接、围合、构图、遮挡、留白；现有下载模板应该如何拆分和复用；以及怎样让 Blender 场景可以稳定接入 Runtime。**

最终目标不是：

> 做出一个“很大的中国园林模型”。

最终目标是：

> **做出一座完整、可信、漂亮，而且能真正承载《游园惊梦》剧情和核心玩法的听雨轩。**

---

# 1. 总原则

## 1.1 剧情空间优先于地图面积

听雨轩可以比剧情实际使用范围更大。

可以增加：

- 偏院；
- 小庭院；
- 杂物房；
- 额外回廊；
- 竹林；
- 小池；
- 后勤通道；
- 无强剧情用途的建筑体量。

但前提：

> **剧情关键区域必须存在，而且必须是全场景最好看的区域之一。**

宁愿：

```text
西院 / 月洞门 / 假山 / 水院 / 水榭
做得很好
```

也不要：

```text
整个地图很大
但核心剧情区只是普通模板拼接
```

## 1.2 先做空间，再做装饰

第一轮先锁：

```text
建筑位置
尺度
院落比例
路线
转折
遮挡
视线
框景
高低关系
主要地标
```

暂时不锁：

```text
所有家具
所有小摆件
所有苔藓
所有植物细节
最终灯光
最终材质损耗
```

## 1.3 听雨轩不是“走廊地图”

禁止：

```text
门
→ 长走廊
→ 房间
→ 长走廊
→ 房间
```

必须形成：

```text
压缩
→ 展开
→ 转折
→ 遮挡
→ 框景
→ 再展开
```

推荐空间节奏：

```text
正门：压缩
↓
前厅：展开
↓
曲廊：压缩
↓
西院：展开
↓
假山：压缩 / 绕行
↓
月洞门：框景
↓
夹院：小型奖励空间
↓
水院：大展开
↓
水榭：核心视觉终点
```

## 1.4 Blender 决定空间，Runtime 不重新摆建筑

正式建筑的位置、比例、角度，全部由 Blender 决定。

Three.js / Codex 不得：

- 擅自移动正式主建筑；
- 为了方便碰撞重新缩放建筑；
- 改院落比例；
- 改月洞门位置；
- 改假山遮挡；
- 改水榭视线轴。

Runtime 只绑定：

```text
Collision
Trigger
Portal
Interactable
Audio Zone
Save Anchor
NPC Point
```

---

# 2. 听雨轩总体空间形态

推荐不是“规则四合院”，而是：

> **前部较规整，中部逐渐复杂，后部由水体彻底打开。**

整体可理解为：

```text
                         北
                         ↑

             ┌───────────────────────┐
             │      北楼 / 账房       │
             │     钱先生区域         │
             └──────────┬────────────┘
                        │
               ┌────────┴────────┐
               │      前 厅       │
               │ 画像 / 茶 / 文档 │
               └────────┬────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
      内宅 / 旧居              西院 / 曲廊
             │                     │
             │                     ├── 假山 Loop
             │                     │
             │                     ├── 月洞门
             │                     │
             │                     └── 夹院
             │
             └──────────┬──────────┘
                        │
                      水院
             ┌──────────┴──────────┐
             │                     │
           水面      桥          水榭
                                  │
                               雨中木阶

                        ↓
                       南
                 正门 / 入园路径
```

这不是必须按矩形网格摆。

真正应该做的是：

> **让玩家从一个区域只能看到“下一个区域的一部分”。**

---

# 3. 主路径与非主路径

## 3.1 主剧情路径

主剧情需要保证：

```text
正门
→ 前厅
→ 西院
→ 曲廊
→ 假山
→ 月洞门
→ 夹院
→ 水院
→ 水榭
```

同时：

```text
前厅
→ 北楼 / 账房

前厅 / 西院
→ 内宅 / 旧居
```

## 3.2 非主路径

可以增加：

```text
偏门
小院
杂物间
竹林
假水沟
侧墙通道
短回廊
无人房间
后勤区
```

作用：

- 让听雨轩像真实园子；
- 增强空间厚度；
- 防止“一眼看出这是关卡”；
- 为后续章节留空间。

但不要让它们抢主路径视线。

---

# 4. 区域尺寸建议

以下全部是**制作参考值，不是硬规则**。

## 4.1 正门 Gate

形态：

```text
横向长矩形
+
门楼 / 门墙
+
进入前院的压缩空间
```

建议：

```text
宽：10–18m
深：4–8m
门洞：2.5–4m
```

视觉目标：

> 第一眼必须像“真正的园门”，而不是一块墙开一个洞。

必须有：

- 明确门楼轮廓；
- 灯笼 / 门灯；
- 湿石板；
- 门槛；
- 两侧院墙；
- 雨夜遮挡；
- 进门后不能一眼看穿整个园子。

## 4.2 前厅 Front Hall

形态：

```text
主屋
+
小型前院
+
两侧边界
```

建议：

```text
院落宽：18–28m
院落深：12–20m
主屋面宽：10–18m
```

功能：

- 管家引入；
- 家庭画像；
- 离家记录；
- 第六只茶杯；
- 后续回访。

要求：

> 必须是一个“生活过”的空间，不是空大堂。

## 4.3 西院 West Court

第一章最重要的空间基线。

建议：

```text
主开院：20–30m
局部侧空间：8–15m
至少 2 个明显转折
至少 1 个视觉 landmark
```

要求：

- 玩家第一次进入时就能形成空间记忆；
- 后面 Cognition 改变时能感知“不对”；
- 不能是完全对称院子；
- 最好有一侧回廊；
- 一侧墙 / 假山遮挡；
- 一处能远远看见 Pavilion；
- 一处能看到 Moon Gate 轮廓但不立刻进入。

## 4.4 曲廊 Corridor

建议：

```text
宽：2.5–4m
单段：5–12m
转角：45° / 90° / 非规则
```

必须：

- 不要连续 30m 一条直线；
- 至少有折角；
- 最好有漏窗 / 柱；
- 可用墙和植物制造空间遮挡。

## 4.5 假山 Rockery Loop

形态：

> **视觉复杂，实际路线简单。**

建议：

```text
占地：12–20m
有效通路：1.5–3m
视觉转折：至少 3 个
```

需要：

- 玩家不能同时看到入口和出口；
- Loop teleport 必须发生在遮挡后；
- 至少一个重复 landmark；
- 有一段空间让玩家误以为“继续往前”；
- 月洞门可在某个位置成为远处目标。

禁止：

> 用一整座固定高模假山直接塞进去，导致路线无法调整。

最好：

```text
大块 Rock
+
中块 Rock
+
墙
+
竹
+
树
+
地形
```

组合成自己的 Gameplay Rockery。

## 4.6 月洞门 Moon Gate

Hero Gameplay Asset。

建议：

```text
门洞直径：2.4–3.4m
墙厚：0.35–0.8m
门前至少 4–7m 可观察空间
```

必须：

- 正面构图好看；
- 偏一点角度也能成立；
- 门框附近不放太多杂乱植物；
- 背后空间要能支撑 Borrowed View；
- 门洞内视觉必须有明显前中后景。

月洞门不是装饰。

它是：

> **第一章最重要的“机制画面”。**

## 4.7 侧路 Side Path

建议：

```text
宽：1.5–2.8m
长：8–18m
```

要求：

- 不舒服但不是狭窄到卡镜头；
- 一侧墙、一侧石 / 植物；
- 不能一眼看到终点；
- 和“普通主路”明显不同。

## 4.8 夹院 Side Yard

建议：

```text
6–12m
```

特点：

- 小；
- 隐；
- 进入感强；
- 光线比外面安静；
- 第一章谜题后的奖励空间。

证据位置：

```text
湿脚印
门闩
倒灯
弱痕迹
```

不要塞：

```text
带血凶器
巨大尸体线索
明显杀人证据
```

## 4.9 水院 Water Court

这是整个听雨轩最大的“呼吸空间”。

建议：

```text
整体：30–50m级
水体可占 50–70%
```

形态：

> 不规则水体，不做规则长方形泳池。

需要：

- 岸线转折；
- 桥；
- 植物；
- 远处水榭；
- 一部分水面被树 / 石 / 廊遮挡。

目标：

> 玩家从狭窄假山出来后第一次真正“打开”。

## 4.10 水榭 Pavilion

Hero Asset。

建议：

```text
建筑：8–14m级
木阶：明确可见
水边至少一侧开放
```

必须：

- 从多个早期位置都能部分看见；
- 前期“看得见、暂时到不了”；
- 后期真正到达时有回收感；
- 木阶必须为第五章雨夜事件服务；
- 内部空间要允许父亲/主角对峙。

## 4.11 北楼 / 账房 North Tower

建议：

```text
2层
面宽：8–15m
较规整
```

特点：

- 比西院更“制度化”；
- 纸面记录多；
- 视觉上更直、更规整；
- 不需要像水榭一样强景观性。

## 4.12 内宅 / 旧居 Old Residence

第一版先锁：

```text
建筑体量
门
窗
院子
外墙
入口
```

不要第一轮精做室内。

第三章前再精做：

```text
儿童房
旧柜
床
盒子
旧钥匙
```

---

# 5. 剧情硬约束场景

以下空间不能删。

## S Tier — 必须最好看

### S1 正门

原因：

> 游戏第一张真正进入世界的画面。

### S2 西院

原因：

> 序章空间基线 + Ch1 核心区域。

### S3 假山 Loop

原因：

> 第一次让玩家感觉空间规则有问题。

### S4 月洞门

原因：

> Borrowed View Hero Shot。

### S5 水院 + 水榭

原因：

> 整个游戏长期视觉目标和最终事故核心。

### S6 不存在的旧房 / 儿童房

原因：

> “第五人就是我”的主反转空间。

## A Tier — 必须完整

```text
前厅
夹院
北楼 / 账房
内宅
旧居外围
曲廊
水榭内部
雨中木阶
```

## B Tier — 可以简化但要存在

```text
偏房
杂物房
小院
次级回廊
竹林
背景建筑
围墙
后勤区
```

---

# 6. 每章对空间的要求

## Prologue《回园》

必须走到：

```text
Gate
→ Front Hall
→ West Court
→ Pavilion Vista
→ First Anomaly
```

场景任务：

> 让玩家先相信这是一座“真实而正常”的园子。

## Ch1《不存在的路》

需要：

```text
West Court
→ Side Path
→ Rockery Loop
→ Moon Gate
→ Borrow Corridor
→ Side Yard
```

核心空间必须能支撑：

```text
Cognition A：没有路
Cognition B：有路但 Loop
Portal：看到另一条正确直廊
Borrow：把直廊拿出来
Anchor：让它跨 Cognition 存在
```

## Ch2《多出来的人》

需要：

```text
Front Hall / Life Space
North Tower / Record Space
Image-view location
```

必须能放：

```text
第六只茶杯
离家记录
账册
雨夜图像
被改画像
特定视角人影
```

## Ch3《不存在的房间》

需要：

```text
Old Residence exterior
Missing volume
Door fragment
Window fragment
Boundary fragment
Corridor fragment
Child room
```

建筑外部尺寸要可以制造：

> “内部空间塞不下”的余刺。

## Ch4《被删掉的人》

需要回访：

```text
Front Hall
Old Residence
North Tower
Image-related space
West Court
```

同一空间出现新的解释。

## Ch5《今晚你没回来》

必须可以连续重走：

```text
Side Path
→ Old Room
→ Pavilion
→ Wooden Steps
```

这是 Author Timeline 的空间重建。

## Finale

需要：

> 同一听雨轩通过不同 Cognition 组合重新连接，而不是加载四张完全不同地图。

所以当前所有区域最好保持：

```text
70–90% shared visual geometry
+
10–30% cognition-specific state
```

---

# 7. 下载模型模板怎么用

不再判断：

> “这个模型能不能直接当听雨轩？”

改为判断：

> **“这个模型里有什么部件值得拿走？”**

## 7.1 一个完整 Courtyard Pack 可以拆成

```text
Main Hall
Side House
Corridor
Gate
Wall
Moon Window
Roof
Stone Floor
Tree
Prop
```

只拿其中 20% 也可以。

## 7.2 推荐部件价值排序

### 第一优先

```text
完整主建筑
回廊
墙
门楼
月洞门
亭 / 水榭
```

### 第二优先

```text
桥
石板
漏窗
小门
栏杆
假山石
```

### 第三优先

```text
家具
盆栽
灯笼
装饰石
杂物
```

## 7.3 不要被“模型整体好看”绑架

如果一个完整园林：

- 主楼好；
- 廊好；
- 假山差；
- 水面差；
- 植物差；

就：

```text
保留主楼
保留廊
删除假山
删除水面
删除植物
```

---

# 8. Blender Master Scene 推荐结构

```text
TingYuXuan_Master.blend

COLLECTION
├── 00_REFERENCE
├── 01_GATE
├── 02_FRONT_HALL
├── 03_WEST_COURT
├── 04_CORRIDOR
├── 05_ROCKERY
├── 06_MOON_GATE
├── 07_SIDE_YARD
├── 08_WATER_COURT
├── 09_PAVILION
├── 10_NORTH_TOWER
├── 11_OLD_RESIDENCE
├── 20_PROPS
├── 21_VEGETATION
├── 30_GAMEPLAY_BINDINGS
├── 31_COLLIDER_PROXY
├── 32_COGNITION_VARIANTS
└── 99_DEBUG
```

---

# 9. 命名规则

## Visual

```text
VIS_Gate_Main
VIS_FrontHall_Main
VIS_WestCourt_Corridor_A
VIS_Rockery_Block_01
VIS_MoonGate_Main
VIS_Pavilion_Main
```

## Runtime Binding Empty

```text
ANCHOR_Prologue_PlayerStart
ANCHOR_WestCourt_Center
ANCHOR_CH01_LoopExit

TRIGGER_CH01_LoopEntry

PORTAL_CH01_MoonGate

INTERACT_FrontHall_Portrait
INTERACT_FrontHall_DepartureRecord
INTERACT_CH01_Footprint
INTERACT_CH01_Latch

NPC_Steward_Stop01

SAFE_CH01_SideYard

AUDIO_WestCourt
AUDIO_Rockery
AUDIO_WaterCourt

LANDMARK_PavilionVista
```

---

# 10. Empty / Binding 的摆放原则

## Anchor

放：

```text
玩家脚底位置
```

Yaw 指向：

> 玩家出生 / 到达后的默认朝向。

## Trigger

不要依赖 Visual Mesh。

用 Empty / Proxy 定义：

```text
center
size
rotation
```

## Interact

放在：

> 玩家真正应该“看”的位置。

不是模型 Pivot。

例如画像：

```text
模型 Pivot = 墙体原点
Interact Empty = 画像中心
```

## Portal

放在：

> 月洞门开口平面中心。

Orientation：

> Portal Normal 朝玩家主要观察方向。

---

# 11. Visual Mesh 和 Gameplay Geometry 分离

正式原则：

```text
Visual Mesh
≠
Collision
≠
Trigger
≠
Interaction
≠
Portal Plane
```

例如：

```text
MoonGate
├── VIS_MoonGate_Main
├── COLLIDER_MoonGate_Left
├── COLLIDER_MoonGate_Right
├── PORTAL_CH01_MoonGate
└── TRIGGER_MoonGate_Approach
```

---

# 12. Collider 生产规则

复杂建筑不直接使用高模 MeshCollider。

优先：

```text
Box
Capsule
Simple Convex
Low-poly proxy
```

假山：

> 可见模型可以非常复杂。

碰撞：

> 用少量低模 Proxy 近似。

---

# 13. 第一轮搭建顺序

## PHASE S0 — 单位和原点

必须先统一：

```text
1 Blender Unit = 1 meter
World Origin fixed
Z up
Scale applied
```

## PHASE S1 — Gate + Front Hall

目标：

> 游戏开场成立。

先完成：

```text
Gate
Wall
Front Hall
small front court
entry path
```

然后立刻进入 Runtime 看第三人称比例。

## PHASE S2 — West Court

目标：

> Ch1 正常空间基线成立。

先不用假山精模。

完成：

```text
West Court
Corridor
Walls
one tree / landmark
Moon Gate placeholder
Pavilion vista
```

## PHASE S3 — Rockery Loop

目标：

> 空间逻辑成立。

使用：

```text
rock blocks
walls
vegetation
```

搭出遮挡。

先 Playtest Loop。

然后才换更漂亮 Rock。

## PHASE S4 — Moon Gate Hero Pass

目标：

> Portal 构图成立。

至少测试：

```text
正面
左 30°
右 30°
近
远
```

Borrowed View 必须每个主要角度都不穿帮。

## PHASE S5 — Side Yard

目标：

> 第一章奖励空间。

先放：

```text
footprint zone
latch
fallen lamp
```

## PHASE S6 — Water Court + Pavilion

目标：

> 整个听雨轩视觉中心成立。

先做：

```text
water shape
shore
bridge
pavilion
steps
trees
```

不先做 water shader。

## PHASE S7 — North Tower / Old Residence Blockout

先只定：

```text
volume
entrance
height
relationship
```

Ch2 / Ch3 再精。

---

# 14. Scene Integration 状态

每区只有三个状态。

## SCENE_WIP

- 位置还会大改；
- Codex只使用 Legacy Layout / proxy。

## SCENE_INTEGRATION_READY

满足：

```text
建筑位置稳定
尺度基本稳定
主路径成立
关键 Binding Empty 已放
```

Codex可以接：

```text
Collision
Trigger
Portal
Interactable
Audio
Save Anchor
```

## SCENE_LOCKED

只有 Vertical Slice polish 前才进入。

之后大改需要同步 Runtime。

---

# 15. 每一区的验收问题

## Gate

- 第一张图够不够正式？
- 能不能感觉“进入一个真正园子”？
- 是否一眼看穿后面？

## Front Hall

- 像不像真实生活空间？
- 画像和离家记录有没有自然位置？
- 第六只茶杯后面有没有合理桌面？

## West Court

- 5 秒后能不能记住一个 landmark？
- 从两个方向看是否仍然能辨方向？
- Cognition 改变后玩家是否能感到空间不对？

## Rockery

- Loop teleport 是否被遮挡？
- 玩家是否看到复制/穿帮？
- 重复 landmark 是否合理？

## Moon Gate

- 不靠 UI 是否知道它重要？
- Portal 内有没有深度？
- 左右移动是否好看？

## Side Yard

- 进入后是否有奖励感？
- 是否过大？
- 证据是否自然？

## Water Court

- 是否真正形成大空间呼吸？
- Pavilion 是否成为视觉目标？
- 水面是否占比合理？

## Pavilion

- 从远处轮廓是否好看？
- 近处是否能支持 Ch5 对峙？
- 木阶是否足够明显？

---

# 16. 场景美术节奏

推荐：

```text
Gate
暗 / 压

Front Hall
稍亮 / 稳

West Court
冷 / 开

Rockery
暗 / 密 / 遮

Moon Gate
框景 / 聚焦

Side Yard
静 / 小

Water Court
大开 / 冷

Pavilion
暖点 / 远景
```

不是：

> 每个区域都很黑。

而是：

> 明暗、空间、密度一起变化。

---

# 17. 植物使用原则

植物不是“填空”。

作用：

```text
遮挡
分层
框景
打破硬直线
隐藏边界
制造视线引导
```

优先：

```text
竹
柳
灌木
爬藤
盆景
少量枯枝
```

避免：

> 全地图同一种树随机撒。

---

# 18. 水体原则

水院水体：

```text
不规则边界
局部岸石
桥
倒影
雨点
局部植物
```

不要：

```text
一整块 BoxGeometry
+
镜面材质
```

正式视觉最终需要：

```text
roughness variation
ripples
rain impact
subtle reflection
```

---

# 19. 雨夜构图原则

雨不是“粒子数量越多越好”。

要形成：

```text
屋檐外强雨
屋檐下弱雨
远处雾
湿石板反光
局部灯笼暖光
水面雨点
```

禁止：

> 整个画面一层统一蓝滤镜。

---

# 20. 下载模板评估表

每个模板只需要回答：

```text
1. 哪个部件值得留？
2. 比例是否适合人？
3. 材质是否能统一？
4. 能否拆？
5. 是否过于宫殿化？
6. 是否太现代？
7. 是否有明显西式结构？
8. 是否能和现有主建筑放一起？
9. Poly / texture 是否合理？
10. License 是否允许当前项目使用？
```

---

# 21. S Tier 视觉投资优先级

第一轮 polish 资源优先：

```text
1. Moon Gate
2. West Court
3. Rockery Loop
4. Water Court / Pavilion
5. Gate
6. Front Hall
```

而不是：

```text
背景偏房
杂物间
地图边缘
```

---

# 22. 与 V5.0 Runtime 任务同步关系

```text
Scene Binding Contract
↓
用户放 Named Nodes
↓
Gate / FrontHall ready
↓
Prologue Runtime
↓
WestCourt / Rockery / MoonGate ready
↓
Ch1 Runtime
↓
NorthTower / FrontHall evidence space ready
↓
Ch2 Runtime
```

两条线始终并行。

---

# 23. Blender 第一轮必须产出的东西

不是整座完整园林。

第一轮交付：

```text
TingYuXuan_Master.blend

Gate
Front Hall
West Court
Corridor
Rockery blockout
Moon Gate
Side Yard
Water Court blockout
Pavilion exterior
North Tower exterior blockout
Old Residence blockout
Named Nodes
```

---

# 24. 第一轮 Done Gate

必须满足：

### Spatial

- 主路径连续；
- 没有明显“重复走廊地图”；
- Gate / West Court / Moon Gate / Pavilion 能形成视觉记忆；
- 假山 Loop 有遮挡条件；
- Pavilion 至少从两个早期区域可见。

### Gameplay

- Ch1 Loop 路线成立；
- Moon Gate Portal 有观察距离；
- Borrow Corridor 有合理 Target；
- Side Yard 有证据空间。

### Runtime

- Named Node 可被 Runtime 读取；
- Blender 移动 Empty 后 TS 不改；
- Collision / Trigger 可以逐区替换 Legacy Layout。

### Art

- 主建筑比例正常；
- 没有明显风格冲突；
- S Tier 场景轮廓已经可看。

---

# 25. 不允许做的事情

当前阶段禁止：

1. 一次把整个地图精雕完。
2. 为了“大”无限扩园。
3. 为了省事复制同一回廊十次。
4. 让 Codex在 TS 重新摆正式建筑。
5. 让程序 Box 成为正式近景建筑。
6. 用高模直接当 Gameplay Collider。
7. 没有 Loop 测试就把假山精雕。
8. 月洞门只是装饰，没有 Portal 构图。
9. 水榭只做背景，不能实际到达。
10. Old Residence 外形和内部完全无关。
11. 因为模板整体很好就整包硬塞。
12. 为了统一风格删除所有高质量现成资产。
13. 在主空间还没成立时先做花盆、苔藓、杂物。
14. 用地图面积当完成度。
15. 用“模型很多”当美术质量。

---

# 26. 当前立即执行顺序

用户现在直接做：

```text
STEP 1
建立 TingYuXuan_Master.blend

STEP 2
导入所有候选模板
先分 Collection，不马上拼

STEP 3
从模板中挑：
Gate
Main Hall
Corridor
Wall
Moon Gate
Pavilion
Bridge
Rock pieces

STEP 4
先拼：
Gate
→ Front Hall
→ West Court

STEP 5
加：
Rockery Blockout
Moon Gate
Side Yard

STEP 6
拉开：
Water Court
Pavilion

STEP 7
放：
North Tower / Old Residence volume

STEP 8
加 Named Nodes

STEP 9
导出 Integration Ready GLB

STEP 10
浏览器第三人称走一遍
```

---

# 27. 浏览器第一次走场必须重点看

不要先看“材质够不够漂亮”。

先看：

```text
人物比例
门洞比例
院落大小
走廊宽度
路线长度
转角频率
水榭距离
月洞门视线
假山遮挡
镜头是否穿墙
第三人称是否挤
```

只要这些不对：

> 回 Blender 改。

---

# 28. Final Scene Production 未来阶段

Vertical Slice 通过后再进入：

## Phase F1 — Ch3 Old Residence Interior

儿童房 / 不存在的房间。

## Phase F2 — Ch4 Revisit Dressing

同一空间新的生活痕迹和证据。

## Phase F3 — Ch5 Rain-night Set Dressing

水榭、木阶、雨夜事故路线。

## Phase F4 — Finale Cognition Variants

不做四张地图。

使用：

```text
shared base
+
cognition-specific geometry
+
connection variants
+
lighting/audio variation
```

---

# 29. 本计划和 V5.0 的关系

```text
Master GDD V4.1
        │
        ├── V5.0
        │   Runtime / Gameplay / Narrative Production
        │
        └── Master Scene Plan V1.0
            Blender / Modeling / Layout / Composition
```

V5.0 解决：

> 游戏如何成为正确的游戏。

本文件解决：

> 听雨轩如何成为正确的听雨轩。

---

# 30. 最终标准

我们最终追求的不是：

> “这个模型很精细。”

也不是：

> “这个地图很大。”

而是：

> **玩家走进听雨轩以后，会相信这是一座完整、真实、被人生活过的江南园林；而当 Cognition 开始改变空间时，他能清楚感觉到——不是滤镜变了，而是自己记住的这座园子开始不可信了。**

这就是建模与场景布局的最终目标。
