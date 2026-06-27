import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'

/* ── 样品手串定义 ── */
const SAMPLE_BRACELETS: {
  name: string
  desc: string
  pattern: number[]
  ropeColor: string
}[] = [
  {
    name: '紫气东来',
    desc: '紫水晶 · 白水晶 · 星光粉',
    pattern: [14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14],
    ropeColor: 'rgba(40,40,40,0.6)',
  },
  {
    name: '金色年华',
    desc: '黄水晶 · 白水晶 · 金发晶',
    pattern: [26, 34, 2, 26, 34, 2, 26, 34, 131, 2, 26, 34, 2, 26, 34, 2],
    ropeColor: 'rgba(180,180,180,0.6)',
  },
  {
    name: '青山绿水',
    desc: '绿幽灵 · 白幽灵 · 绿发晶',
    pattern: [7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7],
    ropeColor: 'rgba(180,180,180,0.6)',
  },
  {
    name: '皓月星辰',
    desc: '月光石 · 星光粉 · 白水晶',
    pattern: [1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1],
    ropeColor: 'rgba(40,40,40,0.6)',
  },
]

function resolveSampleBeads(pattern: number[]) {
  return pattern.map((idx) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return { ...p }
  }).filter(Boolean) as any[]
}

/* ── 样品卡片 ── */
function SampleCard({ sample }: { sample: typeof SAMPLE_BRACELETS[0] }) {
  const previewBeads = resolveSampleBeads(sample.pattern)
  return (
    <View
      style={{
        width: 130,
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <View style={{ width: '100%', height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', height: '100%', maxWidth: 100 }}>
          <BeadPreviewRing beads={previewBeads} ropeColor={sample.ropeColor} onRemove={() => {}} compact stagger />
        </View>
      </View>
      <View style={{ width: '100%', padding: '4px 8px 8px', textAlign: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: 600, color: '#2c3e50' }}>{sample.name}</Text>
        <Text style={{ fontSize: 10, color: '#999' }}>{sample.desc}</Text>
      </View>
    </View>
  )
}

const BASE_URL = process.env.TARO_APP_API_BASE || ''

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  return res.json()
}

export default function IndexPage() {
  const [claimed, setClaimed] = useState(false)
  const [claimResult, setClaimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    api('/user/raw-materials').then((data) => {
      if (Array.isArray(data)) setStreak(Math.min(data.length, 7))
    })
  }, [])

  const handleClaim = useCallback(async () => {
    if (claimed || loading) return
    setLoading(true)
    const result = await api('/user/claim-daily', { method: 'POST' })
    setClaimResult(result)
    if (result.success) setClaimed(true)
    setLoading(false)
  }, [claimed, loading])

  const goToWorkshop = () => Taro.navigateTo({ url: '/pages/workshop/index' })
  const goToCheckout = () => Taro.navigateTo({ url: '/pages/checkout/index' })
  const goToCollection = () => Taro.navigateTo({ url: '/pages/collection/index' })

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部品牌 */}
      <View
        style={{
          margin: '16px 16px 0', padding: '20px 16px 14px',
          backgroundColor: '#ffffff', borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50', marginBottom: 2 }}>
          灵珠手作
        </Text>
        <Text style={{ fontSize: 13, color: '#999', marginBottom: 14, letterSpacing: 1 }}>
          编一串好运 · 从一颗原石开始
        </Text>

        {/* 样品预览 */}
        <ScrollView
          scrollX showsHorizontalScrollIndicator={false} style={{ width: '100%' }}
          enhanced showScrollbar={false}
        >
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            {SAMPLE_BRACELETS.map((sample, i) => (
              <SampleCard key={i} sample={sample} />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 盲盒卡片 */}
      <View
        onClick={handleClaim}
        style={{
          margin: '12px 16px', padding: 16,
          background: 'linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)',
          borderRadius: 16, cursor: 'pointer',
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 60, height: 60, borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 14, fontSize: 28,
          }}
        >
          {claimResult?.success ? '🎁' : loading ? '⏳' : '🎀'}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>
            {claimResult?.success
              ? `获得 ${claimResult.material.name}`
              : claimed || claimResult?.success === false
                ? '今日已领取'
                : '每日盲盒'
            }
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
            {claimResult?.success
              ? `稀有度: ${claimResult.material.rarity}`
              : claimResult?.success === false
                ? '明天再来吧'
                : '点击领取今日原料'
            }
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>→</Text>
      </View>

      {/* 数据卡片 */}
      <View
        style={{
          margin: '0 16px', padding: '12px 16px',
          backgroundColor: '#ffffff', borderRadius: 12,
          border: '1px solid #e8e8e8',
          display: 'flex', flexDirection: 'row', justifyContent: 'space-around',
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>已收集原料</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>{streak}</Text>
        </View>
        <View style={{ width: 1, height: 32, backgroundColor: '#e8e8e8' }} />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>采集源</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>6</Text>
        </View>
        <View style={{ width: 1, height: 32, backgroundColor: '#e8e8e8' }} />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>可加工</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#c8a96e' }}>39种</Text>
        </View>
      </View>

      {/* 进入工作室 */}
      <View
        onClick={goToWorkshop}
        style={{
          margin: '12px 16px', padding: '14px 16px',
          backgroundColor: '#2c3e50', borderRadius: 12, cursor: 'pointer',
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 20 }}>🔨</Text>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>进入工作室</Text>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>→</Text>
      </View>

      {/* 底部功能区 */}
      <ScrollView scrollY style={{ flex: 1, padding: '0 16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingBottom: 16 }}>
          <View
            onClick={goToCollection}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 10,
              border: '1px solid #e8e8e8', backgroundColor: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Text style={{ fontSize: 13, color: '#666' }}>📖 图鉴</Text>
          </View>
          <View
            onClick={goToCheckout}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 10,
              border: '1px solid #e8e8e8', backgroundColor: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Text style={{ fontSize: 13, color: '#666' }}>📦 下单</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 0 28px' }}>
          <Text style={{ fontSize: 11, color: '#ccc', letterSpacing: 2 }}>
            指尖流转 · 好运自来
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
