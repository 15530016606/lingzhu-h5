import { useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { register, getMe, getMaterialsFromAPI, getBeadsFromAPI } from '@/lib/api'
import { syncBackpackFromAPI, clearBackpack } from '@/lib/backpack'
import { syncInventoryFromAPI, clearInventory } from '@/lib/inventory'

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
    if (password.length < 4) {
      Taro.showToast({ title: '密码至少4位', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const data = await register(phone.trim(), password.trim())
      if (data.token) {
        localStorage.setItem('token', data.token)
        // 清空旧缓存
        clearBackpack()
        clearInventory()
        localStorage.setItem('user_phone', phone.trim())
        Taro.showToast({ title: '注册成功', icon: 'success' })
        setTimeout(() => { window.location.hash = '#/pages/index/index' }, 300)
      } else {
        Taro.showToast({ title: data.message || '注册失败', icon: 'none' })
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
      <span style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1, marginBottom: 4 }}>创建账号</span>
      <span style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 32 }}>注册后即可开始手作体验</span>

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
          placeholder='密码（至少4位）'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '14px 16px', background: '#f5f0e8',
            borderRadius: 14, marginBottom: 12, fontSize: 15, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <input
          placeholder='确认密码'
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: '100%', padding: '14px 16px', background: '#f5f0e8',
            borderRadius: 14, marginBottom: 24, fontSize: 15, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div
          onClick={handleRegister}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 16,
            background: valid ? 'linear-gradient(135deg, #d4a574, #c4956a)' : '#e0dcd4',
            cursor: valid ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation', transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
            {loading ? '注册中...' : '创建账号'}
          </span>
        </div>
      </div>

      {/* 去登录 */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span
          onClick={() => Taro.navigateTo({ url: '/pages/signin/index' })}
          style={{ fontSize: 13, color: theme.accent, cursor: 'pointer', touchAction: 'manipulation', fontWeight: 500 }}
        >
          已有账号? 去登录
        </span>
      </div>
    </div>
  )
}
