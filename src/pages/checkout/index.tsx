import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { BEAD_PRODUCTS, BeadProduct } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'

const BASE_URL = 'http://localhost:3000'
const CRAFT_FEE = 500 // ¥5.00 in cents

function parsePrice(p: any): number {
  if (typeof p === 'number') return p
  if (typeof p === 'string') {
    const n = parseFloat(p.replace(/[¥￥,]/g, ''))
    return isNaN(n) ? 0 : Math.round(n * 100)
  }
  return 0
}

export default function CheckoutPage() {
  const params = Taro.getCurrentInstance().router?.params as any
  const beadIds: number[] = params?.beads ? params.beads.split(',').map(Number) : []
  const designName = params?.name ? decodeURIComponent(params.name) : '自定义手串'
  const ropeColor = params?.rope ? decodeURIComponent(params.rope) : 'rgba(180,180,180,0.6)'

  const [receiver, setReceiver] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 按 bead id 分组统计
  const beadSummary = useMemo(() => {
    const map = new Map<number, { product: BeadProduct; count: number }>()
    for (const id of beadIds) {
      const p = BEAD_PRODUCTS[id]
      if (!p) continue
      const exist = map.get(id)
      if (exist) {
        exist.count++
      } else {
        map.set(id, { product: p, count: 1 })
      }
    }
    return Array.from(map.values())
  }, [beadIds])

  const beads: BeadProduct[] = beadIds.map(id => BEAD_PRODUCTS[id]).filter(Boolean)

  const beadSubtotal = beadSummary.reduce((s, item) => {
    return s + parsePrice(item.product.price) * item.count
  }, 0)

  const totalPrice = beadSubtotal + CRAFT_FEE

  const valid = receiver.trim().length > 0 && phone.trim().length >= 7 && address.trim().length > 0

  const handleSubmit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token') || ''
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${BASE_URL}/api/user/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          beads: beadSummary.map(item => ({
            name: item.product.name,
            materialType: (item.product as any).categoryId || '',
            quality: '普通',
            count: item.count,
          })),
          ropeColor,
          receiver, phone, address, note,
          totalPrice,
        }),
      })
      const data = await res.json()
      if (data.success) setSubmitted(true)
      else Taro.showToast({ title: data.message || '提交失败', icon: 'none' })
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bgPage, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#9db9a5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>OK</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 8 }}>订单提交成功</span>
        <span style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>我们会在24小时内联系您确认订单</span>
        <div onClick={() => window.location.hash = '#/pages/index/index'} style={{ background: `linear-gradient(135deg, ${theme.primary}, #c4956a)`, borderRadius: 20, padding: '12px 28px', cursor: 'pointer', touchAction: 'manipulation' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>返回首页</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

        {/* 顶部 */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <span onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: theme.textSecondary, marginRight: 10, cursor: 'pointer', touchAction: 'manipulation', padding: '2px 4px' }}>‹</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>{designName}</span>
        </div>

        {/* 手串预览 */}
        <div style={{
          background: theme.bgCard, borderRadius: 16,
          border: `1px solid ${theme.borderLight}`, marginBottom: 14,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: '14px 14px 10px',
        }}>
          <div style={{ height: 160, marginBottom: 6 }}>
            <BeadPreviewRing beads={beads} ropeColor={ropeColor} onRemove={() => {}} compact static />
          </div>
        </div>

        {/* 珠子明细 */}
        <div style={{
          background: theme.bgCard, borderRadius: 16,
          border: `1px solid ${theme.borderLight}`, marginBottom: 14,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10, display: 'block' }}>
            珠子明细（共{beadIds.length}颗）
          </span>
          {beadSummary.map((item, i) => {
            const unitPrice = parsePrice(item.product.price)
            const subtotal = unitPrice * item.count
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center',
                padding: '8px 0', borderBottom: i < beadSummary.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginRight: 10,
                  background: `radial-gradient(circle at 35% 30%, #e8e0d8, #d0c8b8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{item.product.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{item.product.name}</span>
                </div>
                <span style={{ fontSize: 11, color: theme.textSecondary, marginRight: 10 }}>x{item.count}</span>
                <span style={{ fontSize: 11, color: theme.textSecondary, marginRight: 10 }}>¥{(unitPrice / 100).toFixed(2)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>¥{(subtotal / 100).toFixed(2)}</span>
              </div>
            )
          })}
        </div>

        {/* 费用汇总 */}
        <div style={{
          background: theme.bgCard, borderRadius: 16,
          border: `1px solid ${theme.borderLight}`, marginBottom: 14,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>珠子小计</span>
            <span style={{ fontSize: 12, color: theme.textPrimary }}>¥{(beadSubtotal / 100).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>手工费</span>
            <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>¥{(CRAFT_FEE / 100).toFixed(2)}</span>
          </div>
          <div style={{ height: 1, background: theme.borderLight, marginVertical: 6 }} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary }}>合计</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>¥{(totalPrice / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* 收货信息 */}
        <div style={{
          background: theme.bgCard, borderRadius: 16,
          border: `1px solid ${theme.borderLight}`, marginBottom: 14,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 12, display: 'block' }}>收货信息</span>
          <input placeholder='收件人' value={receiver} onChange={e => setReceiver(e.target.value)}
            style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box', padding: '0 4px' }} />
          <input placeholder='手机号' value={phone} onChange={e => setPhone(e.target.value)}
            style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box', padding: '0 4px' }} />
          <input placeholder='收货地址' value={address} onChange={e => setAddress(e.target.value)}
            style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box', padding: '0 4px' }} />
          <input placeholder='备注（选填）' value={note} onChange={e => setNote(e.target.value)}
            style={{ height: 40, fontSize: 13, color: theme.textSecondary, width: '100%', border: 'none', outline: 'none', boxSizing: 'border-box', padding: '0 4px' }} />
        </div>

        {/* 提交按钮 */}
        <div onClick={handleSubmit} style={{
          padding: '14px 0', borderRadius: 16, textAlign: 'center',
          background: valid ? `linear-gradient(135deg, ${theme.primary}, #c4956a)` : theme.borderLight,
          cursor: valid ? 'pointer' : 'default',
          opacity: valid ? 1 : 0.5, touchAction: 'manipulation', marginBottom: 24,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: valid ? '#fff' : theme.textDisabled }}>
            {submitting ? '提交中...' : `提交订单 ¥${(totalPrice / 100).toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  )
}
