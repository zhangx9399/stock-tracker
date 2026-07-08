import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '持仓天数 · 珍惜市场给你的特别提款凭证的机会',
  description: '记录你的股票持有天数，感受时间成本',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
