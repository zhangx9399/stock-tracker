import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getStocksByUser, updateStockPrice } from '@/lib/store';
import { fetchRealTimePrice } from '@/lib/stockApi';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = await verifyToken(token);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userStocks = getStocksByUser(userId);

  // 并行获取所有股票的实时价格
  await Promise.all(
    userStocks.map(async (stock) => {
      const realtime = await fetchRealTimePrice(stock.code);
      if (realtime && realtime.price > 0) {
        updateStockPrice(stock.id, realtime.price);
        stock.currentPrice = realtime.price;
        stock.name = realtime.name;
      }
    })
  );

  // 计算每只股票的持有天数和盈亏
  const result = userStocks.map(stock => {
    const buyDate = new Date(stock.buyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    buyDate.setHours(0, 0, 0, 0);
    const days = Math.floor((today.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));

    const totalCost = stock.buyPrice * stock.shares;
    const currentValue = stock.currentPrice * stock.shares;
    const lossAmount = totalCost - currentValue;
    const lossRatio = ((stock.buyPrice - stock.currentPrice) / stock.buyPrice) * 100;

    return {
      ...stock,
      days,
      totalCost: Math.round(totalCost * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      lossAmount: Math.round(lossAmount * 100) / 100,
      lossRatio: Math.round(lossRatio * 100) / 100,
    };
  });

  // 按"最痛"排序：优先被套天数最长，其次亏损金额最大
  result.sort((a, b) => b.days - a.days || b.lossAmount - a.lossAmount);

  return NextResponse.json({ stocks: result });
}
