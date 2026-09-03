# TASK-017｜正式路线建筑碰撞覆盖报告

更新时间：2026-09-03

## 结论

TASK-017 的正式碰撞链路已经闭合：

    TYX_Master_Scene.glb
            ↓ 只读视觉 Mesh 审计
    Master 派生简化 Box + Gameplay Map 显式简化 Box
            ↓ 统一注册
    PhysicsController / Rapier World
            ↓
    七锚点截图 + 连续 CharacterController 行走 + 逐墙穿越反测

正式视觉 Mesh 不直接充当物理网格。门洞、月洞门、屋顶、格栅、栏杆等特殊结构继续显式排除，交由 TASK-018 专项处理。

## 实际运行数据

数据来源：[capture-metrics.json](../development-records/gameplay-map-v1-captures/capture-metrics.json)，不是测试夹具。

| 指标 | 实测值 |
|---|---:|
| Master 总 Mesh | 1457 |
| 建筑候选 Mesh | 76 |
| Master 派生简化 Collider | 1 |
| 显式 Gameplay Map 建筑 Collider | 11 |
| Physics 建筑 Collider 总数 | 12 |
| Physics 静态 Collider 总数 | 28 |
| 启用 Collider | 28 |
| 排除 Mesh | 1456 |
| 被截断 Collider | 0 |

排除原因：

| 原因 | 数量 |
|---|---:|
| 隐藏节点 | 33 |
| 非建筑 Mesh | 1296 |
| 门洞/屋顶/格栅/栏杆等专项结构 | 52 |
| 空 Bounds | 0 |
| 尺寸不适合简化 Box | 4 |
| 相同 Bounds 去重 | 71 |

Master GLB 中有 71 个建筑候选共享相同世界 Bounds；另有 3 个 PLASTER Mesh 的导出 Bounds 达 531.2 × 417.233 × 637.262 米。它们没有被强行加入 Physics。B/C 区域使用 Gameplay Map 中经路线校准的显式简化 Box；报告同时保留 masterColliderCovered 字段，避免把显式覆盖误写成 Master 自动派生。

## 区域覆盖

同一个跨区 Mesh/Collider 可以计入多个区域，因此各区数量不用于相加。

| 区域 | 可见 Mesh | 建筑候选 | Master 派生 | 显式建筑 Collider | 审计点 |
|---|---:|---:|---:|---:|---:|
| AREA_A / Entrance + West Court | 1157 | 75 | 1 | 7 | 2 |
| AREA_B / North Tower | 82 | 3 | 0 | 8 | 1 |
| AREA_C / Water Court + Finale Area | 128 | 3 | 0 | 3 | 2 |
| OUTSIDE | 177 | 1 | 0 | 0 | 0 |

## 正式路线覆盖

覆盖半径固定为 10 米；判定同时要求：该区有正式视觉 Mesh、附近有已进入 Physics 的建筑 Collider、锚点属于声明的 Gameplay Region。

| 路线点 | 锚点 | 区域 | 最近建筑 Collider | 覆盖 |
|---|---|---|---:|---|
| Entrance | ROUTE_02_A_ENTRY | AREA_A | 0.000m | PASS |
| West Court | ROUTE_03_A_LOOP | AREA_A | 3.980m | PASS |
| North Tower | ROUTE_05_B_MAIN_COURT | AREA_B | 4.750m | PASS |
| Water Court | C_WATER_EDGE | AREA_C | 2.263m | PASS |
| Finale Area | C_FINAL_PAVILION | AREA_C | 8.430m | PASS |

## 防回归

- architecture-collision.test.ts 验证排除原因互斥、超过旧上限 96 时 120 个 Collider 全部生成并进入 Physics。
- 同一测试使用正式 CharacterController，以 0.08m 帧步长逐个尝试穿越所有落地架构 Collider；全部被阻断。
- tingyuxuan-layout.test.ts 验证七段正式路线在正确认知层中可通行。
- 实际浏览器连续路线完成 6 个后续里程碑，全部 grounded，耗时 26.543 秒。
- 七张 debugMap 截图与最终连续行走截图位于 [gameplay-map-v1-captures](../development-records/gameplay-map-v1-captures/)。

## 上限策略

旧逻辑 boxes.slice(0, 96) 已删除。当前策略为动态注册全部有效 Collider；超过 256 只发出明确性能告警，不截断、不静默丢失。Runtime 报告必须满足 truncatedColliderCount = 0，视觉回归才允许通过。
