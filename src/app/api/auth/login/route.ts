import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, createToken } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

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
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
