import { useState } from 'react'
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

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const valid = phone.trim().length > 0 && password.trim().length > 0 && password === confirmPassword

  const handleRegister = async () => {
    if (!valid || loading) return
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      })
      if (data.token) {
        localStorage.setItem('token', data.token)
        Taro.navigateBack()
      } else {
        Taro.showToast({ title: data.message || '注册失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络错误', icon: 'none' })
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, letterSpacing: 2 }}>创建账号</span>
        <span style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>注册后即可开始手作体验</span>
      </div>

      {/* Card */}
      <div style={{ padding: 24, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, boxShadow: theme.shadow }}>
        {/* Phone input */}
        <input
          placeholder='手机号码'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', background: '#f5f0e8', borderRadius: theme.radiusBtn, marginBottom: 12, fontSize: 14, color: theme.textPrimary, border: 'none', outline: 'none', boxSizing: 'border-box' }}
        />

        {/* Password input */}
        <input
          placeholder='密码'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', background: '#f5f0e8', borderRadius: theme.radiusBtn, marginBottom: 12, fontSize: 14, color: theme.textPrimary, border: 'none', outline: 'none', boxSizing: 'border-box' }}
        />

        {/* Confirm password input */}
        <input
          placeholder='确认密码'
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', background: '#f5f0e8', borderRadius: theme.radiusBtn, marginBottom: 20, fontSize: 14, color: theme.textPrimary, border: 'none', outline: 'none', boxSizing: 'border-box' }}
        />

        {/* Register button */}
        <div
          onClick={handleRegister}
          style={{ width: '100%', padding: '14px 0', borderRadius: theme.radiusBtn, background: valid ? theme.primary : theme.border, cursor: valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{loading ? '注册中...' : '注册'}</span>
        </div>
      </div>

      {/* Sign in link */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <span
          onClick={() => Taro.navigateTo({ url: '/pages/signin/index' })}
          style={{ fontSize: 13, color: theme.textSecondary, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, touchAction: 'manipulation' }}
        >
          已有账号? 去登录
        </span>
      </div>
    </div>
  )
}
