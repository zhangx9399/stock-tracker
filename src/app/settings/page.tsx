'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { themes } from '@/lib/themes';
import { applyTheme } from '@/lib/theme';

interface User {
  id: string;
  email: string;
  nickname: string;
  theme: string;
  motto: string;
  fontDaysSize: number;
  fontDaysColor: string;
  fontMottoSize: number;
  fontMottoColor: string;
  fontPriceSize: number;
  fontPriceColor: string;
  customThemeH: number | null;
  customThemeS: number | null;
  customThemeL: number | null;
}

interface MottoHistoryItem {
  id: string;
  motto: string;
  createdAt: string;
}

type FontTarget = 'days' | 'motto' | 'price';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTheme, setActiveTheme] = useState('default');
  const [motto, setMotto] = useState('');
  const [mottoSaved, setMottoSaved] = useState(false);

  // 字体设置
  const [fontTarget, setFontTarget] = useState<FontTarget>('days');
  const [fontSizes, setFontSizes] = useState({ days: 7, motto: 1.15, price: 2.25 });
  const [fontColors, setFontColors] = useState({ days: '', motto: '', price: '' });

  // 历史标语
  const [mottoHistory, setMottoHistory] = useState<MottoHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 自定义颜色
  const [customH, setCustomH] = useState(220);
  const [customS, setCustomS] = useState(60);
  const [customL, setCustomL] = useState(65);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const colorSliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.replace('/login');
          return;
        }
        setUser(data.user);
        setActiveTheme(data.user.theme || 'default');
        setMotto(data.user.motto || '');
        setFontSizes({
          days: data.user.fontDaysSize || 7,
          motto: data.user.fontMottoSize || 1.15,
          price: data.user.fontPriceSize || 2.25,
        });
        setFontColors({
          days: data.user.fontDaysColor || '',
          motto: data.user.fontMottoColor || '',
          price: data.user.fontPriceColor || '',
        });
        if (data.user.customThemeH !== null && data.user.customThemeH !== undefined) {
          setCustomH(data.user.customThemeH);
          setCustomS(data.user.customThemeS || 60);
          setCustomL(data.user.customThemeL || 65);
        }
        const themeName = data.user.theme || 'default';
        setActiveTheme(themeName);
        if (themeName === 'custom') setShowCustomPicker(true);
        const customHsl = themeName === 'custom' && data.user.customThemeH !== null
          ? { h: data.user.customThemeH, s: data.user.customThemeS!, l: data.user.customThemeL! }
          : undefined;
        applyTheme(data.user.theme || 'default', customHsl);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  // 加载历史标语
  useEffect(() => {
    if (showHistory) {
      fetch('/api/auth/motto-history')
        .then(res => res.json())
        .then(data => {
          if (data.history) setMottoHistory(data.history);
        })
        .catch(() => {});
    }
  }, [showHistory]);

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    setShowCustomPicker(false);
    if (themeName === 'custom') {
      applyTheme('custom', { h: customH, s: customS, l: customL });
      fetch('/api/auth/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'custom', h: customH, s: customS, l: customL }),
      }).catch(() => {});
    } else {
      applyTheme(themeName);
      fetch('/api/auth/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeName }),
      }).catch(() => {});
    }
  };

  const handleMottoSave = () => {
    fetch('/api/auth/motto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motto }),
    }).then(res => {
      if (res.ok) {
        setMottoSaved(true);
        setTimeout(() => setMottoSaved(false), 2000);
      }
    }).catch(() => {});
  };

  // 字体设置保存
  const handleFontSave = () => {
    fetch('/api/auth/font-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fontDaysSize: fontSizes.days,
        fontDaysColor: fontColors.days,
        fontMottoSize: fontSizes.motto,
        fontMottoColor: fontColors.motto,
        fontPriceSize: fontSizes.price,
        fontPriceColor: fontColors.price,
      }),
    }).catch(() => {});
  };

  const getFontTargetLabel = (t: FontTarget) => {
    if (t === 'days') return '天数数字';
    if (t === 'motto') return '标语文字';
    return '股价数字';
  };

  const getCurrentFontSize = () => fontSizes[fontTarget];
  const getCurrentFontColor = () => fontColors[fontTarget];

  const handleFontSizeChange = (val: number) => {
    const newSizes = { ...fontSizes, [fontTarget]: val };
    setFontSizes(newSizes);
    fetch('/api/auth/font-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fontDaysSize: newSizes.days,
        fontDaysColor: fontColors.days,
        fontMottoSize: newSizes.motto,
        fontMottoColor: fontColors.motto,
        fontPriceSize: newSizes.price,
        fontPriceColor: fontColors.price,
      }),
    }).catch(() => {});
  };

  const handleFontColorChange = (color: string) => {
    const newColors = { ...fontColors, [fontTarget]: color };
    setFontColors(newColors);
    fetch('/api/auth/font-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fontDaysSize: fontSizes.days,
        fontDaysColor: newColors.days,
        fontMottoSize: fontSizes.motto,
        fontMottoColor: newColors.motto,
        fontPriceSize: fontSizes.price,
        fontPriceColor: newColors.price,
      }),
    }).catch(() => {});
  };

  const resetFontColor = () => {
    handleFontColorChange('');
  };

  // 自定义颜色选择器 - 色相轴拖动
  const handleColorSliderInteraction = (clientX: number) => {
    if (!colorSliderRef.current) return;
    const rect = colorSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const hue = Math.round((x / rect.width) * 360);
    setCustomH(hue);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleColorSliderInteraction(e.clientX);
    const onUp = () => {
      setIsDragging(false);
      // 保存自定义颜色
      fetch('/api/auth/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'custom', h: customH, s: customS, l: customL }),
      }).catch(() => {});
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, customH, customS, customL]);

  const handleCustomColorApply = () => {
    setActiveTheme('custom');
    applyTheme('custom', { h: customH, s: customS, l: customL });
    fetch('/api/auth/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'custom', h: customH, s: customS, l: customL }),
    }).catch(() => {});
  };

  const handleHistorySelect = (item: MottoHistoryItem) => {
    setMotto(item.motto);
    setShowHistory(false);
  };

  const handleHistoryDelete = (id: string) => {
    fetch('/api/auth/motto-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(() => {
      setMottoHistory(prev => prev.filter(h => h.id !== id));
    }).catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '32rem', margin: '0 auto' }}>
      {/* 顶部 */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        marginBottom: '2.5rem', paddingTop: '1rem',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.25rem', color: 'var(--text-secondary)', padding: '0.25rem',
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 500 }}>设置</h2>
      </header>

      <div className="animate-fade-in">
        {/* 自定义标语 */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            marginBottom: '0.5rem', letterSpacing: '0.05em',
          }}>
            首页标语
          </h3>
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            marginBottom: '1rem',
          }}>
            显示在持有天数下方的那句话，写一句激励自己的话吧
          </p>
          <textarea
            className="input-field"
            value={motto}
            onChange={e => setMotto(e.target.value)}
            placeholder="如：做时间的朋友。坚定地持有 QQQ 纳指一百指数基金。"
            rows={3}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.75rem',
          }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500,
              }}
            >
              {showHistory ? '收起历史' : '历史标语'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: mottoSaved ? 'var(--gain-color)' : 'var(--text-tertiary)' }}>
                {mottoSaved ? '已保存' : ''}
              </span>
              <button className="btn-secondary" onClick={handleMottoSave} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                保存标语
              </button>
            </div>
          </div>

          {/* 历史标语列表 */}
          {showHistory && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                点击历史标语可直接选用
              </p>
              {mottoHistory.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>暂无历史标语</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '12rem', overflowY: 'auto' }}>
                  {mottoHistory.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.6rem 0.75rem', background: 'var(--bg)',
                        borderRadius: '0.5rem', border: '1px solid var(--border)',
                      }}
                    >
                      <button
                        onClick={() => handleHistorySelect(item)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.85rem', color: 'var(--text-primary)',
                          textAlign: 'left', flex: 1, lineHeight: 1.4,
                        }}
                      >
                        {item.motto}
                      </button>
                      <button
                        onClick={() => handleHistoryDelete(item.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', color: 'var(--text-tertiary)',
                          marginLeft: '0.5rem', padding: '0.25rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 字体设置 */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            marginBottom: '0.5rem', letterSpacing: '0.05em',
          }}>
            字体设置
          </h3>
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            marginBottom: '1rem',
          }}>
            调整主页上不同元素的字体大小和颜色
          </p>

          {/* 选择目标元素 */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {(['days', 'motto', 'price'] as FontTarget[]).map(t => (
              <button
                key={t}
                onClick={() => setFontTarget(t)}
                style={{
                  padding: '0.4rem 0.85rem', borderRadius: '2rem',
                  fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                  border: fontTarget === t ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                  background: fontTarget === t ? 'var(--accent-light)' : 'var(--surface)',
                  color: fontTarget === t ? 'var(--accent-dark)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {getFontTargetLabel(t)}
              </button>
            ))}
          </div>

          {/* 预览 */}
          <div style={{
            padding: '1rem', background: 'var(--bg)', borderRadius: '0.75rem',
            marginBottom: '1rem', textAlign: 'center', minHeight: '4rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {fontTarget === 'days' && (
              <span style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 100,
                fontSize: `${Math.min(fontSizes.days, 5)}rem`,
                color: fontColors.days || 'var(--accent)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                1714<span style={{ fontSize: `${Math.min(fontSizes.days * 0.4, 2.5)}rem`, opacity: 0.75 }}>天</span>
              </span>
            )}
            {fontTarget === 'motto' && (
              <span style={{
                fontSize: `${fontSizes.motto}rem`,
                color: fontColors.motto || 'var(--text-secondary)',
                letterSpacing: '0.12em', lineHeight: 1.8,
              }}>
                珍惜市场给你的特别提款凭证的机会
              </span>
            )}
            {fontTarget === 'price' && (
              <span style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 200,
                fontSize: `${fontSizes.price}rem`,
                color: fontColors.price || 'var(--loss-color)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                -67.85%
              </span>
            )}
          </div>

          {/* 字号滑块 */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>字号</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {getCurrentFontSize().toFixed(2)} rem
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max={fontTarget === 'days' ? 16 : 6}
              step="0.05"
              value={getCurrentFontSize()}
              onChange={e => handleFontSizeChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          {/* 颜色选择 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>颜色</label>
              <button
                onClick={resetFontColor}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', color: 'var(--accent)',
                }}
              >
                恢复默认
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="color"
                  value={getCurrentFontColor() || '#6b7280'}
                  onChange={e => handleFontColorChange(e.target.value)}
                  style={{
                    width: '2.5rem', height: '2.5rem', border: 'none',
                    borderRadius: '50%', cursor: 'pointer', padding: 0,
                    background: 'none',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {getCurrentFontColor() || '默认主题色'}
              </span>
            </div>
          </div>
        </div>

        {/* 主题色选择 */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            marginBottom: '1.25rem', letterSpacing: '0.05em',
          }}>
            页面主色调
          </h3>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`theme-dot ${activeTheme === key ? 'active' : ''}`}
                style={{
                  background: key === 'default'
                    ? '#9ca3af'
                    : `hsl(${theme.h}, ${theme.s}%, ${theme.l}%)`,
                }}
                title={theme.label}
              />
            ))}
            {/* 自定义颜色按钮 */}
            <button
              onClick={() => { setShowCustomPicker(!showCustomPicker); if (!showCustomPicker) handleThemeChange('custom'); }}
              className={`theme-dot ${activeTheme === 'custom' ? 'active' : ''}`}
              style={{
                background: activeTheme === 'custom'
                  ? `hsl(${customH}, ${customS}%, ${customL}%)`
                  : 'linear-gradient(135deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
              }}
              title="自定义颜色"
            >
              <span style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontSize: '0.9rem' }}>✦</span>
            </button>
          </div>

          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            marginTop: '1rem',
          }}>
            当前：{activeTheme === 'custom' ? '自定义' : (themes[activeTheme]?.label || '默认')}
          </p>

          {/* 自定义颜色选择器 */}
          {showCustomPicker && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                拖动色轴选择颜色
              </p>

              {/* 色相轴 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>色相</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{customH}°</span>
                </div>
                <div
                  ref={colorSliderRef}
                  onMouseDown={(e) => { setIsDragging(true); handleColorSliderInteraction(e.clientX); }}
                  style={{
                    height: '1.5rem', borderRadius: '1rem', cursor: 'pointer',
                    background: 'linear-gradient(to right, hsl(0,80%,60%), hsl(60,80%,60%), hsl(120,80%,60%), hsl(180,80%,60%), hsl(240,80%,60%), hsl(300,80%,60%), hsl(360,80%,60%))',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '-0.25rem',
                    left: `${(customH / 360) * 100}%`,
                    transform: 'translateX(-50%)',
                    width: '1.25rem', height: '2rem',
                    borderRadius: '0.5rem',
                    border: '2px solid white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    background: `hsl(${customH}, ${customS}%, ${customL}%)`,
                    transition: isDragging ? 'none' : 'left 0.1s',
                  }} />
                </div>
              </div>

              {/* 饱和度 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>饱和度</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{customS}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={customS}
                  onChange={e => { setCustomS(parseInt(e.target.value)); }}
                  onMouseUp={handleCustomColorApply}
                  style={{ width: '100%', accentColor: `hsl(${customH}, ${customS}%, ${customL}%)` }}
                />
              </div>

              {/* 明度 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>明度</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{customL}%</span>
                </div>
                <input
                  type="range" min="10" max="90" value={customL}
                  onChange={e => { setCustomL(parseInt(e.target.value)); }}
                  onMouseUp={handleCustomColorApply}
                  style={{ width: '100%', accentColor: `hsl(${customH}, ${customS}%, ${customL}%)` }}
                />
              </div>

              {/* 预览色块 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: `hsl(${customH}, ${customS}%, ${customL}%)`,
                  border: '2px solid var(--border)',
                }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  HSL({customH}, {customS}%, {customL}%)
                </span>
                <button
                  onClick={handleCustomColorApply}
                  className="btn-primary"
                  style={{ marginLeft: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                >
                  应用
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 账号信息 */}
        <div className="card">
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            marginBottom: '1rem', letterSpacing: '0.05em',
          }}>
            账号信息
          </h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>昵称：</span>
              {user?.nickname || '未设置'}
            </p>
            <p>
              <span style={{ color: 'var(--text-tertiary)' }}>邮箱：</span>
              {user?.email}
            </p>
          </div>
        </div>

        {/* 关于 */}
        <div style={{
          textAlign: 'center', marginTop: '3rem',
          fontSize: '0.75rem', color: 'var(--text-tertiary)',
        }}>
          <p>持仓天数 · v0.3.0</p>
        </div>
      </div>
    </div>
  );
}
