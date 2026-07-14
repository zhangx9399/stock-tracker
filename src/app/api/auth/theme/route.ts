import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserTheme, updateUserCustomTheme } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { theme, h, s, l } = await req.json();

    if (theme === 'custom' && typeof h === 'number' && typeof s === 'number' && typeof l === 'number') {
      updateUserTheme(userId, 'custom');
      updateUserCustomTheme(userId, h, s, l);
    } else if (theme) {
      updateUserTheme(userId, theme);
    } else {
      return NextResponse.json({ error: '缺少主题参数' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
