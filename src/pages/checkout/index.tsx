import { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { calcWristSize, calcTotalPrice } from '@/data/bead-products'

const PAYMENT_METHODS = [
  { id: 'wechat', name: '微信支付', icon: '微信', desc: '推荐使用，快速安全' },
  { id: 'alipay', name: '支付宝', icon: '支', desc: '支持余额、花呗、银行卡' },
]

export default function CheckoutPage() {
  const { currentDesign, ropeColor, clearDesign } = useBeadStore()

  const [receiver, setReceiver] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wechat')
  const [submitting, setSubmitting] = useState(false)

  const wristSize = useMemo(() => calcWristSize(currentDesign), [currentDesign])
  const totalPrice = useMemo(() => calcTotalPrice(currentDesign), [currentDesign])

  const canSubmit = receiver.trim().length > 0 && phone.trim().length >= 7 && address.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)

    const order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      beadCount: currentDesign.length,
      ropeColor,
      wristSize,
      totalPrice,
      receiver: receiver.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
      paymentMethod,
      status: 'pending',
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))

    setSubmitting(false)
    // 跳转到支付确认页
    Taro.navigateTo({ url: `/pages/payment/index?orderId=${order.id}&total=${totalPrice}&method=${paymentMethod}` })
  }

  if (currentDesign.length === 0) {
    Taro.navigateBack()
    return null
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <View style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px', cursor: 'pointer', marginRight: 12 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>{'< 返回'}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>结算</Text>
      </View>

      <ScrollView scrollY style={{ flex: 1 }}>
        {/* ===== 订单摘要 ===== */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '14px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 64, height: 50, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BeadPreviewRing beads={currentDesign} ropeColor={ropeColor} onRemove={() => {}} compact />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
                定制手串 · {currentDesign.length}颗
              </Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>
                ¥{totalPrice.toFixed(2)}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#666' }}>
              手围 {wristSize}cm
            </Text>
            {/* 珠子简略标签 */}
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {Array.from(new Set(currentDesign.map(b => b.name))).slice(0, 3).map((name) => (
                <View key={name} style={{ padding: '1px 6px', borderRadius: 4, backgroundColor: '#f0f0f0' }}>
                  <Text style={{ fontSize: 10, color: '#888' }}>{name}</Text>
                </View>
              ))}
              {new Set(currentDesign.map(b => b.name)).size > 3 && (
                <View style={{ padding: '1px 6px', borderRadius: 4, backgroundColor: '#f0f0f0' }}>
                  <Text style={{ fontSize: 10, color: '#888' }}>+{new Set(currentDesign.map(b => b.name)).size - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ===== 收货信息 ===== */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '14px 16px 20px' }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 14 }}>收货信息</Text>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 6, fontWeight: 500 }}>收货人姓名 *</Text>
            <View style={{ border: '1px solid #e8e8e8', borderRadius: 8, backgroundColor: '#fafafa', overflow: 'hidden' }}>
              <Input
                style={{ width: '100%', height: 42, lineHeight: '42px', padding: '0 12px', fontSize: 14, color: '#1a1a2e', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                placeholder="请输入收货人姓名"
                value={receiver}
                onInput={(e: any) => setReceiver(e.detail.value)}
              />
            </View>
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 6, fontWeight: 500 }}>手机号码 *</Text>
            <View style={{ border: '1px solid #e8e8e8', borderRadius: 8, backgroundColor: '#fafafa', overflow: 'hidden' }}>
              <Input
                style={{ width: '100%', height: 42, lineHeight: '42px', padding: '0 12px', fontSize: 14, color: '#1a1a2e', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                placeholder="请输入手机号码"
                value={phone}
                onInput={(e: any) => setPhone(e.detail.value)}
              />
            </View>
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 6, fontWeight: 500 }}>收货地址 *</Text>
            <View style={{ border: '1px solid #e8e8e8', borderRadius: 8, backgroundColor: '#fafafa', overflow: 'hidden' }}>
              <Input
                style={{ width: '100%', height: 42, lineHeight: '42px', padding: '0 12px', fontSize: 14, color: '#1a1a2e', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                placeholder="省 / 市 / 区 / 详细地址"
                value={address}
                onInput={(e: any) => setAddress(e.detail.value)}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 6, fontWeight: 500 }}>备注</Text>
            <View style={{ border: '1px solid #e8e8e8', borderRadius: 8, backgroundColor: '#fafafa', overflow: 'hidden' }}>
              <Input
                style={{ width: '100%', height: 42, lineHeight: '42px', padding: '0 12px', fontSize: 14, color: '#1a1a2e', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                placeholder="可选，如颜色偏好等"
                value={note}
                onInput={(e: any) => setNote(e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* ===== 支付方式 ===== */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '14px 16px' }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>支付方式</Text>
          {PAYMENT_METHODS.map((pm) => {
            const selected = paymentMethod === pm.id
            return (
              <View
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10,
                  padding: '12px 10px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                  border: selected ? '1.5px solid #2c3e50' : '1px solid #e8e8e8',
                  backgroundColor: selected ? 'rgba(44,62,80,0.04)' : '#ffffff',
                }}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  backgroundColor: selected ? '#2c3e50' : '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 12, color: selected ? '#ffffff' : '#666', fontWeight: 600 }}>{pm.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>{pm.name}</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>{pm.desc}</Text>
                </View>
                {selected && (
                  <View style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#fff' }}>✓</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== 底部提交 ===== */}
      <View style={{ padding: '12px 16px', paddingBottom: 28, backgroundColor: '#ffffff', borderTop: '1px solid #e8e8e8' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 13, color: '#666' }}>合计</Text>
          <Text style={{ fontSize: 20, fontWeight: 700, color: '#c0392b' }}>¥{totalPrice.toFixed(2)}</Text>
        </View>
        <View
          onClick={canSubmit ? handleSubmit : undefined}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            backgroundColor: canSubmit ? '#2c3e50' : '#ccc',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
            {submitting ? '提交中...' : '提交订单'}
          </Text>
        </View>
        {!canSubmit && (
          <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 6 }}>请填写完整的收货信息</Text>
        )}
      </View>
    </View>
  )
}
