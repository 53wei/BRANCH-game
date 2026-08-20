# 不死世界：无名席｜Chapter 02 谁删了名字

这是一个可独立运行、以后可并入总游戏的第二章 Web 模块。

## 运行

```powershell
npm install
npm run dev
```

浏览器打开终端显示的本地地址。

## 结构

- `app/page.tsx`：章节界面、调查交互、存档、推断和结尾。
- `app/game/chapter02.ts`：房间、热点、证据、推断选项和章节输入输出状态。
- `app/globals.css`：固定场景、界面和响应式样式。
- `tests/rendered-html.test.mjs`：正式构建的页面返回测试。

## 合并约定

- 输入：`chapter01.woman_belonged_to_family`
- 输出：`chapter02.first_family_conflict`
- 完成事件：`undying-world:chapter-complete`
- 本章存档：`undying-world.chapter02.save.v1`

总工程接入时，优先复用 `chapter02.ts` 的数据和完成事件；UI 可以迁移到团队统一外壳。
