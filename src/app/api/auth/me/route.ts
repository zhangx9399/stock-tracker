import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/store';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, nickname: user.nickname, theme: user.theme, motto: user.motto },
  });
}
