import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { MATERIALS } from '@/lib/data'

const currentYear = new Date().getFullYear()

const CouplePage = () => {
  const { setMaterial, setColor, setGameMode, resetConfig } = useBeadStore()
  const [step, setStep] = useState<'p1' | 'p2' | 'result'>('p1')
  const [p1, setP1] = useState({ name: '', year: 1995, month: 6, day: 15 })
  const [p2, setP2] = useState({ name: '', year: 1995, month: 6, day: 15 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const zodiac = (y: number) => ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][(y - 4) % 12]

  const submitP1 = () => {
    if (!p1.name.trim()) return
    setStep('p2')
  }

  const submitBoth = () => {
    if (!p2.name.trim()) return
    setLoading(true)
    Taro.request({
      url: '/api/fortune-ai/couple',
      method: 'POST',
      data: { person1: p1, person2: p2 },
    }).then(res => {
      setResult(res.data?.data)
      setLoading(false)
    }).catch(() => {
      setResult({
        score: 78,
        reading: '两人的缘分指数中等偏上。生肖相合，五行互补，若能互相理解和包容，感情会更加深厚。',
        bead1: { materialId: 'jade', colorIndex: 0 },
        bead2: { materialId: 'crystal', colorIndex: 2 },
        comboName: '缘定三生',
      })
      setLoading(false)
    })
  }

  const applyResult = () => {
    if (!result) return
    setGameMode('couple')
    resetConfig()
    const m1 = MATERIALS.find(m => m.id === result.bead1.materialId) || MATERIALS[0]
    const c1 = m1.colors[Math.min(result.bead1.colorIndex, m1.colors.length - 1)]
    const m2 = MATERIALS.find(m => m.id === result.bead2.materialId) || MATERIALS[0]
    const c2 = m2.colors[Math.min(result.bead2.colorIndex, m2.colors.length - 1)]
    setMaterial(m1)
    setColor(c1)
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  // 出生日期选择器
  const DatePicker = ({ value, onChange }: { value: { year: number; month: number; day: number }; onChange: (v: any) => void }) => (
    <View className="flex flex-row gap-2 mb-4">
      <View className="flex-1">
        <Text className="block text-xs text-[#C4A0A0] mb-2">年</Text>
        <ScrollView scrollX className="rounded-xl border border-[#FFE0E0] bg-[#FFFFFF]" style={{ height: '120px' }}>
          <View className="flex flex-col">
            {Array.from({ length: 80 }, (_, i) => currentYear - i).map(y => (
              <View key={y} className={`py-2 px-4 interactive ${value.year === y ? 'bg-[#FF6B6B]/10' : ''}`} onClick={() => onChange({ ...value, year: y })}>
                <Text className={`block text-sm ${value.year === y ? 'text-[#FF6B6B] font-bold' : 'text-[#2D1B14]'}`}>{y}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View className="flex-1">
        <Text className="block text-xs text-[#C4A0A0] mb-2">月</Text>
        <View className="flex flex-wrap gap-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <View key={m} className={`w-10 h-10 rounded-lg flex items-center justify-center interactive ${value.month === m ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]' : 'border border-[#FFE0E0] bg-[#FFFFFF]'}`} onClick={() => onChange({ ...value, month: m })}>
              <Text className={`block text-xs ${value.month === m ? 'text-[#FF6B6B]' : 'text-[#2D1B14]'}`}>{m}月</Text>
            </View>
          ))}
        </View>
      </View>
      <View className="flex-1">
        <Text className="block text-xs text-[#C4A0A0] mb-2">日</Text>
        <View className="flex flex-wrap gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <View key={d} className={`w-10 h-10 rounded-lg flex items-center justify-center interactive ${value.day === d ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]' : 'border border-[#FFE0E0] bg-[#FFFFFF]'}`} onClick={() => onChange({ ...value, day: d })}>
              <Text className={`block text-xs ${value.day === d ? 'text-[#FF6B6B]' : 'text-[#2D1B14]'}`}>{d}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View className="min-h-screen bg-[#FFF5F5] flex items-center justify-center px-6">
        <View className="flex flex-col items-center">
          <Text className="block text-2xl mb-4">合</Text>
          <Text className="block text-base text-[#8B6B6B] text-center">八字合盘中...</Text>
          <Text className="block text-xs text-[#C4A0A0] mt-3 text-center">AI 正在分析生肖、五行、命理匹配度</Text>
        </View>
      </View>
    )
  }

  if (result) {
    const m1 = MATERIALS.find(m => m.id === result.bead1.materialId) || MATERIALS[0]
    const c1 = m1.colors[Math.min(result.bead1.colorIndex, m1.colors.length - 1)]
    const m2 = MATERIALS.find(m => m.id === result.bead2.materialId) || MATERIALS[0]
    const c2 = m2.colors[Math.min(result.bead2.colorIndex, m2.colors.length - 1)]
    const scoreColor = result.score >= 80 ? '#FF6B6B' : result.score >= 60 ? '#8B6B6B' : '#C4A0A0'

    return (
      <ScrollView className="h-screen bg-[#FFF5F5]" scrollY>
        <View className="px-6 pt-6 pb-10 flex flex-col items-center">
          {/* 组合名 */}
          <Text className="block text-2xl font-bold text-[#FF6B6B] mb-1 text-center">{result.comboName}</Text>
          <Text className="block text-sm text-[#8B6B6B] mb-6">缘分合盘结果</Text>

          {/* 双珠并排 */}
          <View className="flex flex-row items-center gap-6 mb-6">
            <View className="flex flex-col items-center">
              <View className="w-20 h-20 rounded-full border-2 border-[#FF6B6B]/30 flex items-center justify-center bg-[#FFFFFF]">
                <View className="w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${c1.gradient[1]}, ${c1.hex})`, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }} />
              </View>
              <Text className="block text-xs text-[#2D1B14] mt-2">{c1.name}{m1.name}</Text>
              <Text className="block text-[10px] text-[#C4A0A0]">{p1.name || '你'}</Text>
            </View>
            <Text className="text-3xl text-[#FF6B6B]">+</Text>
            <View className="flex flex-col items-center">
              <View className="w-20 h-20 rounded-full border-2 border-[#96E0D0]/30 flex items-center justify-center bg-[#FFFFFF]">
                <View className="w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${c2.gradient[1]}, ${c2.hex})`, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }} />
              </View>
              <Text className="block text-xs text-[#2D1B14] mt-2">{c2.name}{m2.name}</Text>
              <Text className="block text-[10px] text-[#C4A0A0]">{p2.name || 'TA'}</Text>
            </View>
          </View>

          {/* 缘分分数 */}
          <View className="w-32 h-32 rounded-full flex items-center justify-center border-2 mb-6" style={{ borderColor: scoreColor }}>
            <View className="flex flex-col items-center">
              <Text className="block text-[10px] text-[#C4A0A0]">缘分指数</Text>
              <Text className="block text-5xl font-bold" style={{ color: scoreColor }}>{result.score}</Text>
            </View>
          </View>

          {/* 八字信息 */}
          <View className="flex flex-row gap-3 mb-4 w-full">
            <View className="flex-1 rounded-xl border border-[#FFE0E0] p-3" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
              <Text className="block text-[10px] text-[#C4A0A0] mb-1">{p1.name || '你'}</Text>
              <Text className="block text-xs text-[#8B6B6B]">{p1.year}年 · 生肖{zodiac(p1.year)}</Text>
            </View>
            <View className="flex-1 rounded-xl border border-[#FFE0E0] p-3" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
              <Text className="block text-[10px] text-[#C4A0A0] mb-1">{p2.name || 'TA'}</Text>
              <Text className="block text-xs text-[#8B6B6B]">{p2.year}年 · 生肖{zodiac(p2.year)}</Text>
            </View>
          </View>

          {/* 缘分分析 */}
          <View className="w-full rounded-2xl border border-[#FFE0E0] p-5 mb-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
            <Text className="block text-xs text-[#FF6B6B] font-medium mb-2">缘分详解</Text>
            <Text className="block text-sm text-[#8B6B6B] leading-relaxed">{result.reading}</Text>
          </View>

          <View className="w-full py-4 rounded-xl flex items-center justify-center interactive" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }} onClick={applyResult}>
            <Text className="block text-base font-bold text-[#FFFFFF]">使用此组合 · 预览手串</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-3xl font-bold text-[#2D1B14] mb-2">缘分编</Text>
      <Text className="block text-base text-[#8B6B6B] mb-6">
        {step === 'p1' ? '输入你的生辰信息' : '输入 TA 的生辰信息'}
      </Text>

      {/* 姓名 */}
      <Text className="block text-sm font-medium text-[#2D1B14] mb-2">称呼</Text>
      <View className="rounded-xl border border-[#FFE0E0] bg-[#FFFFFF] px-4 py-3 mb-4">
        <input
          className="w-full bg-transparent text-base text-[#2D1B14] outline-none"
          placeholder={step === 'p1' ? '你的名字' : 'TA的名字'}
          value={step === 'p1' ? p1.name : p2.name}
          onInput={(e: any) => {
            const val = e.target?.value || ''
            step === 'p1' ? setP1({ ...p1, name: val }) : setP2({ ...p2, name: val })
          }}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#2D1B14', fontSize: '16px' }}
        />
      </View>

      {/* 出生日期 */}
      {step === 'p1' ? (
        <DatePicker value={p1} onChange={(v) => setP1(v)} />
      ) : (
        <DatePicker value={p2} onChange={(v) => setP2(v)} />
      )}

      {/* 确认按钮 */}
      <View className="mt-auto pt-4">
        <View
          className="w-full py-4 rounded-xl flex items-center justify-center interactive"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
          onClick={step === 'p1' ? submitP1 : submitBoth}
        >
          <Text className="block text-base font-bold text-[#FFFFFF]">
            {step === 'p1' ? '下一步 · 输入TA的信息' : '开始合盘 · 测缘分'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CouplePage
