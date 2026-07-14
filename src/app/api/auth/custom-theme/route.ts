import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserCustomTheme } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { h, s, l } = await req.json();
    if (typeof h !== 'number' || typeof s !== 'number' || typeof l !== 'number') {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    updateUserCustomTheme(userId, h, s, l);
    return NextResponse.json({ success: true, h, s, l });
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
