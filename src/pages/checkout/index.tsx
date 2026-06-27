import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme, card, btnPrimary } from '@/lib/theme'

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
      <View style={{ minHeight: '100vh', backgroundColor: theme.bgPage, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, color: theme.textPrimary }}>✓</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, marginBottom: 8 }}>订单提交成功!</Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>我们会在24小时内联系您确认订单</Text>
        <View onClick={() => Taro.navigateBack()} style={btnPrimary}><Text style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary }}>返回首页</Text></View>
      </View>
    )
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: theme.bgPage }}>
      <View style={{ backgroundColor: theme.textPrimary, padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 16, fontWeight: 700, color: theme.bgCard }}>定制下单</Text>
      </View>
      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        <View style={{ padding: 14, ...card, marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary, marginBottom: 6 }}>定制说明</Text>
          <Text style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>提交定制需求后，我们会根据您选择的款式和珠子搭配进行手工制作。制作周期约3-5个工作日。</Text>
        </View>
        <View style={{ padding: 14, ...card, marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary, marginBottom: 10 }}>收货信息</Text>
          <Input placeholder='收件人姓名' value={receiver} onInput={(e) => setReceiver(e.detail.value)} style={{ padding: '12px 16px', backgroundColor: theme.bgWhite, borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, marginBottom: 8, fontSize: 13, color: theme.textBody }} />
          <Input placeholder='手机号码' value={phone} onInput={(e) => setPhone(e.detail.value)} style={{ padding: '12px 16px', backgroundColor: theme.bgWhite, borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, marginBottom: 8, fontSize: 13, color: theme.textBody }} />
          <Input placeholder='收货地址' value={address} onInput={(e) => setAddress(e.detail.value)} style={{ padding: '12px 16px', backgroundColor: theme.bgWhite, borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, marginBottom: 8, fontSize: 13, color: theme.textBody }} />
          <Input placeholder='备注（可选）' value={note} onInput={(e) => setNote(e.detail.value)} style={{ padding: '12px 16px', backgroundColor: theme.bgWhite, borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, fontSize: 13, color: theme.textBody }} />
        </View>
        <View onClick={handleSubmit} style={{ padding: '14px 0', borderRadius: theme.radiusPill, backgroundColor: valid ? theme.primary : theme.textDisabled, cursor: valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: 700, color: valid ? theme.textPrimary : theme.bgCard }}>{submitting ? '提交中...' : '提交定制需求'}</Text>
        </View>
        <View style={{ padding: '18px 0 28px', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, color: theme.textDisabled, letterSpacing: 2 }}>指尖流转 · 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
