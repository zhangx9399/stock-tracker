import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        theme: user.theme,
        motto: user.motto,
        fontDaysSize: user.fontDaysSize,
        fontDaysColor: user.fontDaysColor,
        fontMottoSize: user.fontMottoSize,
        fontMottoColor: user.fontMottoColor,
        fontPriceSize: user.fontPriceSize,
        fontPriceColor: user.fontPriceColor,
        customThemeH: user.customThemeH,
        customThemeS: user.customThemeS,
        customThemeL: user.customThemeL,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
