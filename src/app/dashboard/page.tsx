'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AddStockModal from '@/components/AddStockModal';
import StockList from '@/components/StockList';
import LiveTimer from '@/components/LiveTimer';
import { applyTheme } from '@/lib/theme';

interface StockData {
  id: string;
  code: string;
  name: string;
  buyPrice: number;
  shares: number;
  buyDate: string;
  currentPrice: number;
  days: number;
  totalCost: number;
  currentValue: number;
  lossAmount: number;
  lossRatio: number;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  theme: string;
  motto: string;
}

const DEFAULT_MOTTO = '珍惜市场给你的特别提款凭证的机会';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (user?.theme) applyTheme(user.theme);
  }, [user?.theme]);

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch('/api/stocks');
      const data = await res.json();
      if (data.stocks) setStocks(data.stocks);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.replace('/login');
          return;
        }
        setUser(data.user);
        applyTheme(data.user.theme || 'default');
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (user) fetchStocks();
  }, [user, fetchStocks]);

  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  const handleAddStock = async (stock: { code: string; buyPrice: number; shares: number; buyDate: string }) => {
    try {
      const res = await fetch('/api/stocks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });
      if (res.ok) {
        setShowAddModal(false);
        await fetchStocks();
      }
    } catch { /* ignore */ }
  };

  const handleDeleteStock = async (stockId: string) => {
    try {
      await fetch(`/api/stocks/delete?id=${stockId}`, { method: 'DELETE' });
      await fetchStocks();
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  const primary = stocks.length > 0 ? stocks[0] : null;
  const motto = user?.motto || DEFAULT_MOTTO;

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-tertiary)', fontSize: '0.95rem',
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '32rem', margin: '0 auto' }}>
      {/* 顶部导航 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', paddingTop: '1rem',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {user?.nickname || '我的持仓'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', color: 'var(--accent)', padding: '0.25rem',
              fontWeight: 500,
            }}
          >
            + 添加
          </button>
          <button
            onClick={() => router.push('/settings')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', color: 'var(--text-tertiary)', padding: '0.25rem',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⚙</span>
            <span>设置</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', color: 'var(--text-tertiary)', padding: '0.25rem',
            }}
          >
            退出
          </button>
        </div>
      </header>

      {/* 核心区域 */}
      <main className="animate-fade-in">
        {primary ? (
          <>
            {/* 第一核心区域：天数 + 标语 */}
            <div style={{ textAlign: 'center', padding: '2rem 0 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                <span className="days-number">{primary.days}</span>
                <span className="days-unit">天</span>
              </div>

              <LiveTimer buyDate={primary.buyDate} />

              <p className="days-motto">{motto}</p>
            </div>

            {/* 亏损比例 + 股票名称 */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <span style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 200,
                fontFamily: "'Inter', sans-serif",
                color: primary.lossRatio > 0 ? 'var(--loss-color)' : 'var(--gain-color)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>
                {primary.lossRatio > 0 ? '-' : '+'}{Math.abs(primary.lossRatio)}%
              </span>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                marginTop: '0.35rem',
                fontWeight: 300,
              }}>
                {primary.name}（{primary.code}）
              </p>
            </div>

            {/* 第二核心区域：亏损比例 + 亏损金额 */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
              marginTop: '2rem', alignItems: 'stretch',
            }}>
              <div className="card" style={{
                textAlign: 'center', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <p className="stat-label">亏损比例</p>
                <p className="stat-value" style={{
                  color: primary.lossRatio > 0 ? 'var(--loss-color)' : 'var(--gain-color)',
                  marginTop: '0.5rem',
                }}>
                  {primary.lossRatio > 0 ? '-' : '+'}{Math.abs(primary.lossRatio)}%
                </p>
              </div>
              <div className="card" style={{
                textAlign: 'center', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <p className="stat-label">亏损金额</p>
                <p className="stat-value" style={{
                  color: primary.lossAmount > 0 ? 'var(--loss-color)' : 'var(--gain-color)',
                  marginTop: '0.5rem',
                }}>
                  {primary.lossAmount > 0 ? '-' : '+'}¥{Math.abs(primary.lossAmount).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 持仓明细 */}
            <div style={{ marginTop: '1.5rem', padding: '0 0.25rem' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem',
              }}>
                <span>买入价 ¥{primary.buyPrice} · {primary.shares}股 · {primary.buyDate}</span>
                <span>现价 ¥{primary.currentPrice}</span>
              </div>
            </div>
          </>
        ) : (
          /* 空状态 */
          <div style={{
            textAlign: 'center', padding: '5rem 0',
            color: 'var(--text-tertiary)',
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📈</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 300 }}>还没有持仓记录</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>点击右上角「+ 添加」开始记录</p>
          </div>
        )}

        {/* 持仓列表入口 */}
        {stocks.length > 1 && (
          <button
            onClick={() => setShowList(!showList)}
            className="btn-secondary"
            style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}
          >
            {showList ? '收起列表' : `查看全部 ${stocks.length} 只持仓`}
          </button>
        )}

        {showList && (
          <StockList stocks={stocks} onDelete={handleDeleteStock} />
        )}
      </main>

      {/* 添加弹窗 */}
      {showAddModal && (
        <AddStockModal
          onAdd={handleAddStock}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
