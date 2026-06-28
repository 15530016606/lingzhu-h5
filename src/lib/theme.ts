// 灵珠手作 — 暖色调设计系统
// 与柴犬 GIF 呼应：暖琥珀色 + 米白 + 陶土

export const theme = {
  // 主色（暖琥珀 — 与柴犬毛色呼应）
  primary: '#d4a574',       // 暖琥珀 — 主按钮/选中态
  primaryDark: '#c4956a',   // 深琥珀 — hover
  primaryLight: '#f0e0d0',  // 浅琥珀 — 选中背景

  // 背景
  bgPage: '#f7f5ef',        // 暖白米色 — 页面背景
  bgCard: '#ffffff',        // 纯白 — 卡片背景
  bgInput: '#f0ede6',       // 浅米 — 输入框背景

  // 文字
  textPrimary: '#4a3f35',   // 暖深褐 — 标题/正文
  textBody: '#6b5d4f',      // 暖中褐 — 正文
  textSecondary: '#9a8a7a', // 暖浅褐 — 辅助文字
  textDisabled: '#c4b8a8',  // 暖灰 — 禁用

  // 强调
  accent: '#c9a87c',        // 沙金色 — 点缀/收藏/稀有
  accentLight: '#e8dcc8',   // 浅沙金 — 标签
  error: '#d4827a',         // 柔红 — 错误/失败
  success: '#8fb88a',       // 柔绿 — 成功

  // 边框与阴影
  border: '#e5ddd5',        // 浅暖灰 — 边框
  borderLight: '#f0eae3',   // 更浅 — 卡片边框
  shadow: 'rgba(90, 74, 58, 0.08)',  // 暖调阴影

  // 圆角
  radiusBtn: 25,     // pill 按钮
  radiusCard: 16,    // 卡片
  radiusSmall: 10,   // 小元素
  radiusTag: 6,      // 标签
} as const
