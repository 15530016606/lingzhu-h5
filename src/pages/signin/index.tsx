import { useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { login, getMe, getMaterialsFromAPI, getBeadsFromAPI } from '@/lib/api'
import { syncBackpackFromAPI, clearBackpack } from '@/lib/backpack'
import { syncInventoryFromAPI, clearInventory } from '@/lib/inventory'

export default function SignInPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const valid = phone.trim().length > 0 && password.trim().length > 0

  const handleLogin = async () => {
    if (!valid || loading) return
    setLoading(true)
    try {
      const data = await login(phone.trim(), password.trim())
      if (data.token) {
        localStorage.setItem('token', data.token)
        // 清空旧缓存，从后端同步用户数据
        clearBackpack()
        clearInventory()
        const me = await getMe()
        if (me?.phone) localStorage.setItem('user_phone', me.phone)
        // 同步背包和珠子库存
        const mats = await getMaterialsFromAPI()
        if (Array.isArray(mats)) await syncBackpackFromAPI(mats)
        const beads = await getBeadsFromAPI()
        if (Array.isArray(beads)) await syncInventoryFromAPI(beads)
        Taro.showToast({ title: '登录成功', icon: 'success' })
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
      height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(180deg, #faf6ed 0%, #f5efe4 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{
        width: 44, height: 44, borderRadius: 14, marginBottom: 16,
        background: 'linear-gradient(135deg, #d4a574, #c4956a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(212,165,116,0.35)',
      }}>
        <span style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>灵</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1, marginBottom: 2 }}>欢迎回来</span>
      <span style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 28 }}>登录后继续你的手作之旅</span>

      {/* 表单卡片 */}
      <div style={{
        padding: 20, borderRadius: 18,
        background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}>
        <input
          placeholder='手机号码'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', background: '#f5f0e8',
            borderRadius: 12, marginBottom: 10, fontSize: 14, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <input
          placeholder='密码'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', background: '#f5f0e8',
            borderRadius: 12, marginBottom: 20, fontSize: 14, color: theme.textPrimary,
            border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div
          onClick={handleLogin}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 14,
            background: valid ? 'linear-gradient(135deg, #d4a574, #c4956a)' : '#e0dcd4',
            cursor: valid ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation', transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {loading ? '登录中...' : '登录'}
          </span>
        </div>
      </div>

      {/* 去注册 */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
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
