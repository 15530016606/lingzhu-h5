import { useEffect } from 'react'
import Taro from '@tarojs/taro'

export default function RegisterPage() {
  useEffect(() => {
    Taro.showToast({ title: '展示版无需注册', icon: 'none' })
    setTimeout(() => { window.location.hash = '#/pages/index/index' }, 500)
  }, [])
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ed' }}>
      <span style={{ fontSize: 13, color: '#928370' }}>展示版无需注册，正在跳转...</span>
    </div>
  )
}
