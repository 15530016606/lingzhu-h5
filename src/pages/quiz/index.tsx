import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { MATERIALS, recommendBeadCount } from '@/lib/data'

const QUESTIONS = [
  { q: '周末你更想怎么过？', dim: 'EI',
    options: [
      { text: '一个人看书喝茶', trait: 'I' },
      { text: '约朋友聚会玩', trait: 'E' },
      { text: '户外运动探险', trait: 'E' },
      { text: '在家看剧打游戏', trait: 'I' },
    ]},
  { q: '你做决定时更依赖什么？', dim: 'TF',
    options: [
      { text: '逻辑分析，理性判断', trait: 'T' },
      { text: '直觉感受，听从内心', trait: 'F' },
      { text: '参考经验，稳扎稳打', trait: 'T' },
      { text: '咨询朋友，综合意见', trait: 'F' },
    ]},
  { q: '你处理信息时更关注？', dim: 'SN',
    options: [
      { text: '具体细节和实际数据', trait: 'S' },
      { text: '整体概念和未来可能', trait: 'N' },
      { text: '当下发生的具体事情', trait: 'S' },
      { text: '背后的深层含义', trait: 'N' },
    ]},
  { q: '你的生活风格偏向？', dim: 'JP',
    options: [
      { text: '有计划有安排', trait: 'J' },
      { text: '随性自由灵活', trait: 'P' },
      { text: '按部就班执行', trait: 'J' },
      { text: '看情况再决定', trait: 'P' },
    ]},
  { q: '哪种场景让你最舒服？', dim: 'EI',
    options: [
      { text: '安静独处的空间', trait: 'I' },
      { text: '热闹的人群中', trait: 'E' },
      { text: '自然风光里', trait: 'I' },
      { text: '创意工作室', trait: 'E' },
    ]},
  { q: '你最有成就感的是？', dim: 'TF',
    options: [
      { text: '解决了复杂问题', trait: 'T' },
      { text: '帮助了需要的人', trait: 'F' },
      { text: '完成了既定目标', trait: 'T' },
      { text: '获得了他人认可', trait: 'F' },
    ]},
  { q: '你更容易被什么吸引？', dim: 'SN',
    options: [
      { text: '实用美观的东西', trait: 'S' },
      { text: '充满想象力的创意', trait: 'N' },
      { text: '经典耐看的款式', trait: 'S' },
      { text: '新奇特别的设计', trait: 'N' },
    ]},
  { q: '面对变化你通常？', dim: 'JP',
    options: [
      { text: '提前做好准备', trait: 'J' },
      { text: '随机应变就好', trait: 'P' },
      { text: '按计划执行', trait: 'J' },
      { text: '享受意外惊喜', trait: 'P' },
    ]},
]

const MBTI_LABELS: Record<string, string> = {
  INTJ: '策划者 · 独立思考的战略家',
  INTP: '思想家 · 热爱理论的发明家',
  ENTJ: '指挥官 · 天生的领导者',
  ENTP: '辩论家 · 聪明的探索者',
  INFJ: '提倡者 · 安静的理想主义者',
  INFP: '调停者 · 诗意的治愈者',
  ENFJ: '主人公 · 富有魅力的导师',
  ENFP: '活动家 · 自由的倡导者',
  ISTJ: '物流师 · 务实的守护者',
  ISFJ: '守卫者 · 温暖的保护者',
  ESTJ: '总经理 · 高效的管理者',
  ESFJ: '执政官 · 热心的助人者',
  ISTP: '鉴赏家 · 冷静的实干家',
  ISFP: '探险家 · 灵动的艺术家',
  ESTP: '企业家 · 精明的冒险家',
  ESFP: '表演者 · 快乐的表演家',
}

const QuizPage = () => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [mbtiTraits, setMbtiTraits] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { beads, wristSizeCm, addBead, resetBeads, setMaterial, setColor, setGameMode } = useBeadStore()

  const selectAnswer = (text: string, trait: string) => {
    const newAnswers = [...answers, text]
    setAnswers(newAnswers)
    setMbtiTraits(prev => ({ ...prev, [trait]: prev[trait] + 1 }))

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      submitAnswers(newAnswers)
    }
  }

  const calcMBTI = () => {
    const t = mbtiTraits
    const ei = t.E >= t.I ? 'E' : 'I'
    const sn = t.S >= t.N ? 'S' : 'N'
    const tf = t.T >= t.F ? 'T' : 'F'
    const jp = t.J >= t.P ? 'J' : 'P'
    return ei + sn + tf + jp
  }

  const submitAnswers = async (finalAnswers: string[]) => {
    setLoading(true)
    try {
      const res = await Taro.request({
        url: '/api/fortune-ai/recommend',
        method: 'POST',
        data: { answers: finalAnswers, wristSizeCm },
      })
      const data = res.data?.data
      if (data) setResult(data)
    } catch {
      const mbti = calcMBTI()
      setResult({
        mbti,
        mbtiDesc: MBTI_LABELS[mbti] || '独特的你',
        beads: [
          { materialId: 'jade', colorIndex: 0, reason: '玉石最能衬托你的气质' },
          { materialId: 'crystal', colorIndex: 2, reason: '水晶增添灵气' },
          { materialId: 'gilt', colorIndex: 0, reason: '鎏金点睛之笔' },
        ],
        beadCount: recommendBeadCount(wristSizeCm, 8),
        arrangement: '主次排列',
      })
    }
    setLoading(false)
  }

  const applyResult = () => {
    if (!result) return
    resetBeads()
    result.beads.forEach((b: any) => {
      const material = MATERIALS.find(m => m.id === b.materialId) || MATERIALS[0]
      const color = material.colors[Math.min(b.colorIndex, material.colors.length - 1)]
      addBead({ id: `ai_${Date.now()}_${Math.random()}`, material, color, sizeMm: 8 })
    })
    setGameMode('wish')
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  // Loading
  if (loading) {
    return (
      <View className="min-h-screen bg-[#FFF5F5] flex items-center justify-center px-6">
        <View className="flex flex-col items-center">
          <Text className="block text-2xl mb-4">...</Text>
          <Text className="block text-base text-[#8B6B6B] text-center">正在分析你的性格…</Text>
          <Text className="block text-xs text-[#C4A0A0] mt-2 mt-4">AI 正在为你设计专属手串</Text>
        </View>
      </View>
    )
  }

  // Result
  if (result) {
    return (
      <ScrollView className="h-screen bg-[#FFF5F5]" scrollY>
        <View className="px-6 pt-6 pb-10">
          <Text className="block text-3xl font-bold text-[#2D1B14] mb-1">你的性格报告</Text>

          {/* MBTI */}
          <View className="rounded-2xl border border-[#FFE0E0] p-5 mb-4 mt-4" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
            <View className="flex flex-row items-center gap-3 mb-2">
              <Text className="block text-4xl font-bold text-[#FF6B6B]">{result.mbti}</Text>
              <View className="flex-1">
                <Text className="block text-sm font-medium text-[#2D1B14]">{result.mbtiDesc}</Text>
              </View>
            </View>
          </View>

          <Text className="block text-base font-medium text-[#2D1B14] mb-3 mt-4">手串方案 · {result.beadCount}颗</Text>

          {/* 排列方式 */}
          <View className="rounded-2xl border border-[#FFE0E0] p-4 mb-4" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
            <Text className="block text-sm text-[#8B6B6B]">{result.arrangement}</Text>
          </View>

          {/* 珠子缩略图条 */}
          <ScrollView scrollX className="mb-4" style={{ height: '50px' }}>
            <View className="flex flex-row gap-1.5 items-center px-1" style={{ height: '46px' }}>
              {result.beads.map((b: any, i: number) => {
                const material = MATERIALS.find(m => m.id === b.materialId) || MATERIALS[0]
                const color = material.colors[Math.min(b.colorIndex, material.colors.length - 1)]
                return (
                  <View key={i} className="w-8 h-8 rounded-full flex-shrink-0 border border-[#FFE0E0]" style={{
                    background: `radial-gradient(circle at 35% 30%, ${color.gradient[1]}, ${color.hex})`,
                  }} />
                )
              })}
            </View>
          </ScrollView>

          <View className="w-full py-4 rounded-xl flex items-center justify-center interactive"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }} onClick={applyResult}>
            <Text className="block text-base font-bold text-[#FFFFFF]">使用此方案 · 预览手串</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  // Quiz
  const q = QUESTIONS[step]
  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-3xl font-bold text-[#2D1B14] mb-2">性格测试</Text>
      <Text className="block text-sm text-[#8B6B6B] mb-1">8道题了解你的性格，AI 设计专属手串</Text>
      <Text className="block text-xs text-[#C4A0A0] mb-6">第 {step + 1}/{QUESTIONS.length} 题</Text>

      <View className="w-full h-1 bg-[#FFE0E0] rounded-full mb-8">
        <View className="h-full bg-[#FF6B6B] rounded-full" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </View>

      <Text className="block text-lg font-medium text-[#2D1B14] mb-6">{q.q}</Text>

      <View className="flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <View key={i} className="w-full rounded-xl border border-[#FFE0E0] p-4 interactive" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }} onClick={() => selectAnswer(opt.text, opt.trait)}>
            <Text className="block text-base text-[#2D1B14]">{opt.text}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default QuizPage
