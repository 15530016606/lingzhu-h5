import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { ...headers, ...options?.headers as Record<string, string> } })
  return res.json()
}

export default function SignInPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const valid = phone.trim().length > 0 && password.trim().length > 0

  const handleLogin = async () => {
    if (!valid || loading) return
    setLoading(true)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      })
      if (data.token) {
        localStorage.setItem('token', data.token)
        Taro.navigateBack()
      } else {
        Taro.showToast({ title: data.message || '登录失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络错误', icon: 'none' })
    }
    setLoading(false)
  }

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      {/* Header */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, letterSpacing: 2 }}>欢迎回来</Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>登录后继续你的手作之旅</Text>
      </View>

      {/* Card */}
      <View style={{ padding: 24, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, boxShadow: theme.shadow }}>
        {/* Phone input */}
        <Input
          placeholder='手机号码'
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
          style={{ width: '100%', padding: '14px 16px', background: theme.bgInput, borderRadius: theme.radiusBtn, marginBottom: 12, fontSize: 14, color: theme.textPrimary, border: 'none', outline: 'none', boxSizing: 'border-box' }}
        />

        {/* Password input */}
        <Input
          placeholder='密码'
          password
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
          style={{ width: '100%', padding: '14px 16px', background: theme.bgInput, borderRadius: theme.radiusBtn, marginBottom: 20, fontSize: 14, color: theme.textPrimary, border: 'none', outline: 'none', boxSizing: 'border-box' }}
        />

        {/* Login button */}
        <View
          onClick={handleLogin}
          style={{ width: '100%', padding: '14px 0', borderRadius: theme.radiusBtn, background: valid ? theme.primary : theme.border, cursor: valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{loading ? '登录中...' : '登录'}</Text>
        </View>
      </View>

      {/* Register link */}
      <View style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <Text
          onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}
          style={{ fontSize: 13, color: theme.textSecondary, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          没有账号? 去注册
        </Text>
      </View>
    </View>
  )
}
