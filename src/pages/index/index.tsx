import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { BEAD_PRODUCTS } from '@/data/bead-products'

const IndexPage = () => {
  const { dailyRecord, signInRecords, getStreakCount } = useBeadStore()
  const [streakCount, setStreakCount] = useState(0)
  const [dailyUsed, setDailyUsed] = useState(0)

  useEffect(() => {
    setStreakCount(getStreakCount())
    setDailyUsed(dailyRecord.count)
  }, [signInRecords, dailyRecord])

  const goToFree = () => Taro.navigateTo({ url: '/pages/bead-designer/index' })
  const goToWish = () => Taro.navigateTo({ url: '/pages/quiz/index' })
  const goToCouple = () => Taro.navigateTo({ url: '/pages/couple/index' })
  const goToSignIn = () => Taro.navigateTo({ url: '/pages/signin/index' })
  const goToFavorites = () => Taro.showToast({ title: '收藏功能开发中', icon: 'none' })

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
      {/* Logo */}
      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50' }}>灵珠手作</Text>
        <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>编一串好运 · 测每日运势</Text>
      </View>

      {/* 主入口 — 点击进入设计器 */}
      <View
        style={{
          width: '100%',
          maxWidth: 320,
          height: 180,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          cursor: 'pointer',
          border: '1px solid #e8e8e8',
        }}
        onClick={goToFree}
      >
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 32, color: '#c8a96e', letterSpacing: 4, opacity: 0.5 }}>◯ ◯ ◯</Text>
          <Text style={{ fontSize: 16, color: '#666' }}>点我开始编串</Text>
          <Text style={{ fontSize: 12, color: '#bbb' }}>206 种珠子随心搭配</Text>
        </View>
      </View>

      {/* 数据卡片 */}
      <View style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8' }}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>今日已编</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>{dailyUsed}/3</Text>
        </View>
        <View style={{ width: 1, height: 32, backgroundColor: '#e8e8e8' }} />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>连续签到</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{streakCount}天</Text>
        </View>
      </View>

      {/* 三个入口 */}
      <ScrollView scrollY style={{ width: '100%', flex: 1 }}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16, maxWidth: 320, marginHorizontal: 'auto' }}>
          {/* 自由编 */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer' }} onClick={goToFree}>
            <View style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(44,62,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#2c3e50' }}>编</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>自由编</Text>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>从 206 种珠子中自由搭配</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#ccc' }}>›</Text>
            </View>
          </View>

          {/* 许愿编 */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer' }} onClick={goToWish}>
            <View style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(200,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#c8a96e' }}>愿</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>许愿编</Text>
                  <View style={{ padding: '1px 6px', borderRadius: 8, backgroundColor: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.3)' }}>
                    <Text style={{ fontSize: 10, color: '#c8a96e' }}>NEW</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>选愿望系统自动配珠</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#ccc' }}>›</Text>
            </View>
          </View>

          {/* 缘分编 */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer' }} onClick={goToCouple}>
            <View style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(44,62,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#2c3e50' }}>缘</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>缘分编</Text>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>双人合珠，测缘分指数</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#ccc' }}>›</Text>
            </View>
          </View>

          {/* 底部按钮 */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#ffffff' }} onClick={goToSignIn}>
              <Text style={{ fontSize: 13, color: '#666' }}>每日签到</Text>
            </View>
            <View style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#ffffff' }} onClick={goToFavorites}>
              <Text style={{ fontSize: 13, color: '#666' }}>我的收藏</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
        <Text style={{ fontSize: 11, color: '#ccc' }}>指尖流转 · 好运自来</Text>
      </View>
    </View>
  )
}

export default IndexPage
