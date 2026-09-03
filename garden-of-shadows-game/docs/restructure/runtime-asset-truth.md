# Runtime 关键资产真值表

Updated: 2026-09-02

> 本表对应 TASK-005。判断标准是“当前正式 Runtime 实际创建/加载了什么”，不是资源目录里有没有候选文件。
>
> `READY`：正式路线实际使用可发布资产；`BLOCK`：正式路线仍为 primitive/whitebox/missing；`REMOVED`：已被 V5.0 Source of Truth 从正式剧情需求移除。

| 关键对象 | 设计/剧情要求 | Runtime 当前事实 | 状态 | 关闭条件 |
|---|---|---|---|---|
| 老周世界模型 | 可识别人形；提灯；基础待机/转身/视线表演 | `PrologueRuntime.tsx` 已删除 Cylinder/Sphere 人体，只留下 `Prologue_Steward_FormalAssetAnchor` 与灯光；**尚未绑定正式人物 GLB** | BLOCK | 获取并绑定许可清晰的正式老年男性角色资产，校准比例并接 idle/视线/提灯；缺资产时继续不显示假人 |
| 赵映世界模型 | 成人尺度；第一人称主体；必要镜面/固定镜头可见 | `PlayerAvatar.ts` 现在是 geometry-free 第一人称空间锚点，正常流程不渲染程序人体 | READY（当前第一人称范围） | 若未来正式镜面/第三人称需要可见身体，另挂正式角色资产；不得恢复程序人偶 |
| 前厅旧画像 | 画框/画布可近看；画面被修过但不直接给结论 | 世界层已加载 `cg-02-family-portrait-v1.png` 到 `Prologue_FrontHallPortrait_Image`，不再使用灰 Box 画布 | READY（待 0–3m 截图） | 保持正式画像纹理与主动检视；后续如补高质量画框，不改变画像内容 |
| 桂花糕/茶水 | 生活层，不是案件证物 | V5 文本完整存在；当前仍没有正式世界茶点资产 | BLOCK | 前厅桌面出现可识别保温壶、杯、桂花糕；不必做“证物”交互 |
| 离家记录/旧箱 | 旧箱、钥匙、怀表、票据；登记时间与压痕可观察 | 已复用许可台账中的 `tyx-arch-pavilion-a / IncenseBox_LP` 作为旧箱实体；正文进入 `DocumentViewer`，旧 lectern/book primitive 已删除 | READY（文书外观仍待 TASK-029） | 继续由正式旧箱承载世界来源，文书细节由 document viewer；不得恢复假账本 |
| “旧鞋” | 旧版需求 | V5.0 正式序章已不以旧鞋作为核心证物；隐藏 Box 鞋实现已从 Runtime 删除 | REMOVED | 禁止为了旧 TASK 文案重新塞回主线；第三章童年布鞋按 V5 作为身份生活物件另处理 |
| 第二章六只茶杯 | 第六只存在使用痕迹；事实先于结论 | `NorthTowerRuntime.tsx` 已隔离旧 `NorthTowerScene` 白盒并删除 Cylinder 茶杯；当前只有 `B_TeaTable_FormalAssetAnchor` 和局部灯，**尚未绑定正式茶具资产** | BLOCK | 从已有/外部许可清晰资产中绑定正式茶桌/六杯，做使用痕迹；Release gate 现在会把“只有 anchor”继续判 BLOCK |
| 第二章账房/框景 | 正式北楼内部、账房、窗框与雨夜人影 | 正式 Runtime 直接使用 `TingYuXuanScene` Master；旧 `NorthTowerScene` 不再导入。柳生画使用 `cg-03-liusheng-fifth-figure-v1.png`；离园记录走 DocumentViewer | PARTIAL | 主宅/账房家具与六杯等 0–3m 资产仍需正式化；旧白盒 Scene 必须保持隔离 |
| 第三章儿童床/书桌 | 普通、生活化儿童房；不能像白盒谜题 | 重构房间已改为复用 `tyx-arch-house-a` 正式 GLB shell，旧盒复用 `IncenseBox_LP`，并使用 `cg-04-child-room-v1.png`；但床/矮书桌等生活家具尚未形成完整正式组合 | PARTIAL | 从现成正式家具补齐床/矮桌/生活物件并保持 reconstruction IDs；禁止再用 Box 家具 |
| Master 建筑 | 听雨轩正式空间事实 | Runtime 使用 `TYX_Master_Scene.glb`，formal A/B/environment roots 受保护 | READY（仍需现场截图） | 不因性能/路线问题删除正式 Master；碰撞独立处理 |

## Release 门禁

脚本：`scripts/qa/check-runtime-key-assets.mjs`

- `npm run qa:asset-truth`：开发审计，只输出当前 BLOCK；
- `npm run qa:asset-truth:release`：Release 模式，只要关键 primitive/whitebox 仍在正式路径就返回失败；
- 门禁只针对正式关键对象，不阻止 collider/debug/loading fallback 使用简化几何。

## 原则

1. “有 GLB”不等于 Runtime 用了 GLB。
2. `visible = false` 不等于问题解决；不用的正式占位实现应删除。
3. Collider 可以是 box/compound/trimesh；视觉关键资产不可以用碰撞形体充当正式美术。
4. 剧情 Source of Truth 已删除的旧证物，不因旧资产清单而强行恢复。
5. 每替换一个关键资产，同步更新本表和 Release gate 规则，再进行 0–3m 近景截图验收。
