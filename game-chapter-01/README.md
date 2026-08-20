# 不死世界：无名席｜Chapter 01 第七席

可独立运行、以后可并入总游戏的第一章 Web 模块。目前以功能骨架和章节衔接为重点，剧情文本和美术资产均可替换。

## 运行

```powershell
npm install
npm run dev
```

## 主要文件

- `app/page.tsx`：章节界面、调查交互、存档、推断、结尾和第二章入口。
- `app/game/chapter01.ts`：房间、热点、证据、推断以及章节输入输出状态。
- `app/globals.css`、`app/chapter01.css`：通用界面与第一章固定场景样式。
- `tests/rendered-html.test.mjs`：正式构建后的页面测试。

## 章节接口

- 输入：无。
- 输出：`chapter01.woman_belonged_to_family`
- 完成事件：`undying-world:chapter-complete`
- 存档键：`undying-world.chapter01.save.v1`

完成事件的数据结构与第二章相同：`chapterId`、`outputFlag`、`evidence`。总工程监听该事件后切换到第二章；独立试玩版则通过结尾按钮打开第二章。
