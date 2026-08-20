# 《不死世界：无名席》团队开发仓库

本仓库用于团队共享游戏源码、章节原型、整合测试、原始 GDD 和开发记录。

## 仓库分区

| 区域 | 用途 | 是否继续开发 |
| --- | --- | --- |
| `undying-world-game/` | 五章连通后的主游戏工程，统一章节管理、PPT 播放器和总存档 | **是，团队主入口** |
| `game-chapter-01/` | 第一章独立原型，保留用于对照和回溯 | 原则上不再直接开发 |
| `game-chapter-02/` | 第二章独立原型，保留用于对照和回溯 | 原则上不再直接开发 |
| `integration-tests/` | 独立章节接口测试 | 接口变化时更新 |
| `docs/gdd/` | 当前作为内容标准的完整 GDD | 原文件只读，修改请另存新版本 |
| `docs/development-records/` | 总记录与第一至第五章开发记录 | 每次完成工作后必须更新 |

临时渲染目录、依赖、构建产物、本机缓存和环境变量不会上传。

## 当前完成状态

- 完整规划共五章：第七席、谁删了名字、第一次“死”、活着的人、无名席。
- 五章已经在 `undying-world-game/` 中按顺序连通。
- 章节采用固定单屏 PPT 式播放，选项、证据、推断和结算都在幻灯片内完成。
- 第三至第五章目前是严格依据 GDD 已确定方向搭建的剧情占位骨架。
- 第五章包含最终关系推断和独立结局选择页。
- 五章共用 `undying-world.game.save.v1` 总存档。

## 启动主游戏

需要 Node.js 22.13 或更高版本。

```powershell
cd undying-world-game
npm install
npm run dev
```

浏览器打开 `http://localhost:3000/`。

## 验证

```powershell
cd undying-world-game
npm run lint
npm run build
node --test tests/*.test.mjs
```

独立章节接口测试：

```powershell
node --test integration-tests/*.test.mjs
```

## 团队协作规则

1. 新功能和正式剧情统一修改 `undying-world-game/`，不要分别改两个旧独立原型再手工合并。
2. 每次开始工作前，先阅读 `docs/development-records/总游戏整合开发记录.md` 和自己负责章节的记录。
3. 每次完成工作后，必须更新对应章节记录；涉及存档、公共播放器或章节接口时，同时更新总记录。
4. 每章的 `inputFlag` 必须与上一章的 `outputFlag` 完全一致。
5. 未经剧情组确认的身份、对白、证据和结局只能写成明确标注的占位内容。
6. 提交前至少运行主工程 lint、build 和整合测试。

## 关键代码位置

- `undying-world-game/app/page.tsx`：总游戏入口、章节顺序、解锁、自动切章。
- `undying-world-game/app/game/ChapterRunner.tsx`：通用 PPT 章节播放器。
- `undying-world-game/app/game/chapters/`：五章各自的配置、证据和选项。
- `undying-world-game/app/game/campaign-save.ts`：统一总存档与旧存档迁移。
- `undying-world-game/tests/campaign-integration.test.mjs`：五章连接测试。
