import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: '龟迹 CheloniaTrace | 龟类喂食策略计算器与研究数据库',
  description: '龟类喂食策略试算、研究来源追溯与龟鳖目百科',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
