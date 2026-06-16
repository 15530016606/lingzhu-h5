import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const SignInPage = () => {
  const { signInRecords, signIn, getStreakCount } = useBeadStore()
  const [streak, setStreak] = useState(0)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const signedToday = signInRecords.some(r => r.date === todayStr)

  useEffect(() => { setStreak(getStreakCount()) }, [signInRecords])

  const doSignIn = () => {
    if (signedToday) return
    signIn()
    setStreak(getStreakCount())
  }

  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const monthSigned = signInRecords.filter(r =>
    r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 导航栏 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>{'< 返回'}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>每日签到</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* 内容 */}
      <View style={{ padding: '20px 16px', flex: 1 }}>
        {/* 签到状态卡片 */}
        <View style={{ borderRadius: 12, border: '1px solid #e8e8e8', padding: '24px 16px', marginBottom: 16, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: signedToday ? '#2c3e50' : '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24, color: signedToday ? '#ffffff' : '#999' }}>{signedToday ? '✓' : '○'}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
            {signedToday ? '今日已签到' : '今日未签到'}
          </Text>
          <Text style={{ fontSize: 13, color: '#666', marginBottom: signedToday ? 0 : 16 }}>
            连续 {streak} 天
          </Text>
          {!signedToday && (
            <View
              onClick={doSignIn}
              style={{ padding: '10px 40px', borderRadius: 10, backgroundColor: '#2c3e50', cursor: 'pointer' }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>签到</Text>
            </View>
          )}
        </View>

        {/* 月度日历 */}
        <View style={{ borderRadius: 12, border: '1px solid #e8e8e8', padding: 16, marginBottom: 16, backgroundColor: '#ffffff' }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>
            {year}年{month + 1}月
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap' }}>
            {WEEKDAYS.map(w => (
              <View key={w} style={{ width: '14.28%', padding: '4px 0' }}>
                <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>{w}</Text>
              </View>
            ))}
            {calendarDays.map((d, i) => {
              if (d === null) return <View key={`e${i}`} style={{ width: '14.28%', padding: '4px 0' }} />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const isSigned = signInRecords.some(r => r.date === dateStr)
              const isToday = d === today.getDate()
              return (
                <View key={d} style={{ width: '14.28%', padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isSigned ? (
                    <View style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#ffffff' }}>✓</Text>
                    </View>
                  ) : (
                    <View style={{ width: 28, height: 28, borderRadius: '50%', border: isToday ? '1.5px solid #2c3e50' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: isToday ? '#2c3e50' : '#1a1a2e', fontWeight: isToday ? 600 : 400 }}>{d}</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {/* 统计 */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, borderRadius: 10, border: '1px solid #e8e8e8', padding: 14, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>本月签到</Text>
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50' }}>
              {monthSigned}
              <Text style={{ fontSize: 12, color: '#999', fontWeight: 400 }}> / {daysInMonth} 天</Text>
            </Text>
          </View>
          <View style={{ flex: 1, borderRadius: 10, border: '1px solid #e8e8e8', padding: 14, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>最长连续</Text>
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50' }}>{streak} 天</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SignInPage
