import "./globals.css";

export const metadata = {
  title: "游园惊梦：四面证词",
  description: "一座园林，四份证词，以及被删去的第五个人。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
