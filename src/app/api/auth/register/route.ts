import { NextRequest, NextResponse } from 'next/server';
import { createUser, createToken } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    const user = await createUser(email, password, nickname || email.split('@')[0]);
    const token = await createToken(user.id);

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, nickname: user.nickname, theme: user.theme, motto: user.motto },
    });

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
      path: '/',
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '注册失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
