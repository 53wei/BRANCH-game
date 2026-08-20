import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不死世界：无名席｜第二章 谁删了名字",
  description: "半开放固定场景叙事调查游戏的第二章可玩模块。",
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
