# 《游园惊梦：四面证词》开发仓库

《游园惊梦》已取代《不死世界》成为正式项目。新开发只进入 `garden-of-shadows-game/`；旧工程与独立章节原型保持原样，作为历史参考。

## 仓库分区

| 区域 | 用途 | 状态 |
|---|---|---|
| `garden-of-shadows-game/` | 正式 Vinext/React + Three.js/Rapier 项目 | **主开发入口** |
| `GDD_游园惊梦_完整版.md` | 原始 GDD v1 | 只读历史稿 |
| `undying-world-game/` | 《不死世界》五章 PPT 式整合工程 | 历史参考，不继续开发 |
| `game-chapter-01/` | 旧第一章独立原型 | 历史参考 |
| `game-chapter-02/` | 旧第二章独立原型 | 历史参考 |
| `docs/development-records/` | 旧项目开发记录 | 保留 |

## 当前交付

`garden-of-shadows-game/` 已完成 V0.0 设计定案和 V0.1 可玩垂直切片基础：

- 序章加八章的战役清单、唯一案件时间线、证据矩阵和谜题依赖图。
- PC Web 项目页与序章交互。
- 实时 3D“西廊回环”：夫人/园丁双记忆、空间矛盾、回环、信任重构、无面园主追逐。
- Three.js WebGPU 自动降级 WebGL 2，Rapier 胶囊体控制器。
- `garden-of-shadows.save.v2` 独立存档和章节完成事件。
- 美术规范、第三方许可台账、AIGC 台账及测试门禁。

## 启动

```bash
cd garden-of-shadows-game
npm install
npm run dev
```

验证：

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

详细入口见 [`garden-of-shadows-game/README.md`](./garden-of-shadows-game/README.md)。

## 存档隔离

新作只使用 `garden-of-shadows.save.v2`。旧《不死世界》的 `undying-world.game.save.v1` 不迁移、不读取、不删除，避免无关剧情状态映射进新作。
