import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { theme } from '@/lib/theme'
import { preloadSounds, resumeAudio } from '@/lib/sound'
import { getGemCount } from '@/lib/backpack'
const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

const S = { card: { background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, boxShadow: `0 2px 12px ${theme.shadow}` } }

const SOURCES = [
  { id: 'crystal', name: '水晶矿场', desc: '开采水晶原矿', gif: '/videos/bear-brown.gif' },
  { id: 'jade', name: '玉石矿场', desc: '开采玉石原石', gif: '/videos/bear-cub.gif' },
  { id: 'forest', name: '森林', desc: '收集木材树根', gif: '/videos/deer.gif' },
  { id: 'orchard', name: '果园', desc: '采摘果实种子', gif: '/videos/rabbit.gif' },
  { id: 'beach', name: '河床海岸', desc: '拾取卵石贝壳', gif: '/videos/otter.gif' },
  { id: 'workshop', name: '工坊', desc: '制胚烧制琉璃', gif: '/videos/workshop-icon.gif' },
]

const BRACELETS = [
  { label: '财运亨通', tag: '招财', items: [
    { name: '金玉满堂', desc: '金发晶 金曜石 黄水晶', score: '9.2', idx: [131, 86, 26, 131, 86, 26, 131, 86, 26, 131, 86, 26, 131, 86, 26, 131], rope: 'rgba(160,130,80,0.5)' },
    { name: '富贵连连', desc: '金虎眼 金运石 白水晶', score: '8.8', idx: [103, 91, 2, 103, 91, 2, 103, 91, 2, 103, 91, 2, 103, 91, 2, 103], rope: 'rgba(160,140,100,0.5)' },
    { name: '黄金万两', desc: '冰糖黄 柠檬黄 蜜蜡', score: '8.5', idx: [28, 24, 183, 28, 24, 0, 28, 24, 183, 28, 24, 0, 28, 24, 183, 28], rope: 'rgba(180,160,100,0.5)' },
  ]},
  { label: '桃花人缘', tag: '人缘', items: [
    { name: '粉黛佳人', desc: '星光粉 草莓晶 白水晶', score: '9.0', idx: [36, 73, 1, 36, 73, 1, 36, 73, 1, 36, 73, 1, 36, 73, 1, 36], rope: 'rgba(180,140,150,0.4)' },
    { name: '倾国倾城', desc: '鸽血红 果冻粉 粉晶', score: '8.7', idx: [75, 39, 37, 75, 39, 37, 75, 39, 37, 75, 39, 37, 75, 39, 37, 75], rope: 'rgba(180,100,120,0.4)' },
    { name: '桃之夭夭', desc: '紫锂辉 星光粉 白水晶', score: '8.3', idx: [9, 38, 0, 9, 38, 0, 9, 38, 0, 9, 38, 0, 9, 38, 0, 9], rope: 'rgba(160,120,140,0.4)' },
  ]},
]

export default function IndexPage() {
  const [claimed, setClaimed] = useState(false)
  const [cl, setCl] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cnt, setCnt] = useState(0)

  useEffect(() => {
    preloadSounds()
    api('/user/raw-materials').then(d => Array.isArray(d) && setCnt(d.filter((x: any) => x.count > 0).length))
  }, [])

  const claim = useCallback(async () => {
    if (claimed || loading) return; setLoading(true)
    const r = await api('/user/claim-daily', { method: 'POST' })
    setCl(r); if (r.success) setClaimed(true); setLoading(false)
  }, [claimed, loading])

  const go = (p: string) => Taro.navigateTo({ url: p })

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }} onClick={resumeAudio}>
      <ScrollView scrollY style={{ flex: 1, padding: '16px 16px 0' }}>

        {/* 顶部：品牌 + 盲盒 + 统计 紧凑一行 */}
        <View style={{ marginBottom: 16, ...S.card }}>
          {/* 品牌 + 盲盒同一行 */}
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '14px 14px 10px' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1 }}>灵珠手作</Text>
              <Text style={{ fontSize: 10, color: theme.textSecondary, letterSpacing: 2, marginTop: 1 }}>编一串好运 从一颗原石开始</Text>
            </View>
            <View onClick={claim} style={{ background: 'linear-gradient(135deg, #d4a574, #c9a87c)', borderRadius: theme.radiusBtn, padding: '8px 14px', flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer', display: 'flex' }}>
              <View style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{cl?.success ? '✓' : loading ? '...' : '日'}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>
                {cl?.success ? '已领' : '每日盲盒'}
              </Text>
            </View>
          </View>
          {/* 统计条 */}
          <View style={{ display: 'flex', flexDirection: 'row', padding: '8px 14px 12px', gap: 0 }}>
            <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 9, color: theme.textSecondary }}>已收集</Text><Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>{cnt}</Text></View>
            <View style={{ width: 1, height: 26, background: theme.borderLight, alignSelf: 'center' }} />
            <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 9, color: theme.textSecondary }}>采集源</Text><Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>6</Text></View>
            <View style={{ width: 1, height: 26, background: theme.borderLight, alignSelf: 'center' }} />
            <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 9, color: theme.textSecondary }}>可加工</Text><Text style={{ fontSize: 16, fontWeight: 700, color: theme.accent }}>39</Text></View>
          </View>
        </View>

        {/* 采集源 2x3 网格 */}
        <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>选择采集源</Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {SOURCES.map(src => (
            <View key={src.id} onClick={() => go(`/pages/scene/index?source=${src.id}`)} style={{ width: 'calc(33.33% - 7px)', padding: '14px 8px 10px', background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, cursor: 'pointer', boxShadow: `0 2px 8px ${theme.shadow}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <img src={src.gif} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, textAlign: 'center' }}>{src.name}</Text>
            </View>
          ))}
        </View>

        {/* 手串灵感（折叠展示，只显示前 2 组） */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>手串灵感</Text>
          {BRACELETS.map(group => (
            <View key={group.label} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, display: 'flex' }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{group.label}</Text>
                <View style={{ padding: '1px 6px', borderRadius: theme.radiusTag, background: theme.primaryLight }}><Text style={{ fontSize: 9, color: theme.primaryDark }}>{group.tag}</Text></View>
              </View>
              <ScrollView scrollX showsHorizontalScrollIndicator={false} style={{ width: '100%' }} enhanced showScrollbar={false}>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 2, paddingRight: 2 }}>
                  {group.items.map((item, i) => (
                    <View key={item.name} style={{ width: 120, flexShrink: 0, background: theme.bgPage, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 4, left: 4, zIndex: 2, width: 18, height: 18, borderRadius: '50%', background: i <= 0 ? '#e05a5a' : i === 1 ? theme.accent : theme.textDisabled, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{i + 1}</Text>
                      </View>
                      <View style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: '100%', height: '100%', maxWidth: 90 }}>
                          <BeadPreviewRing beads={item.idx.map((i: number) => { const p = BEAD_PRODUCTS[i]; return p ? { ...p } : null }).filter(Boolean) as any[]} ropeColor={item.rope} onRemove={() => {}} compact stagger />
                        </View>
                      </View>
                      <View style={{ padding: '2px 6px 6px', textAlign: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>{item.name}</Text>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: theme.accent }}>{item.score} 分</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>

        {/* 底部导航 */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <View onClick={() => go('/pages/collection/index')} style={{ flex: 1, padding: '12px 0', borderRadius: theme.radiusBtn, border: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 13, fontWeight: 500, color: theme.textBody }}>图鉴</Text>
          </View>
          <View onClick={() => go('/pages/checkout/index')} style={{ flex: 1, padding: '12px 0', borderRadius: theme.radiusBtn, border: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 13, fontWeight: 500, color: theme.textBody }}>下单</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 28 }}>
          <Text style={{ fontSize: 10, color: theme.textDisabled, letterSpacing: 4 }}>指尖流转 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
