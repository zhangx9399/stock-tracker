'use client';

import { useState, useEffect } from 'react';

interface SearchResult {
  code: string;
  name: string;
  price: number;
}

interface AddStockModalProps {
  onAdd: (stock: { code: string; buyPrice: number; shares: number; buyDate: string }) => void;
  onClose: () => void;
}

export default function AddStockModal({ onAdd, onClose }: AddStockModalProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [buyPrice, setBuyPrice] = useState('');
  const [shares, setShares] = useState('');
  const [buyDate, setBuyDate] = useState('');
  const [error, setError] = useState('');

  // 搜索股票
  useEffect(() => {
    if (keyword.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selected) {
      // 如果搜索框有内容，允许直接用输入的内容作为股票名称/代码
      if (keyword.trim()) {
        if (!buyPrice || Number(buyPrice) <= 0) {
          setError('请输入有效的买入价格');
          return;
        }
        if (!shares || Number(shares) <= 0) {
          setError('请输入有效的股数');
          return;
        }
        if (!buyDate) {
          setError('请选择买入日期');
          return;
        }
        onAdd({
          code: keyword.trim(),
          buyPrice: Number(buyPrice),
          shares: Number(shares),
          buyDate,
        });
        return;
      }
      setError('请输入股票代码或名称');
      return;
    }
    if (!buyPrice || Number(buyPrice) <= 0) {
      setError('请输入有效的买入价格');
      return;
    }
    if (!shares || Number(shares) <= 0) {
      setError('请输入有效的股数');
      return;
    }
    if (!buyDate) {
      setError('请选择买入日期');
      return;
    }

    onAdd({
      code: selected.code,
      buyPrice: Number(buyPrice),
      shares: Number(shares),
      buyDate,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 500 }}>添加持仓</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: '1.25rem',
              color: 'var(--text-tertiary)', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 股票搜索 */}
          {!selected ? (
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                placeholder="输入股票代码或名称搜索"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                autoFocus
              />
              {(results.length > 0 || keyword.trim()) && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', marginTop: '0.25rem',
                  maxHeight: '12rem', overflowY: 'auto', zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}>
                  {results.map(r => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => {
                        setSelected(r);
                        setBuyPrice(String(r.price));
                        setKeyword('');
                        setResults([]);
                      }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        width: '100%', padding: '0.75rem 1rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                          {r.code}
                        </span>
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ¥{r.price}
                      </span>
                    </button>
                  ))}
                  {keyword.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelected({ code: keyword.trim(), name: keyword.trim(), price: 0 });
                        setKeyword('');
                        setResults([]);
                      }}
                      style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        width: '100%', padding: '0.75rem 1rem',
                        background: 'var(--accent-light)', border: 'none', cursor: 'pointer',
                        fontSize: '0.85rem', color: 'var(--accent-dark)',
                        fontWeight: 500,
                      }}
                    >
                      直接使用「{keyword}」
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'var(--accent-light)',
              borderRadius: '0.75rem',
              border: '1px solid var(--accent-medium)',
            }}>
              <span style={{ fontWeight: 500 }}>
                {selected.name}
                <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 400 }}>
                  {selected.code}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: '0.85rem',
                }}
              >
                更换
              </button>
            </div>
          )}

          {/* 买入价格 */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
              买入价格（元/股）
            </label>
            <input
              className="input-field"
              type="number"
              step="0.01"
              min="0"
              placeholder="如 35.00"
              value={buyPrice}
              onChange={e => setBuyPrice(e.target.value)}
            />
          </div>

          {/* 买入股数 */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
              买入股数（股）
            </label>
            <input
              className="input-field"
              type="number"
              step="1"
              min="1"
              placeholder="如 1000"
              value={shares}
              onChange={e => setShares(e.target.value)}
            />
          </div>

          {/* 买入日期 */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
              买入日期
            </label>
            <input
              className="input-field"
              type="date"
              value={buyDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setBuyDate(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--loss-color)', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button className="btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>
            确认添加
          </button>
        </form>
      </div>
    </div>
  );
}
