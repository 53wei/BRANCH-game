import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不死世界：无名席",
  description: "五章已连接的半开放叙事调查游戏原型。",
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
