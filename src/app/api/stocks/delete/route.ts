import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, deleteStock } from '@/lib/store';

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const stockId = searchParams.get('id');

    if (!stockId) {
      return NextResponse.json({ error: '缺少股票ID' }, { status: 400 });
    }

    deleteStock(stockId, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
