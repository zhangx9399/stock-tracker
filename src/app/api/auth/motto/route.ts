import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserMotto } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { motto } = await req.json();
    if (typeof motto !== 'string') {
      return NextResponse.json({ error: '标语格式错误' }, { status: 400 });
    }

    updateUserMotto(userId, motto.trim());
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
