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
        // 获取用户信息
        const me = await api('/auth/me')
        if (me) {
          localStorage.setItem('user_phone', me.phone || phone.trim())
        }
        Taro.showToast({ title: '登录成功', icon: 'success' })
        // 跳回首页
        setTimeout(() => { window.location.hash = '#/pages/index/index' }, 300)
      } else {
        Taro.showToast({ title: data.message || '登录失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络错误', icon: 'none' })
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #faf6ed 0%, #f5efe4 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px',
    }}>
      {/* Logo */}
      <div style={{
        width: 48, height: 48, borderRadius: 16, marginBottom: 20,
        background: 'linear-gradient(135deg, #d4a574, #c4956a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(212,165,116,0.35)',
      }}>
        <span style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>灵</span>
      </div>
      <span style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1, marginBottom: 4 }}>欢迎回来</span>
      <span style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 32 }}>登录后继续你的手作之旅</span>

      {/* 表单卡片 */}
      <div style={{
        padding: 24, borderRadius: 20,
        background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}>
        <input
          placeholder='手机号码'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '100%', padding: '14px 16px', background: '#f5f0e8',
            borderRadius: 14, marginBottom: 12, fontSize: 15, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <input
          placeholder='密码'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '14px 16px', background: '#f5f0e8',
            borderRadius: 14, marginBottom: 24, fontSize: 15, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div
          onClick={handleLogin}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 16,
            background: valid ? 'linear-gradient(135deg, #d4a574, #c4956a)' : '#e0dcd4',
            cursor: valid ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation', transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
            {loading ? '登录中...' : '登录'}
          </span>
        </div>
      </div>

      {/* 去注册 */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span
          onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}
          style={{ fontSize: 13, color: theme.accent, cursor: 'pointer', touchAction: 'manipulation', fontWeight: 500 }}
        >
          没有账号? 去注册
        </span>
      </div>
    </div>
  )
}
