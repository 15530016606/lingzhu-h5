import { useCallback, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { BEAD_PRODUCTS, BeadProduct } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'

const BASE_URL = 'http://localhost:3000'

export default function CheckoutPage() {
  const params = Taro.getCurrentInstance().router?.params as any
  const beadIds = params?.beads ? params.beads.split(',').map(Number) : []
  const ropeColor = params?.rope ? decodeURIComponent(params.rope) : 'rgba(180,180,180,0.6)'
  const beadCount = params?.count ? parseInt(params.count) : beadIds.length

  const beads: BeadProduct[] = beadIds
    .map(id => BEAD_PRODUCTS[id])
    .filter(Boolean)

  const [receiver, setReceiver] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const valid = receiver.trim().length > 0 && phone.trim().length >= 7 && address.trim().length > 0
  const totalPrice = beads.reduce((s, b) => s + (b.price || 0), 0)

  const handleSubmit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const token = Taro.getStorageSync('token') || ''
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${BASE_URL}/api/user/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          beads: beadIds,
          ropeColor,
          address: { receiver, phone, address, note },
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
        <div onClick={() => Taro.navigateBack()} style={{ background: theme.primary, borderRadius: theme.radiusBtn, padding: '12px 28px', cursor: 'pointer', touchAction: 'manipulation' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>返回首页</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

        {/* 订单摘要 */}
        {beads.length > 0 && (
          <div style={{
            background: theme.bgCard, borderRadius: theme.radiusCard,
            border: `1px solid ${theme.borderLight}`, marginBottom: 16,
            boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>
              手串设计 ({beadCount}颗)
            </span>
            <div style={{ height: 140, marginBottom: 8 }}>
              <BeadPreviewRing beads={beads} ropeColor={ropeColor} onRemove={() => {}} compact />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {beads.map((b, i) => (
                <div key={i} style={{
                  padding: '2px 8px', borderRadius: 8, background: theme.borderLight,
                }}>
                  <span style={{ fontSize: 9, color: theme.textSecondary }}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 收货信息 */}
        <div style={{
          background: theme.bgCard, borderRadius: theme.radiusCard,
          border: `1px solid ${theme.borderLight}`, marginBottom: 16,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>收货信息</span>
          <div style={{ marginBottom: 10 }}>
            <input placeholder='收件人' value={receiver} onChange={e => setReceiver(e.target.value)}
              style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input placeholder='手机号' value={phone} onChange={e => setPhone(e.target.value)}
              style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input placeholder='收货地址' value={address} onChange={e => setAddress(e.target.value)}
              style={{ height: 40, fontSize: 13, color: theme.textPrimary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <input placeholder='备注（选填）' value={note} onChange={e => setNote(e.target.value)}
              style={{ height: 40, fontSize: 13, color: theme.textSecondary, width: '100%', border: 'none', borderBottom: `1px solid ${theme.borderLight}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* 金额 */}
        <div style={{
          background: theme.bgCard, borderRadius: theme.radiusCard,
          border: `1px solid ${theme.borderLight}`, marginBottom: 16,
          boxShadow: `0 2px 12px ${theme.shadow}`, padding: 16, display: 'flex',
          flexDirection: 'row', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: theme.textSecondary }}>预估金额</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: theme.accent }}>¥{(totalPrice / 100).toFixed(2)}</span>
        </div>

        {/* 提交按钮 */}
        <div onClick={handleSubmit} onTouchEnd={handleSubmit} style={{
          padding: '14px 0', borderRadius: theme.radiusBtn,
          background: valid ? `linear-gradient(135deg, ${theme.primary}, #c4956a)` : theme.borderLight,
          alignItems: 'center', marginBottom: 24, cursor: valid ? 'pointer' : 'default',
          opacity: valid ? 1 : 0.5, touchAction: 'manipulation',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: valid ? '#fff' : theme.textDisabled }}>
            {submitting ? '提交中...' : '提交订单'}
          </span>
        </div>
      </div>
    </div>
  )
}
