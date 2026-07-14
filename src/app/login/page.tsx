'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, nickname };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '操作失败');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '24rem' }}>
        {/* Logo / 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 300,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            持仓天数
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            marginTop: '0.5rem',
          }}>
            珍惜市场给你的特别提款凭证的机会
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input
              className="input-field"
              type="text"
              placeholder="昵称（选填）"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          )}
          <input
            className="input-field"
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p style={{ color: 'var(--loss-color)', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginLeft: '0.25rem',
            }}
          >
            {isLogin ? '去注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
