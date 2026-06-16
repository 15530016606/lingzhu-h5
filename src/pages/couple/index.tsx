import { useMemo, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { MATERIALS } from '@/lib/data'
import { BEAD_PRODUCTS } from '@/data/bead-products'

const currentYear = new Date().getFullYear()

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

/** 从两个推荐物料生成 16 颗标准手串 */
function makeCoupleBracelet(
  b1: { materialId: string; colorIndex: number },
  b2: { materialId: string; colorIndex: number },
): any[] {
  const ids: number[] = []
  const push = (m: { materialId: string; colorIndex: number }) => {
    const options = MATERIAL_BEAD_MAP[m.materialId]
    if (!options || options.length === 0) return
    const idx = options[Math.min(m.colorIndex, options.length - 1)]
    for (let j = 0; j < 8; j++) ids.push(idx)
  }
  push(b1)
  push(b2)
  while (ids.length < 16) ids.push(ids[0] ?? 0)
  return ids.slice(0, 16).map((idx) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return {
      ...p,
      _key: `cp-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
  }).filter(Boolean)
}

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
      url: 'http://localhost:3000/api/fortune-ai/couple',
      method: 'POST',
      data: { person1: p1, person2: p2 },
      timeout: 15000,
    }).then(res => {
      const data = res.data?.data
      if (data) {
        setResult(data)
      } else {
        useLocalFallback()
      }
      setLoading(false)
    }).catch(() => {
      useLocalFallback()
      setLoading(false)
    })
  }

  const useLocalFallback = () => {
    setResult({
      score: 78,
      reading: '两人的缘分指数中等偏上。生肖相合，五行互补，若能互相理解和包容，感情会更加深厚。',
      bead1: { materialId: 'jade', colorIndex: 0 },
      bead2: { materialId: 'crystal', colorIndex: 2 },
      comboName: '缘定三生',
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

  /* 预览用的真实珠子 — 16 颗标准手串 */
  const previewBeads = useMemo(() => {
    if (!result) return []
    return makeCoupleBracelet(result.bead1, result.bead2)
  }, [result])

  // 出生日期选择器
  const DatePicker = ({ value, onChange }: { value: { year: number; month: number; day: number }; onChange: (v: any) => void }) => (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 16 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>年</Text>
        <ScrollView scrollX style={{ borderRadius: 10, border: '1px solid #e8e8e8', backgroundColor: '#ffffff', height: 110 }}>
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: 80 }, (_, i) => currentYear - i).map(y => (
              <View
                key={y}
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  backgroundColor: value.year === y ? 'rgba(44,62,80,0.08)' : 'transparent',
                }}
                onClick={() => onChange({ ...value, year: y })}
              >
                <Text style={{ fontSize: 12, color: value.year === y ? '#2c3e50' : '#1a1a2e', fontWeight: value.year === y ? 600 : 400 }}>
                  {y}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>月</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <View
              key={m}
              style={{
                width: 40,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: value.month === m ? '#2c3e50' : '#ffffff',
                border: value.month === m ? 'none' : '1px solid #e8e8e8',
              }}
              onClick={() => onChange({ ...value, month: m })}
            >
              <Text style={{ fontSize: 11, color: value.month === m ? '#ffffff' : '#1a1a2e', fontWeight: value.month === m ? 600 : 400 }}>
                {m}月
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>日</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <View
              key={d}
              style={{
                width: 40,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: value.day === d ? '#2c3e50' : '#ffffff',
                border: value.day === d ? 'none' : '1px solid #e8e8e8',
              }}
              onClick={() => onChange({ ...value, day: d })}
            >
              <Text style={{ fontSize: 11, color: value.day === d ? '#ffffff' : '#1a1a2e', fontWeight: value.day === d ? 600 : 400 }}>
                {d}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 16, color: '#2c3e50' }}>合</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>八字合盘中...</Text>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>AI 正在分析生肖、五行、命理匹配度</Text>
        </View>
      </View>
    )
  }

  if (result) {
    const scoreColor = result.score >= 80 ? '#2c3e50' : result.score >= 60 ? '#666' : '#999'

    return (
      <ScrollView scrollY style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* 组合名 */}
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#c8a96e', marginBottom: 2, textAlign: 'center' }}>
            {result.comboName}
          </Text>
          <Text style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>缘分合盘结果</Text>

          {/* 双珠预览 — 用 BeadPreviewRing */}
          <View
            style={{
              width: 160,
              height: 110,
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              backgroundColor: '#ffffff',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {previewBeads.length > 0 ? (
              <View style={{ width: '100%', height: '100%', maxWidth: 130 }}>
                <BeadPreviewRing
                  beads={previewBeads}
                  ropeColor="rgba(180,180,180,0.6)"
                  onRemove={() => {}}
                  compact
                />
              </View>
            ) : (
              <Text style={{ fontSize: 11, color: '#999' }}>暂无预览</Text>
            )}
          </View>

          {/* 缘分分数 */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid',
              borderColor: scoreColor,
              marginBottom: 20,
              backgroundColor: '#ffffff',
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#999' }}>缘分指数</Text>
              <Text style={{ fontSize: 36, fontWeight: 700, color: scoreColor }}>{result.score}</Text>
            </View>
          </View>

          {/* 个人信息 */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' }}>
            <View style={{ flex: 1, borderRadius: 10, border: '1px solid #e8e8e8', padding: 10, backgroundColor: '#ffffff' }}>
              <Text style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>{p1.name || '你'}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{p1.year}年 · 生肖{zodiac(p1.year)}</Text>
            </View>
            <View style={{ flex: 1, borderRadius: 10, border: '1px solid #e8e8e8', padding: 10, backgroundColor: '#ffffff' }}>
              <Text style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>{p2.name || 'TA'}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{p2.year}年 · 生肖{zodiac(p2.year)}</Text>
            </View>
          </View>

          {/* 缘分分析 */}
          <View
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              padding: 14,
              marginBottom: 20,
              backgroundColor: '#ffffff',
            }}
          >
            <Text style={{ fontSize: 11, color: '#c8a96e', fontWeight: 500, marginBottom: 6 }}>缘分详解</Text>
            <Text style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{result.reading}</Text>
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
              使用此组合 · 预览手串
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
      <Text style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>缘分编</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
        {step === 'p1' ? '输入你的生辰信息' : '输入 TA 的生辰信息'}
      </Text>

      {/* 姓名 */}
      <Text style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', marginBottom: 6 }}>称呼</Text>
      <View style={{ borderRadius: 10, border: '1px solid #e8e8e8', backgroundColor: '#ffffff', padding: '10px 14px', marginBottom: 16 }}>
        <input
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#1a1a2e', fontSize: 14 }}
          placeholder={step === 'p1' ? '你的名字' : 'TA的名字'}
          value={step === 'p1' ? p1.name : p2.name}
          onInput={(e: any) => {
            const val = e.target?.value || ''
            step === 'p1' ? setP1({ ...p1, name: val }) : setP2({ ...p2, name: val })
          }}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1a1a2e', fontSize: '14px' }}
        />
      </View>

      {/* 出生日期 */}
      {step === 'p1' ? (
        <DatePicker value={p1} onChange={(v) => setP1(v)} />
      ) : (
        <DatePicker value={p2} onChange={(v) => setP2(v)} />
      )}

      {/* 确认按钮 */}
      <View style={{ marginTop: 'auto', paddingTop: 16 }}>
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
          onClick={step === 'p1' ? submitP1 : submitBoth}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
            {step === 'p1' ? '下一步 · 输入TA的信息' : '开始合盘 · 测缘分'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CouplePage
