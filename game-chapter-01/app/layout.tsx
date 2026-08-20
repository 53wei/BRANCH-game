import type { Metadata } from "next";
import "./globals.css";
import "./chapter01.css";

export const metadata: Metadata = {
  title: "不死世界：无名席｜第一章 第七席",
  description: "半开放固定场景叙事调查游戏的第一章可玩骨架。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
