// 主题色配置（客户端安全）
export const themes: Record<string, { h: number; s: number; l: number; label: string }> = {
  default: { h: 0, s: 0, l: 55, label: '默认灰' },
  red: { h: 0, s: 60, l: 65, label: '淡红' },
  orange: { h: 30, s: 65, l: 62, label: '淡橙' },
  yellow: { h: 48, s: 60, l: 60, label: '淡黄' },
  green: { h: 150, s: 50, l: 58, label: '淡绿' },
  cyan: { h: 185, s: 55, l: 58, label: '淡青' },
  blue: { h: 220, s: 60, l: 65, label: '淡蓝' },
  purple: { h: 270, s: 50, l: 68, label: '淡紫' },
  pink: { h: 330, s: 55, l: 68, label: '淡粉' },
};
