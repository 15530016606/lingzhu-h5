import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_BASE || ''

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  return res.json()
}

export default function CheckoutPage() {
  const [receiver, setReceiver] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = receiver.trim().length > 0 && phone.trim().length >= 7 && address.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ receiver, phone, address, note }),
      })
      setSubmitted(true)
    } catch (e) {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, color: '#fff' }}>✓</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50', marginBottom: 8 }}>订单提交成功!</Text>
        <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 }}>
          我们会在24小时内联系您确认订单
        </Text>
        <View
          onClick={() => Taro.navigateBack()}
          style={{ padding: '10px 24px', borderRadius: 20, backgroundColor: '#2c3e50', cursor: 'pointer' }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>返回首页</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#2c3e50', padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>定制下单</Text>
      </View>

      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {/* 订单说明 */}
        <View style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#2c3e50', marginBottom: 6 }}>定制说明</Text>
          <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.6 }}>
            提交定制需求后，我们会根据您选择的手串款式和珠子搭配进行手工制作。制作周期约3-5个工作日，支持微信/支付宝支付。
          </Text>
        </View>

        {/* 联系信息 */}
        <View style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#2c3e50', marginBottom: 10 }}>收货信息</Text>
          <Input
            placeholder='收件人姓名'
            value={receiver}
            onInput={(e) => setReceiver(e.detail.value)}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8, fontSize: 13 }}
          />
          <Input
            placeholder='手机号码'
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8, fontSize: 13 }}
          />
          <Input
            placeholder='收货地址'
            value={address}
            onInput={(e) => setAddress(e.detail.value)}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8, fontSize: 13 }}
          />
          <Input
            placeholder='备注（可选）'
            value={note}
            onInput={(e) => setNote(e.detail.value)}
            style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f5f5f5', borderRadius: 8, fontSize: 13 }}
          />
        </View>

        {/* 提交按钮 */}
        <View
          onClick={handleSubmit}
          style={{
            padding: '14px 0', borderRadius: 12,
            backgroundColor: canSubmit ? '#2c3e50' : '#ccc', cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
            {submitting ? '提交中...' : '提交定制需求'}
          </Text>
        </View>

        <View style={{ padding: '18px 0 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, color: '#ccc', letterSpacing: 2 }}>指尖流转 · 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
