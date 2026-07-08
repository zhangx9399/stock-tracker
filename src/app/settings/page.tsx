'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { themes } from '@/lib/themes';
import { applyTheme } from '@/lib/theme';

interface User {
  id: string;
  email: string;
  nickname: string;
  theme: string;
  motto: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTheme, setActiveTheme] = useState('default');
  const [motto, setMotto] = useState('');
  const [mottoSaved, setMottoSaved] = useState(false);

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
        applyTheme(data.user.theme || 'default');
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    applyTheme(themeName);
    fetch('/api/auth/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: themeName }),
    }).catch(() => {});
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
            <span style={{ fontSize: '0.75rem', color: mottoSaved ? 'var(--gain-color)' : 'var(--text-tertiary)' }}>
              {mottoSaved ? '已保存' : ''}
            </span>
            <button className="btn-secondary" onClick={handleMottoSave} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              保存标语
            </button>
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
          </div>

          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            marginTop: '1rem',
          }}>
            当前：{themes[activeTheme]?.label || '默认'}
          </p>
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
          <p>持仓天数 · v0.2.0</p>
        </div>
      </div>
    </div>
  );
}
