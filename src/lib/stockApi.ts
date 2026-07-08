import { getStockPrice } from './store';

/**
 * 获取股票实时价格
 * 优先使用腾讯财经 API，失败则回退到模拟数据
 */
export async function fetchRealTimePrice(code: string): Promise<{ name: string; price: number } | null> {
  try {
    const query = getStockQuery(code);
    const url = `https://qt.gtimg.cn/q=${query}`;

    const res = await fetch(url, {
      headers: {
        'Referer': 'https://finance.qq.com',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // 读取为 ArrayBuffer，然后用 gbk 解码
    const buffer = await res.arrayBuffer();

    let text: string;
    try {
      text = new TextDecoder('gbk').decode(buffer);
    } catch {
      // gbk 不支持时回退到 latin1（保留 ASCII 数字）
      text = new TextDecoder('latin1').decode(buffer);
    }

    return parseTencentResponse(text, code);
  } catch {
    return getStockPrice(code);
  }
}

function getStockQuery(code: string): string {
  if (/^[A-Za-z]+$/.test(code)) return `us${code.toUpperCase()}`;
  if (/^\d{5}$/.test(code)) return `hk${code}`;
  if (/^\d{6}$/.test(code)) {
    if (code.startsWith('6')) return `sh${code}`;
    return `sz${code}`;
  }
  return `sh${code}`;
}

function parseTencentResponse(text: string, code: string): { name: string; price: number } | null {
  try {
    // 提取引号内的内容
    const quoteStart = text.indexOf('"');
    const quoteEnd = text.indexOf('"', quoteStart + 1);
    if (quoteStart < 0 || quoteEnd < 0) return getStockPrice(code);

    const content = text.substring(quoteStart + 1, quoteEnd);
    const fields = content.split('~');

    if (fields.length < 4) return getStockPrice(code);

    // 价格在第 3 位（0-indexed），始终是数字（ASCII）不受编码影响
    const price = parseFloat(fields[3]);

    if (isNaN(price) || price <= 0) return getStockPrice(code);

    // 名称在第 1 位，编码可能乱码，优先用模拟数据的名称
    const mockData = getStockPrice(code);
    let name = mockData?.name || code;

    // 如果 API 返回的名称看起来正常（包含中文字符或英文字符），就用它
    const apiName = fields[1];
    if (apiName && apiName.length > 0 && apiName.length < 50) {
      // 检查是否包含可识别的字符（非乱码）
      const hasReadableChars = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ffa-zA-Z0-9]/.test(apiName);
      if (hasReadableChars) {
        name = apiName;
      }
    }

    return { name, price };
  } catch {
    return getStockPrice(code);
  }
}
