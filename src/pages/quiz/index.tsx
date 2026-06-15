import { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { MATERIALS, recommendBeadCount } from '@/lib/data'
import { BEAD_PRODUCTS } from '@/data/bead-products'

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

/* 映射旧材质ID到真实商品ID */
const MATERIAL_BEAD_MAP: Record<string, number[]> = {
  jade: [153, 155, 158],    // 和田玉, 碧玉
  crystal: [0, 1, 2],       // 白水晶
  gilt: [131, 130, 88],     // 金发晶, 金曜石
  agate: [79, 80],          // 红玛瑙
  bodhi: [146, 147],        // 檀木, 绿檀
}

/** 从推荐物料生成 16 颗标准手串 */
function makeFullBracelet(materials: { materialId: string; colorIndex: number }[]): any[] {
  const productIds: number[] = []
  materials.forEach((m, i) => {
    const options = MATERIAL_BEAD_MAP[m.materialId]
    if (!options || options.length === 0) return
    const idx = options[Math.min(i, options.length - 1)]
    // 每种物料放 4-6 颗
    const count = materials.length <= 2 ? 8 : Math.max(4, Math.floor(16 / materials.length))
    for (let j = 0; j < count; j++) productIds.push(idx)
  })
  // 补齐或截断到 16 颗
  while (productIds.length < 16) productIds.push(productIds[0] ?? 0)
  const result = productIds.slice(0, 16).map((idx) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return { ...p, _key: `rec-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
  })
  return result.filter(Boolean)
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

  /* 生成预览用真实珠子 */
  const previewBeads = useMemo(() => {
    if (!result?.beads) return []
    return makeFullBracelet(result.beads)
  }, [result])

  // Loading
  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 16, color: '#2c3e50' }}>...</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>正在分析你的性格...</Text>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 12 }}>AI 正在为你设计专属手串</Text>
        </View>
      </View>
    )
  }

  // Result
  if (result) {
    return (
      <ScrollView scrollY style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: '24px 16px 32px' }}>
          {/* MBTI 标签 */}
          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 16,
              marginBottom: 16,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: 700, color: '#2c3e50' }}>{result.mbti}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{result.mbtiDesc}</Text>
            </View>
          </View>

          {/* 手串方案预览 — 与自由编相同效果 */}
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 10 }}>
            手串方案 · {result.beadCount}颗
          </Text>

          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 12,
              marginBottom: 12,
              backgroundColor: '#ffffff',
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {previewBeads.length > 0 ? (
              <View style={{ width: '100%', height: '100%', maxWidth: 180 }}>
                <BeadPreviewRing
                  beads={previewBeads}
                  ropeColor="rgba(180,180,180,0.6)"
                  onRemove={() => {}}
                  compact
                />
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: '#999' }}>暂无预览</Text>
            )}
          </View>

          {/* 排列方式 */}
          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 12,
              marginBottom: 20,
              backgroundColor: '#ffffff',
            }}
          >
            <Text style={{ fontSize: 12, color: '#666' }}>{result.arrangement}</Text>
          </View>

          <View
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#2c3e50',
            }}
            onClick={applyResult}
          >
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
              使用此方案 · 预览手串
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  // Quiz
  const q = QUESTIONS[step]
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
      <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>性格测试</Text>
      <Text style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>8道题了解你的性格，AI 设计专属手串</Text>
      <Text style={{ fontSize: 11, color: '#999', marginBottom: 20 }}>第 {step + 1}/{QUESTIONS.length} 题</Text>

      <View style={{ width: '100%', height: 4, backgroundColor: '#e8e8e8', borderRadius: 2, marginBottom: 24 }}>
        <View
          style={{
            height: '100%',
            backgroundColor: '#2c3e50',
            borderRadius: 2,
            width: `${((step + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </View>

      <Text style={{ fontSize: 16, fontWeight: 500, color: '#1a1a2e', marginBottom: 20 }}>{q.q}</Text>

      <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => (
          <View
            key={i}
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 14,
              cursor: 'pointer',
              backgroundColor: '#ffffff',
            }}
            onClick={() => selectAnswer(opt.text, opt.trait)}
          >
            <Text style={{ fontSize: 14, color: '#1a1a2e' }}>{opt.text}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default QuizPage
