// 灵珠手作 — 清新设计系统
// 灵感来源：自然、柔和、手工质感

export const theme = {
  // 主色
  primary: '#9db9a5',       // 鼠尾草绿 — 主按钮/选中态
  primaryDark: '#7da08a',   // 深鼠尾草 — hover
  primaryLight: '#d1e3d5',  // 浅鼠尾草 — 选中背景

  // 背景
  bgPage: '#f7f5ef',        // 暖白米色 — 页面背景
  bgCard: '#ffffff',        // 纯白 — 卡片背景
  bgInput: '#f0ede6',       // 浅米 — 输入框背景

  // 文字
  textPrimary: '#4a4a4a',   // 深灰 — 标题/正文
  textBody: '#666666',      // 中灰 — 正文
  textSecondary: '#9a9a9a', // 浅灰 — 辅助文字
  textDisabled: '#cccccc',  // 最浅灰 — 禁用

  // 强调
  accent: '#c9a87c',        // 沙金色 — 点缀/收藏/稀有
  accentLight: '#e8dcc8',   // 浅沙金 — 标签
  error: '#d4827a',         // 柔红 — 错误/失败
  success: '#7db87d',       // 柔绿 — 成功

  // 边框与阴影
  border: '#e5ddd5',        // 浅暖灰 — 边框
  borderLight: '#f0eae3',   // 更浅 — 卡片边框
  shadow: 'rgba(100, 90, 80, 0.08)',  // 柔和阴影

  // 圆角
  radiusBtn: 25,     // pill 按钮
  radiusCard: 16,    // 卡片
  radiusSmall: 10,   // 小元素
  radiusTag: 6,      // 标签
} as const
