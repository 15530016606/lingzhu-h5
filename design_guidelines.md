# 灵珠手作 · 设计指南

## 品牌定位
- **应用**：灵珠手作 — 编手串 + 测运势的微信小游戏
- **设计风格**：深色流光 · 神秘奢华
- **目标用户**：年轻女性为主，喜爱手作、国风、玄学元素
- **配色意象**：夜幕中的珠宝展柜，暖金灯光照在珠串上

## 配色方案

### 主色板
| 用途 | Tailwind 类名 | 色值 | 说明 |
|------|--------------|------|------|
| 页面背景 | `bg-[#0D0D1A]` | #0D0D1A | 夜幕深蓝 |
| 卡片背景 | `bg-[#1A1030]` | #1A1030 | 深紫渐变 |
| 主文字 | `text-[#F5E6C8]` | #F5E6C8 | 暖白金色 |
| 强调色 | `text-[#D4A84B]` | #D4A84B | 古铜金 |
| 辅助金 | `text-[#8B7D6B]` | #8B7D6B | 暗金 |
| 点缀金 | `text-[#FFD700]` | #FFD700 | 璀璨金 |
| 警告红 | `text-[#FF6B6B]` | #FF6B6B | 额度不足提示 |

### 语义色
- **主按钮**：`bg-gradient-to-r from-[#D4A84B] to-[#FFD700] text-[#0D0D1A]`
- **次级按钮**：`border border-[#D4A84B] text-[#D4A84B] bg-transparent`
- **禁用态**：`opacity-40`

## 字体规范
| 层级 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| H1 大标题 | `text-2xl` | `font-bold` | `text-[#F5E6C8]` |
| H2 副标题 | `text-lg` | `font-semibold` | `text-[#F5E6C8]` |
| 正文 | `text-sm` | `font-normal` | `text-[#C0B090]` |
| 标注 | `text-xs` | `font-normal` | `text-[#8B7D6B]` |

## 间距系统
- **页面边距**：`px-5 py-6`
- **卡片内边距**：`p-4`（卡片） `p-3`（小卡片）
- **列表间距**：`gap-4`（卡片之间） `gap-3`（紧凑）
- **圆角**：卡片 `rounded-2xl`，按钮 `rounded-xl`，小元素 `rounded-lg`

## 组件选型原则（CRITICAL）
- **所有通用 UI 组件优先使用 `@/components/ui/*`**
- 按钮 → `@/components/ui/button`
- 卡片 → `@/components/ui/card`（Card, CardContent, CardHeader）
- 输入框 → `@/components/ui/input`
- 弹窗 → `@/components/ui/dialog`
- 轻提示 → `@/components/ui/sonner`（Toast）
- 标签/徽标 → `@/components/ui/badge`
- 骨架屏 → `@/components/ui/skeleton`
- 进度条 → `@/components/ui/progress`
- 标签页 → `@/components/ui/tabs`
- 开关 → `@/components/ui/switch`
- **禁止使用 View/Text 手搓上述通用组件**

## 导航结构
- 无底部 TabBar（单页流程应用）
- 页面间通过 `Taro.navigateTo` 跳转
- 首页独占入口，后续流程为线性：首页 → 选材质 → 选颜色 → 选配珠 → 3D预览 → 结果卡 → 首页

## 小程序约束
- Canvas 渲染使用 Taro Canvas 组件（2D 模式）
- 图片资源尽量使用 SVG 内联或 base64（减少网络请求）
- 材质贴图数据存放在本地 JSON 中（避免首次加载过慢）
- 结果卡生成使用 Canvas 绘制合成图片