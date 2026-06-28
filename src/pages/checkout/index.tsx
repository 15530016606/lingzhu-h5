import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

export default function CheckoutPage() {
  const [receiver, setReceiver] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const valid = receiver.trim().length > 0 && phone.trim().length >= 7 && address.trim().length > 0

  const handleSubmit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      await api('/user/process', { method: 'POST', body: JSON.stringify({ materialTypeId: 'test' }) })
      setSubmitted(true)
    } catch { Taro.showToast({ title: '提交失败', icon: 'none' }) }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <View style={{ minHeight: '100vh', background: theme.bgPage, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ width: 60, height: 60, borderRadius: '50%', background: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>OK</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 8 }}>订单提交成功</Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>我们会在24小时内联系您确认订单</Text>
        <View onClick={() => Taro.navigateBack()} style={{ background: theme.primary, borderRadius: theme.radiusBtn, padding: '12px 28px', cursor: 'pointer' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>返回首页</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }}>
      <View style={{ background: theme.textPrimary, padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>定制下单</Text>
      </View>
      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        <View style={{ padding: 14, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 6 }}>定制说明</Text>
          <Text style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>提交定制需求后，我们会根据您选择的款式和珠子搭配进行手工制作。制作周期约3-5个工作日。</Text>
        </View>
        <View style={{ padding: 14, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>收货信息</Text>
          <Input placeholder='收件人姓名' value={receiver} onInput={(e) => setReceiver(e.detail.value)} style={{ padding: '12px 14px', background: theme.bgInput, borderRadius: theme.radiusBtn, marginBottom: 8, fontSize: 13, color: theme.textPrimary }} />
          <Input placeholder='手机号码' value={phone} onInput={(e) => setPhone(e.detail.value)} style={{ padding: '12px 14px', background: theme.bgInput, borderRadius: theme.radiusBtn, marginBottom: 8, fontSize: 13, color: theme.textPrimary }} />
          <Input placeholder='收货地址' value={address} onInput={(e) => setAddress(e.detail.value)} style={{ padding: '12px 14px', background: theme.bgInput, borderRadius: theme.radiusBtn, marginBottom: 8, fontSize: 13, color: theme.textPrimary }} />
          <Input placeholder='备注 (可选)' value={note} onInput={(e) => setNote(e.detail.value)} style={{ padding: '12px 14px', background: theme.bgInput, borderRadius: theme.radiusBtn, fontSize: 13, color: theme.textPrimary }} />
        </View>
        <View onClick={handleSubmit} style={{ padding: '14px 0', borderRadius: theme.radiusBtn, background: valid ? theme.primary : theme.border, cursor: valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{submitting ? '提交中...' : '提交定制需求'}</Text>
        </View>
        <View style={{ padding: '18px 0 28px', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10, color: theme.textDisabled, letterSpacing: 3 }}>指尖流转 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
