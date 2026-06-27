// animal-island-ui 设计系统 Token
// 样式参考自 animal-island-ui（动物森友会风格）

export const theme = {
  // 颜色
  bgPage: '#f8f8f0',
  bgCard: 'rgb(247, 243, 223)',
  bgWhite: '#ffffff',
  primary: '#19c8b9',
  primaryHover: '#3dd4c6',
  primaryActive: '#11a89b',
  textPrimary: '#794f27',
  textBody: '#725d42',
  textSecondary: '#9f927d',
  textDisabled: '#c4b89e',
  border: '#c4b89e',
  borderHover: '#a89878',
  shadowBtn: '#bdaea0',
  shadowInput: '#d4c9b4',
  focusYellow: '#ffcc00',
  success: '#6fba2c',
  error: '#e05a5a',
  warning: '#f5c31c',

  // 圆角
  radiusPill: 50,
  radiusCard: 20,
  radiusSmall: 12,

  // 阴影
  shadow3d: '0 5px 0 0 #bdaea0',
  shadowSoft: '0 3px 10px rgba(61,52,40,0.10)',
} as const

// 通用样式辅助函数
export const card = {
  background: theme.bgCard,
  borderRadius: theme.radiusCard,
  border: `2px solid ${theme.border}`,
  boxShadow: theme.shadowSoft,
}

export const btnPrimary = {
  background: theme.primary,
  color: theme.textPrimary,
  borderRadius: theme.radiusPill,
  border: 'none',
  boxShadow: theme.shadow3d,
  fontWeight: 700,
  fontSize: 15,
  padding: '12px 28px',
  cursor: 'pointer',
}

export const btnDisabled = {
  ...btnPrimary,
  background: theme.textDisabled,
  boxShadow: `0 5px 0 0 ${theme.shadowInput}`,
  opacity: 0.6,
  cursor: 'not-allowed',
}

export const input = {
  width: '100%',
  padding: '12px 16px',
  background: theme.bgWhite,
  borderRadius: theme.radiusPill,
  border: `2px solid ${theme.border}`,
  color: theme.textBody,
  fontSize: 14,
  outline: 'none',
  boxShadow: `inset 0 2px 4px ${theme.shadowInput}`,
}
