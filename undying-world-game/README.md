# 不死世界：章节总游戏

这是五章完整连接后的总工程。第一章至第五章由同一个章节管理器加载；第三章至第五章是遵照 GDD 已确定方向建立的剧情占位骨架。

## 本地运行

```powershell
npm install
npm run dev
```

浏览器打开 `http://localhost:3000/`。

## 结构

- `app/page.tsx`：总游戏入口，决定当前显示哪一章，负责解锁、切章和总存档。
- `app/game/ChapterRunner.tsx`：各章共用的 PPT 式章节播放器；每个房间是一幕，选项、证据、推断和结算都在单屏内完成。
- `app/game/chapters/`：每章自己的房间、证据、热点、推断题和章节接口。
- `app/game/campaign-save.ts`：唯一总存档、旧独立存档迁移和数据校验。
- `app/game/SceneArt.tsx`：章节房间的占位场景美术。

## 添加新章节的方法

1. 在 `app/game/chapters/` 新建 `chapterXX.ts`，按 `ChapterDefinition` 填写章节数据。
2. 将新章节的 `inputFlag` 写成上一章的 `outputFlag`。
3. 在 `app/page.tsx` 的 `CHAPTERS` 数组中追加新章节。
4. 为新房间在 `SceneArt.tsx` 增加场景组件或独立场景文件。
5. 补一条接口与章节链路测试。

章节组件不直接跳网址；完成后只上报 `chapterId / outputFlag / evidence`，由总游戏决定下一章。
