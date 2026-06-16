import { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import MbtiCharacter from '@/components/designer/MbtiCharacter'
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

/* 映射API返回的材质ID到真实商品索引 */
const MATERIAL_BEAD_MAP: Record<string, number[]> = {
  bodhi: [146, 147],
  agate: [79, 80],
  crystal: [0, 1, 2],
  jade: [153, 155],
  dzi: [165, 163],
  gilt: [131, 130, 88],
  walnut: [142, 143],
  amber: [172, 173],
  coral: [166, 168],
  lapis: [167, 170],
  turquoise: [177, 178],
  beeswax: [174],
  obsidian: [96, 99],
}

/** 材质中文名 */
const MATERIAL_NAMES: Record<string, string> = {
  bodhi: '菩提木', agate: '玛瑙', crystal: '水晶', jade: '玉石',
  dzi: '天珠', gilt: '鎏金', walnut: '核桃', amber: '琥珀',
  coral: '珊瑚', lapis: '青金石', turquoise: '绿松石', beeswax: '蜜蜡', obsidian: '黑曜石',
}

/** 材质寓意 */
const MATERIAL_MEANINGS: Record<string, string> = {
  bodhi: '清净智慧，回归本真',
  agate: '稳定情感，增强勇气',
  crystal: '清澈通透，净心明性',
  jade: '温润包容，内敛高雅',
  dzi: '神秘护佑，趋吉避凶',
  gilt: '旺财旺运，璀璨自信',
  walnut: '朴实坚韧，稳扎稳打',
  amber: '封存记忆，温暖滋养',
  coral: '热情活力，红润吉祥',
  lapis: '理性沟通，深邃睿智',
  turquoise: '自由信任，清雅灵秀',
  beeswax: '温暖凝润，疗愈安抚',
  obsidian: '辟邪护身，沉淀内省',
}

/** 每类 MBTI 推荐 2-3 个小配饰 */
const MBTI_CHARMS: Record<string, number[][]> = {
  INTJ: [[185], [188], [197]],     // 白水晶双尖, 黑金超七双尖, 金曜石貔貅
  INTP: [[185], [189], [179]],     // 白水晶双尖, 白水晶方糖, 沉香隔片
  ENTJ: [[197], [132], [185]],     // 金曜石貔貅, 大漆葫芦红, 白水晶双尖
  ENTP: [[186], [190], [195]],     // 黄水晶双尖, 白水晶弯管, 南瓜珠
  INFJ: [[165], [183], [179]],     // 黄杨木莲花, 蜜蜡, 沉香隔片
  INFP: [[187], [160], [165]],     // 粉水晶双尖, 青提岫玉, 黄杨木莲花
  ENFJ: [[132], [165], [187]],     // 大漆葫芦红, 黄杨木莲花, 粉水晶双尖
  ENFP: [[136], [186], [159]],     // 大漆葫芦粉, 黄水晶双尖, 鼻涕熊
  ISTJ: [[179], [189], [190]],     // 沉香隔片, 白水晶方糖, 白水晶弯管
  ISFJ: [[165], [183], [187]],     // 黄杨木莲花, 蜜蜡, 粉水晶双尖
  ESTJ: [[132], [197], [179]],     // 大漆葫芦红, 金曜石貔貅, 沉香隔片
  ESFJ: [[136], [165], [162]],     // 大漆葫芦粉, 黄杨木莲花, 蓝水翡翠
  ISTP: [[179], [190], [182]],     // 沉香隔片, 白水晶弯管
  ISFP: [[187], [160], [165]],     // 粉水晶双尖, 青提岫玉, 黄杨木莲花
  ESTP: [[197], [186], [132]],     // 金曜石貔貅, 黄水晶双尖, 大漆葫芦红
  ESFP: [[136], [187], [159]],     // 大漆葫芦粉, 粉水晶双尖, 鼻涕熊
}

/** 将推荐物料映射为真实商品，尊重 API 返回的精确颗数和每颗珠子的材质 */
function makeFullBracelet(
  materials: { materialId: string; colorIndex: number }[],
  targetCount?: number,
): any[] {
  // 如果 API 已经返回了每颗珠子的详细数据（materials.length > 3），直接映射每颗
  if (materials.length > 3) {
    return materials.map((m, i) => {
      const options = MATERIAL_BEAD_MAP[m.materialId]
      const idx = options ? options[Math.min(m.colorIndex || 0, options.length - 1)] : 0
      const p = BEAD_PRODUCTS[idx]
      if (!p) return null
      return { ...p, _key: `ai-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    }).filter(Boolean)
  }

  // 本地 fallback：只有 3 种物料，按 targetCount 循环填充
  const count = targetCount || 16
  const productIds: number[] = []
  materials.forEach((m, i) => {
    const options = MATERIAL_BEAD_MAP[m.materialId]
    if (!options || options.length === 0) return
    const idx = options[Math.min(i, options.length - 1)]
    const perType = Math.ceil(count / materials.length)
    for (let j = 0; j < perType; j++) productIds.push(idx)
  })
  while (productIds.length < count) productIds.push(productIds[0] ?? 0)
  return productIds.slice(0, count).map((idx) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return { ...p, _key: `rec-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
  }).filter(Boolean)
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

  const MBTI_RECOMMEND: Record<string, { desc: string; beads: { materialId: string; colorIndex: number; reason: string }[]; arrangement: string }> = {
    INTJ: { desc: '独立思考的战略家，适合简约有力量感的搭配', beads: [{ materialId: 'crystal', colorIndex: 2, reason: '白水晶增强逻辑' }, { materialId: 'gilt', colorIndex: 0, reason: '金发晶强化决断' }, { materialId: 'jade', colorIndex: 0, reason: '和田玉沉静内心' }], arrangement: '主次分明 · 3珠循环' },
    INTP: { desc: '热爱理论的发明家', beads: [{ materialId: 'crystal', colorIndex: 2, reason: '水晶通透' }, { materialId: 'agate', colorIndex: 1, reason: '玛瑙温润' }, { materialId: 'bodhi', colorIndex: 0, reason: '菩提木禅意' }], arrangement: '疏朗排列 · 3珠循环' },
    ENTJ: { desc: '天生的领导者', beads: [{ materialId: 'gilt', colorIndex: 0, reason: '金色彰显气场' }, { materialId: 'agate', colorIndex: 0, reason: '玛瑙朱砂红' }, { materialId: 'crystal', colorIndex: 2, reason: '白水晶清透' }], arrangement: '主次分明 · 3珠循环' },
    ENTP: { desc: '聪明的探索者', beads: [{ materialId: 'crystal', colorIndex: 3, reason: '海蓝宝开阔思维' }, { materialId: 'bodhi', colorIndex: 1, reason: '琥珀黄温暖' }, { materialId: 'agate', colorIndex: 5, reason: '烟灰蓝神秘' }], arrangement: '错落有致 · 3珠循环' },
    INFJ: { desc: '安静的理想主义者', beads: [{ materialId: 'jade', colorIndex: 0, reason: '和田玉温和' }, { materialId: 'crystal', colorIndex: 1, reason: '粉水晶柔软' }, { materialId: 'bodhi', colorIndex: 0, reason: '檀木沉稳' }], arrangement: '均匀排列 · 3珠循环' },
    INFP: { desc: '诗意的治愈者', beads: [{ materialId: 'crystal', colorIndex: 1, reason: '粉水晶温柔' }, { materialId: 'crystal', colorIndex: 3, reason: '海蓝宝治愈' }, { materialId: 'jade', colorIndex: 1, reason: '碧玉清新' }], arrangement: '灵动排列 · 3珠循环' },
    ENFJ: { desc: '富有魅力的导师', beads: [{ materialId: 'gilt', colorIndex: 0, reason: '金发晶温暖' }, { materialId: 'agate', colorIndex: 0, reason: '红玛瑙热情' }, { materialId: 'crystal', colorIndex: 2, reason: '白水晶包容' }], arrangement: '主次分明 · 3珠循环' },
    ENFP: { desc: '自由的倡导者', beads: [{ materialId: 'crystal', colorIndex: 4, reason: '黄水晶活力' }, { materialId: 'crystal', colorIndex: 1, reason: '粉水晶浪漫' }, { materialId: 'agate', colorIndex: 2, reason: '墨玉黑个性' }], arrangement: '跳跃排列 · 3珠循环' },
    ISTJ: { desc: '务实的守护者', beads: [{ materialId: 'bodhi', colorIndex: 0, reason: '檀木沉稳' }, { materialId: 'crystal', colorIndex: 2, reason: '白水晶清晰' }, { materialId: 'agate', colorIndex: 3, reason: '咖啡棕踏实' }], arrangement: '规整排列 · 3珠循环' },
    ISFJ: { desc: '温暖的保护者', beads: [{ materialId: 'jade', colorIndex: 0, reason: '和田玉温润' }, { materialId: 'crystal', colorIndex: 1, reason: '粉水晶亲切' }, { materialId: 'bodhi', colorIndex: 3, reason: '白檀柔和' }], arrangement: '均匀排列 · 3珠循环' },
    ESTJ: { desc: '高效的管理者', beads: [{ materialId: 'gilt', colorIndex: 0, reason: '金发晶果断' }, { materialId: 'agate', colorIndex: 0, reason: '玛瑙坚韧' }, { materialId: 'crystal', colorIndex: 2, reason: '白水晶专注' }], arrangement: '主次分明 · 3珠循环' },
    ESFJ: { desc: '热心的助人者', beads: [{ materialId: 'crystal', colorIndex: 1, reason: '粉水晶温暖' }, { materialId: 'jade', colorIndex: 0, reason: '和田玉包容' }, { materialId: 'agate', colorIndex: 4, reason: '奶油白柔和' }], arrangement: '均匀排列 · 3珠循环' },
    ISTP: { desc: '冷静的实干家', beads: [{ materialId: 'crystal', colorIndex: 2, reason: '白水晶冷静' }, { materialId: 'agate', colorIndex: 2, reason: '墨玉黑内敛' }, { materialId: 'bodhi', colorIndex: 0, reason: '檀木质感' }], arrangement: '简洁排列 · 3珠循环' },
    ISFP: { desc: '灵动的艺术家', beads: [{ materialId: 'crystal', colorIndex: 1, reason: '粉水晶浪漫' }, { materialId: 'crystal', colorIndex: 3, reason: '海蓝宝灵动' }, { materialId: 'crystal', colorIndex: 4, reason: '黄水晶明亮' }], arrangement: '跳跃排列 · 3珠循环' },
    ESTP: { desc: '精明的冒险家', beads: [{ materialId: 'gilt', colorIndex: 0, reason: '金发晶冒险' }, { materialId: 'agate', colorIndex: 5, reason: '烟灰蓝独特' }, { materialId: 'crystal', colorIndex: 4, reason: '黄水晶活力' }], arrangement: '错落有致 · 3珠循环' },
    ESFP: { desc: '快乐的表演家', beads: [{ materialId: 'agate', colorIndex: 0, reason: '红玛瑙热情' }, { materialId: 'crystal', colorIndex: 1, reason: '粉水晶快乐' }, { materialId: 'gilt', colorIndex: 0, reason: '金发晶闪亮' }], arrangement: '灵动排列 · 3珠循环' },
  }

  const submitAnswers = async (finalAnswers: string[]) => {
    setLoading(true)
    // 先算出 MBTI，确保即使 API 失败也有反馈
    const mbti = calcMBTI()
    const recommendation = MBTI_RECOMMEND[mbti] || MBTI_RECOMMEND['ENFP']

    try {
      const res = await Taro.request({
        url: 'http://localhost:3000/api/fortune-ai/recommend',
        method: 'POST',
        data: { answers: finalAnswers, wristSizeCm },
        timeout: 15000,
      })
      const data = res.data?.data
      if (data) {
        setResult(data)
        setLoading(false)
        return
      }
    } catch {
      // API 失败，使用本地推荐
    }

    // 本地推荐
    setResult({
      mbti,
      mbtiDesc: recommendation.desc,
      beads: recommendation.beads,
      beadCount: recommendBeadCount(wristSizeCm, 8),
      arrangement: recommendation.arrangement,
    })
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

  /* 生成预览用真实珠子（含配饰） */
  const previewBeads = useMemo(() => {
    if (!result?.beads) return []
    const beads = makeFullBracelet(result.beads, result.beadCount)
    // 追加推荐的配饰到预览中
    const charmIds = MBTI_CHARMS[result.mbti] || MBTI_CHARMS['ENFP']
    charmIds.forEach((ids) => {
      const idx = ids[0]
      const p = BEAD_PRODUCTS[idx]
      if (p) beads.push({
        ...p,
        _key: `charm-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })
    })
    return beads
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
          {/* MBTI 角色卡 */}
          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 14,
              marginBottom: 16,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <MbtiCharacter mbti={result.mbti} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 700, color: '#2c3e50', marginBottom: 4 }}>{result.mbti}</Text>
              <Text style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{result.mbtiDesc}</Text>
            </View>
          </View>

          {/* 手串方案预览 */}
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

          {/* 设计理念 */}
          {result.arrangement && (
            <View
              style={{
                borderRadius: 12,
                border: '1px solid #e8e8e8',
                padding: 14,
                marginBottom: 10,
                backgroundColor: '#ffffff',
              }}
            >
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <View style={{ width: 4, height: 14, backgroundColor: '#c8a96e', borderRadius: 2 }} />
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>设计理念</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{result.arrangement}</Text>
            </View>
          )}

          {/* 材质搭配解析 */}
          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 14,
              marginBottom: 10,
              backgroundColor: '#ffffff',
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <View style={{ width: 4, height: 14, backgroundColor: '#c8a96e', borderRadius: 2 }} />
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>材质搭配解析</Text>
            </View>
            {(() => {
              if (!result?.beads) return null
              const groups: Record<string, number> = {}
              result.beads.forEach((b: any) => {
                const mid = b.materialId || 'crystal'
                groups[mid] = (groups[mid] || 0) + 1
              })
              return Object.entries(groups).map(([mid, cnt]) => (
                <View key={mid} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 6,
                    backgroundColor: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    <Text style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{cnt}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', marginBottom: 1 }}>
                      {MATERIAL_NAMES[mid] || mid}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>{MATERIAL_MEANINGS[mid] || ''}</Text>
                  </View>
                </View>
              ))
            })()}
          </View>

          {/* 搭配小物推荐 */}
          <View
            style={{
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 14,
              marginBottom: 16,
              backgroundColor: '#ffffff',
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <View style={{ width: 4, height: 14, backgroundColor: '#c8a96e', borderRadius: 2 }} />
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>搭配小物推荐</Text>
            </View>
            <ScrollView scrollX showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                {(MBTI_CHARMS[result.mbti] || MBTI_CHARMS['ENFP']).map((ids, ci) => {
                  const idx = ids[0]
                  const p = BEAD_PRODUCTS[idx]
                  if (!p) return null
                  return (
                    <View key={ci} style={{
                      width: 80, borderRadius: 8, border: '1px solid #e8e8e8', backgroundColor: '#fafafa',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px 4px', flexShrink: 0,
                    }}>
                      <View style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                          src={`/images/beads/${p.imageUrl}`}
                          mode="aspectFit"
                          style={{ maxWidth: '90%', maxHeight: '90%', width: 'auto', height: 'auto' }}
                        />
                      </View>
                      <Text style={{ fontSize: 10, color: '#666', marginTop: 2, textAlign: 'center', lineHeight: 1.3 }}>{p.name}</Text>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
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
