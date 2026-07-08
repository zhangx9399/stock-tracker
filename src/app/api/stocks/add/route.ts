import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, addStock } from '@/lib/store';
import { fetchRealTimePrice } from '@/lib/stockApi';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { code, buyPrice, shares, buyDate } = await req.json();

    if (!code || !buyPrice || !shares || !buyDate) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 });
    }

    if (buyPrice <= 0 || shares <= 0) {
      return NextResponse.json({ error: '价格和股数必须大于0' }, { status: 400 });
    }

    // 获取实时价格
    const realtime = await fetchRealTimePrice(code);
    const currentPrice = realtime?.price ?? Number(buyPrice);
    const name = realtime?.name ?? code;

    const stock = addStock({
      userId,
      code,
      name,
      buyPrice: Number(buyPrice),
      shares: Number(shares),
      buyDate,
      currentPrice,
    });

    return NextResponse.json({ stock });
  } catch {
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
