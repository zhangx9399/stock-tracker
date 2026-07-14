import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserFontSettings, getUserById } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const body = await req.json();
    updateUserFontSettings(userId, {
      fontDaysSize: body.fontDaysSize,
      fontDaysColor: body.fontDaysColor,
      fontMottoSize: body.fontMottoSize,
      fontMottoColor: body.fontMottoColor,
      fontPriceSize: body.fontPriceSize,
      fontPriceColor: body.fontPriceColor,
    });

    const user = getUserById(userId);
    return NextResponse.json({
      success: true,
      user: user ? {
        fontDaysSize: user.fontDaysSize,
        fontDaysColor: user.fontDaysColor,
        fontMottoSize: user.fontMottoSize,
        fontMottoColor: user.fontMottoColor,
        fontPriceSize: user.fontPriceSize,
        fontPriceColor: user.fontPriceColor,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
