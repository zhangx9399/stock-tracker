import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserTheme } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { theme } = await req.json();
    if (!theme) return NextResponse.json({ error: '缺少主题参数' }, { status: 400 });

    updateUserTheme(userId, theme);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
