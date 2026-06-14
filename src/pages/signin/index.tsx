import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { SIGNIN_LOCKED_COLORS } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'

const SignInPage = () => {
  const { signInRecords, signIn, getStreakCount } = useBeadStore()
  const [streak, setStreak] = useState(0)
  const [todaySigned, setTodaySigned] = useState(false)

  useEffect(() => {
    setStreak(getStreakCount())
    const today = new Date().toISOString().split('T')[0]
    setTodaySigned(signInRecords.some(r => r.date === today))
  }, [signInRecords])

  // 生成月历数据
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月']

  const doSignIn = () => {
    if (todaySigned) {
      Taro.showToast({ title: '今日已签到', icon: 'none' })
      return
    }
    signIn()
    Taro.showToast({ title: '签到成功！', icon: 'success' })
  }

  const isSigned = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return signInRecords.some(r => r.date === dateStr)
  }

  const isToday = (day: number) => {
    return today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      {/* 标题 */}
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-3">每日签到</Text>
      <Text className="block text-base text-[#C4A0A0] mb-6">
        连续签到解锁限定配色 · 当前连续 {streak} 天
      </Text>

      {/* 签到按钮 */}
      <Card className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] mb-6 overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center">
          <Text className="block text-4xl mb-2">{todaySigned ? '✓' : '○'}</Text>
          <Text className="block text-lg font-semibold text-[#2D1B14] mb-1">
            {todaySigned ? '今日已签到' : '今日签到'}
          </Text>
          <Text className="block text-xs text-[#C4A0A0] mb-4">
            {todaySigned ? '明天再来哦' : '开启好运一天'}
          </Text>
          {!todaySigned && (
            <View
              className="px-8 py-3 rounded-xl interactive"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)',
              }}
              onClick={doSignIn}
            >
              <Text className="block text-sm font-bold text-[#FFFFFF]">签到领好运</Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* 月历 */}
      <Card className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] mb-6">
        <CardContent className="p-4">
          <View className="flex flex-row items-center justify-between mb-4">
            <Text className="block text-base font-semibold text-[#2D1B14]">
              {year}年 {monthNames[month]}
            </Text>
          </View>

          {/* 星期头 */}
          <View className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <Text key={d} className="block text-center text-xs text-[#C4A0A0] py-1">
                {d}
              </Text>
            ))}
          </View>

          {/* 日期网格 */}
          <View className="grid grid-cols-7 gap-1">
            {/* 空白占位 */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* 日期 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const signed = isSigned(day)
              const isTodayDay = isToday(day)
              return (
                <View
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center ${
                    isTodayDay ? 'border border-[#FF6B6B]' : ''
                  } ${signed ? 'bg-[#FF6B6B]/10' : ''}`}
                >
                  <Text
                    className={`block text-xs ${
                      signed ? 'text-[#FF6B6B] font-bold' :
                      isTodayDay ? 'text-[#2D1B14]' :
                      'text-[#C4A0A0]'
                    }`}
                  >
                    {day}
                  </Text>
                  {signed && (
                    <Text className="block text-[8px] text-[#FF6B6B]">●</Text>
                  )}
                </View>
              )
            })}
          </View>
        </CardContent>
      </Card>

      {/* 限定配色展示 */}
      <Text className="block text-sm font-semibold text-[#2D1B14] mb-3">签到解锁限定配色</Text>
      <ScrollView scrollX className="pb-4">
        <View className="flex flex-row gap-3">
          {Object.entries(SIGNIN_LOCKED_COLORS).map(([days, color]) => {
            const daysNum = parseInt(days)
            const unlocked = streak >= daysNum
            return (
              <Card
                key={days}
                className={`bg-[#FFFFFF] rounded-xl border flex-shrink-0 w-28 ${
                  unlocked ? 'border-[#FF6B6B]' : 'border-[#FFE0E0]'
                }`}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <View
                    className={`w-12 h-12 rounded-full mb-2 ${
                      unlocked ? '' : 'opacity-30'
                    }`}
                    style={unlocked ? {
                      background: `radial-gradient(circle at 35% 30%, ${color.gradient[1]}, ${color.hex})`,
                      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
                    } : {
                      background: '#FFE0E0',
                    }}
                  />
                  <Text
                    className={`block text-xs text-center ${
                      unlocked ? 'text-[#FF6B6B]' : 'text-[#C4A0A0]'
                    }`}
                  >
                    {unlocked ? '已解锁' : `${daysNum}天`}
                  </Text>
                  <Text
                    className={`block text-xs text-center mt-1 ${
                      unlocked ? 'text-[#8B6B6B]' : 'text-[#C4A0A0]'
                    }`}
                  >
                    {color.name}
                  </Text>
                </CardContent>
              </Card>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

export default SignInPage
