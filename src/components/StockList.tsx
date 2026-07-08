'use client';

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

interface StockListProps {
  stocks: StockData[];
  onDelete: (id: string) => void;
}

export default function StockList({ stocks, onDelete }: StockListProps) {
  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {stocks.map((stock, index) => (
        <div
          key={stock.id}
          className="card animate-fade-in"
          style={{
            padding: '1.25rem',
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{stock.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                {stock.code} · {stock.shares}股 · {stock.buyDate}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm(`确定删除 ${stock.name} 吗？`)) {
                  onDelete(stock.id);
                }
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '0.25rem',
              }}
            >
              删除
            </button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem',
            marginTop: '1rem',
          }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>持有天数</p>
              <p style={{
                fontSize: '1.25rem', fontWeight: 300,
                fontVariantNumeric: 'tabular-nums', marginTop: '0.15rem',
              }}>
                {stock.days}天
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>亏损比例</p>
              <p style={{
                fontSize: '1.25rem', fontWeight: 300,
                fontVariantNumeric: 'tabular-nums', marginTop: '0.15rem',
                color: stock.lossRatio > 0 ? 'var(--loss-color)' : 'var(--gain-color)',
              }}>
                {stock.lossRatio > 0 ? '-' : '+'}{Math.abs(stock.lossRatio)}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>亏损金额</p>
              <p style={{
                fontSize: '1.25rem', fontWeight: 300,
                fontVariantNumeric: 'tabular-nums', marginTop: '0.15rem',
                color: stock.lossAmount > 0 ? 'var(--loss-color)' : 'var(--gain-color)',
              }}>
                ¥{Math.abs(stock.lossAmount).toLocaleString()}
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '0.75rem', paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
          }}>
            <span>买入 ¥{stock.buyPrice}</span>
            <span>现价 ¥{stock.currentPrice}</span>
            <span>成本 ¥{stock.totalCost.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
