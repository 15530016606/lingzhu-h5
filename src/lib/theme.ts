// 灵珠手作 — 暖色调 + 动物系卡片样式
// 卡片风格参考 animal-island-ui（奶油底色 + 米色边框 + 20px 圆角）

export const theme = {
  // 主色（暖琥珀 — 与柴犬毛色呼应）
  primary: '#d4a574',
  primaryDark: '#c4956a',
  primaryLight: '#f0e0d0',

  // 背景
  bgPage: '#f8f8f0',          // animal-island-ui 页面底
  bgCard: 'rgb(247,243,223)', // animal-island-ui 奶油卡片
  bgWhite: '#ffffff',
  bgInput: '#f0ede6',

  // 文字
  textPrimary: '#794f27',     // animal-island-ui 标题/按钮文字
  textBody: '#725d42',        // animal-island-ui 正文
  textSecondary: '#9f927d',   // animal-island-ui 辅助
  textDisabled: '#c4b89e',    // animal-island-ui 禁用/边框

  // 强调
  accent: '#c9a87c',
  accentLight: '#e8dcc8',
  error: '#e05a5a',
  success: '#6fba2c',

  // 边框与阴影
  border: '#c4b89e',          // animal-island-ui 边框
  borderLight: '#d4c9b4',
  shadow: '0 3px 10px rgba(61,52,40,0.10)',  // animal-island-ui 柔和阴影

  // 圆角
  radiusBtn: 25,
  radiusCard: 20,             // animal-island-ui 卡片圆角
  radiusSmall: 12,
  radiusTag: 6,
} as const
