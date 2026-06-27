import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { theme, card, btnPrimary } from '@/lib/theme'

const SAMPLE_BRACELETS: { name: string; desc: string; pattern: number[]; ropeColor: string }[] = [
  { name: '紫气东来', desc: '紫水晶 · 白水晶 · 星光粉', pattern: [14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14], ropeColor: 'rgba(40,40,40,0.6)' },
  { name: '金色年华', desc: '黄水晶 · 白水晶 · 金发晶', pattern: [26, 34, 2, 26, 34, 2, 26, 34, 131, 2, 26, 34, 2, 26, 34, 2], ropeColor: 'rgba(180,180,180,0.6)' },
  { name: '青山绿水', desc: '绿幽灵 · 白幽灵 · 绿发晶', pattern: [7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7], ropeColor: 'rgba(180,180,180,0.6)' },
  { name: '皓月星辰', desc: '月光石 · 星光粉 · 白水晶', pattern: [1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1], ropeColor: 'rgba(40,40,40,0.6)' },
]

function resolveSampleBeads(pattern: number[]) {
  return pattern.map((idx) => { const p = BEAD_PRODUCTS[idx]; if (!p) return null; return { ...p } }).filter(Boolean) as any[]
}

function SampleCard({ sample }: { sample: typeof SAMPLE_BRACELETS[0] }) {
  const beads = resolveSampleBeads(sample.pattern)
  return (
    <View style={{ width: 130, flexShrink: 0, ...card, padding: 0, overflow: 'hidden' }}>
      <View style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', height: '100%', maxWidth: 100 }}>
          <BeadPreviewRing beads={beads} ropeColor={sample.ropeColor} onRemove={() => {}} compact stagger />
        </View>
      </View>
      <View style={{ padding: '4px 8px 8px', textAlign: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: 700, color: theme.textPrimary }}>{sample.name}</Text>
        <Text style={{ fontSize: 10, color: theme.textSecondary }}>{sample.desc}</Text>
      </View>
    </View>
  )
}

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

export default function IndexPage() {
  const [claimed, setClaimed] = useState(false)
  const [claimResult, setClaimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => { api('/user/raw-materials').then((d) => { if (Array.isArray(d)) setStreak(d.filter((x: any) => x.count > 0).length) }) }, [])

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
    <View style={{ minHeight: '100vh', backgroundColor: theme.bgPage }}>
      {/* 顶部品牌 */}
      <View style={{ margin: 16, ...card, padding: '20px 16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, marginBottom: 2 }}>灵珠手作</Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 14, letterSpacing: 1 }}>编一串好运 · 从一颗原石开始</Text>
        <ScrollView scrollX showsHorizontalScrollIndicator={false} style={{ width: '100%' }} enhanced showScrollbar={false}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            {SAMPLE_BRACELETS.map((s, i) => <SampleCard key={i} sample={s} />)}
          </View>
        </ScrollView>
      </View>

      {/* 盲盒卡片 */}
      <View
        onClick={handleClaim}
        style={{
          margin: '12px 16px', padding: 16, backgroundColor: theme.textPrimary, borderRadius: theme.radiusCard,
          display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', boxShadow: `0 4px 0 0 ${theme.shadowInput}`,
        }}
      >
        <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, fontSize: 28 }}>
          {claimResult?.success ? '🎁' : loading ? '⏳' : '🎀'}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 700, color: theme.bgCard }}>{claimResult?.success ? `获得 ${claimResult.material.name}` : claimed ? '今日已领取' : '每日盲盒'}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{claimResult?.success ? `稀有度: ${claimResult.material.rarity}` : '点击领取今日原料'}</Text>
        </View>
        <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>→</Text>
      </View>

      {/* 数据 */}
      <View style={{ margin: '0 16px', padding: '12px 16px', ...card, display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 11, color: theme.textSecondary }}>已收集</Text><Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>{streak}</Text></View>
        <View style={{ width: 1, height: 32, backgroundColor: theme.border }} />
        <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 11, color: theme.textSecondary }}>采集源</Text><Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>6</Text></View>
        <View style={{ width: 1, height: 32, backgroundColor: theme.border }} />
        <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 11, color: theme.textSecondary }}>可加工</Text><Text style={{ fontSize: 18, fontWeight: 700, color: theme.primary }}>39种</Text></View>
      </View>

      {/* 进入工作室 */}
      <View
        onClick={goToWorkshop}
        style={{
          margin: '12px 16px', padding: '14px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          ...btnPrimary, borderRadius: theme.radiusPill,
        }}
      >
        <Text style={{ fontSize: 20 }}>🔨</Text>
        <Text style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>进入工作室</Text>
        <Text style={{ fontSize: 16, color: theme.textDisabled }}>→</Text>
      </View>

      {/* 底部导航 */}
      <ScrollView scrollY style={{ flex: 1, padding: '0 16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingBottom: 16 }}>
          <View onClick={goToCollection} style={{ flex: 1, padding: '12px 0', borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 13, color: theme.textBody }}>📖 图鉴</Text>
          </View>
          <View onClick={goToCheckout} style={{ flex: 1, padding: '12px 0', borderRadius: theme.radiusPill, border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 13, color: theme.textBody }}>📦 下单</Text>
          </View>
        </View>
        <View style={{ alignItems: 'center', padding: '18px 0 28px' }}>
          <Text style={{ fontSize: 11, color: theme.textDisabled, letterSpacing: 2 }}>指尖流转 · 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
