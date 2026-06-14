import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
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

  // 当月日历
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 pt-6 flex flex-col">
      {/* 标题 */}
      <Text className="block text-3xl font-bold text-[#2D1B14] mb-1">每日签到</Text>
      <Text className="block text-sm text-[#8B6B6B] mb-6">每天打卡，好运连连</Text>

      {/* 签到状态卡片 */}
      <View className="rounded-2xl bg-white border border-[#FFE0E0] p-6 mb-6 flex flex-col items-center shadow-sm">
        {signedToday ? (
          <>
            <View className="w-16 h-16 rounded-full bg-[#FF6B6B] flex items-center justify-center mb-3">
              <Text className="text-2xl text-white font-bold">✓</Text>
            </View>
            <Text className="block text-lg font-bold text-[#2D1B14]">今日已签到</Text>
            <Text className="block text-sm text-[#8B6B6B] mt-1">连续 {streak} 天</Text>
          </>
        ) : (
          <>
            <View className="w-16 h-16 rounded-full bg-[#FFE0E0] flex items-center justify-center mb-3">
              <Text className="text-2xl text-[#FF6B6B]">○</Text>
            </View>
            <Text className="block text-lg font-bold text-[#2D1B14]">今日未签到</Text>
            <Text className="block text-sm text-[#8B6B6B] mt-1">连续 {streak} 天</Text>
            <View
              className="mt-4 px-10 py-3 rounded-xl flex items-center justify-center interactive"
              style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
              onClick={doSignIn}
            >
              <Text className="block text-base font-bold text-white">签到</Text>
            </View>
          </>
        )}
      </View>

      {/* 月度日历 */}
      <View className="rounded-2xl bg-white border border-[#FFE0E0] p-5 shadow-sm">
        <Text className="block text-sm font-medium text-[#2D1B14] mb-3">
          {year}年{month + 1}月
        </Text>
        <View className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(w => (
            <Text key={w} className="block text-xs text-[#C4A0A0] text-center py-1">{w}</Text>
          ))}
          {calendarDays.map((d, i) => {
            if (d === null) return <View key={`e${i}`} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const isSigned = signInRecords.some(r => r.date === dateStr)
            const isToday = d === today.getDate()
            return (
              <View key={d} className={`py-1 rounded-lg flex items-center justify-center ${isToday ? 'border border-[#FF6B6B]' : ''}`}>
                {isSigned ? (
                  <View className="w-7 h-7 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                    <Text className="text-xs text-white">✓</Text>
                  </View>
                ) : (
                  <Text className={`block text-xs ${isToday ? 'text-[#FF6B6B] font-bold' : 'text-[#2D1B14]'}`}>{d}</Text>
                )}
              </View>
            )
          })}
        </View>
      </View>

      {/* 统计 */}
      <View className="flex flex-row gap-3 mt-4">
        <View className="flex-1 rounded-xl bg-white border border-[#FFE0E0] p-4 shadow-sm">
          <Text className="block text-xs text-[#C4A0A0]">本月签到</Text>
          <Text className="block text-xl font-bold text-[#FF6B6B] mt-1">
            {signInRecords.filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
            <Text className="text-xs text-[#C4A0A0]"> / {daysInMonth} 天</Text>
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-white border border-[#FFE0E0] p-4 shadow-sm">
          <Text className="block text-xs text-[#C4A0A0]">最长连续</Text>
          <Text className="block text-xl font-bold text-[#FF6B6B] mt-1">{streak} 天</Text>
        </View>
      </View>
    </View>
  )
}

export default SignInPage
