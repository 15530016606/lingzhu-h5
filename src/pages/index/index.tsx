import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { theme } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

/* ── 样品手串：按运势/心愿分类，带趣味评分 ── */
const BRACELET_GROUPS = [
  {
    label: '财运亨通',
    tag: '招财',
    items: [
      { name: '金玉满堂', desc: '金发晶 金曜石 黄水晶', score: '9.2', idx: [131, 86, 26, 131, 86, 26, 131, 86, 26, 131, 86, 26, 131, 86, 26, 131], rope: 'rgba(160,130,80,0.5)' },
      { name: '富贵连连', desc: '金虎眼 金运石 白水晶', score: '8.8', idx: [103, 91, 2, 103, 91, 2, 103, 91, 2, 103, 91, 2, 103, 91, 2, 103], rope: 'rgba(160,140,100,0.5)' },
      { name: '黄金万两', desc: '冰糖黄 柠檬黄 蜜蜡', score: '8.5', idx: [28, 24, 183, 28, 24, 0, 28, 24, 183, 28, 24, 0, 28, 24, 183, 28], rope: 'rgba(180,160,100,0.5)' },
    ],
  },
  {
    label: '桃花人缘',
    tag: '人缘',
    items: [
      { name: '粉黛佳人', desc: '星光粉 草莓晶 白水晶', score: '9.0', idx: [36, 73, 1, 36, 73, 1, 36, 73, 1, 36, 73, 1, 36, 73, 1, 36], rope: 'rgba(180,140,150,0.4)' },
      { name: '倾国倾城', desc: '鸽血红 果冻粉 粉晶', score: '8.7', idx: [75, 39, 37, 75, 39, 37, 75, 39, 37, 75, 39, 37, 75, 39, 37, 75], rope: 'rgba(180,100,120,0.4)' },
      { name: '桃之夭夭', desc: '紫锂辉 星光粉 白水晶', score: '8.3', idx: [9, 38, 0, 9, 38, 0, 9, 38, 0, 9, 38, 0, 9, 38, 0, 9], rope: 'rgba(160,120,140,0.4)' },
    ],
  },
  {
    label: '学业智慧',
    tag: '开慧',
    items: [
      { name: '金榜题名', desc: '海蓝宝 蓝晶石 白水晶', score: '9.1', idx: [48, 52, 2, 48, 52, 2, 48, 52, 2, 48, 52, 2, 48, 52, 2, 48], rope: 'rgba(60,100,160,0.4)' },
      { name: '聪明伶俐', desc: '蓝月光 海蓝宝 白水晶', score: '8.6', idx: [65, 47, 0, 65, 47, 0, 65, 47, 0, 65, 47, 0, 65, 47, 0, 65], rope: 'rgba(80,110,150,0.4)' },
      { name: '灵感涌现', desc: '紫水晶 蓝晶石 白水晶', score: '8.4', idx: [11, 51, 1, 11, 51, 1, 11, 51, 1, 11, 51, 1, 11, 51, 1, 11], rope: 'rgba(100,80,140,0.4)' },
    ],
  },
  {
    label: '健康平安',
    tag: '安神',
    items: [
      { name: '四季平安', desc: '绿幽灵 葡萄石 白水晶', score: '9.0', idx: [60, 54, 2, 60, 54, 2, 60, 54, 2, 60, 54, 2, 60, 54, 2, 60], rope: 'rgba(100,140,100,0.4)' },
      { name: '身心安定', desc: '沉香 檀木 灰月光', score: '8.8', idx: [143, 146, 66, 143, 146, 66, 143, 146, 66, 143, 146, 66, 143, 146, 66, 143], rope: 'rgba(100,80,60,0.6)' },
      { name: '清净自在', desc: '碧玉 绿萤石 白水晶', score: '8.5', idx: [157, 58, 0, 157, 58, 0, 157, 58, 0, 157, 58, 0, 157, 58, 0, 157], rope: 'rgba(100,130,100,0.4)' },
    ],
  },
  {
    label: '转运开运',
    tag: '转运',
    items: [
      { name: '否极泰来', desc: '黑发晶 金曜石 白水晶', score: '9.3', idx: [112, 88, 1, 112, 88, 1, 112, 88, 1, 112, 88, 1, 112, 88, 1, 112], rope: 'rgba(60,60,60,0.6)' },
      { name: '时来运转', desc: '虎眼石 金虎眼 茶水晶', score: '8.7', idx: [100, 101, 85, 100, 101, 85, 100, 101, 85, 100, 101, 85, 100, 101, 85, 100], rope: 'rgba(120,100,60,0.5)' },
      { name: '万象更新', desc: '乌拉圭紫 薰衣草紫 白', score: '8.5', idx: [20, 16, 2, 20, 16, 2, 20, 16, 2, 20, 16, 2, 20, 16, 2, 20], rope: 'rgba(80,60,100,0.5)' },
    ],
  },
  {
    label: '情侣双珠',
    tag: '良缘',
    items: [
      { name: '心有灵犀', desc: '粉水晶 紫水晶 白水晶', score: '8.9', idx: [36, 11, 0, 36, 11, 0, 36, 11, 0, 36, 11, 0, 36, 11, 0, 36], rope: 'rgba(160,100,140,0.4)' },
      { name: '长相厮守', desc: '南红 蜜蜡 金运石', score: '8.6', idx: [163, 183, 91, 163, 183, 91, 163, 183, 91, 163, 183, 91, 163, 183, 91, 163], rope: 'rgba(160,80,80,0.5)' },
      { name: '比翼双飞', desc: '蓝月光 白水晶 灰月光', score: '8.3', idx: [64, 2, 67, 64, 2, 67, 64, 2, 67, 64, 2, 67, 64, 2, 67, 64], rope: 'rgba(100,120,160,0.4)' },
    ],
  },
]

const S = {
  card: { background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, boxShadow: `0 2px 12px ${theme.shadow}` },
}

function SampleCard({ item, rank }: { item: any; rank: number }) {
  const beads = item.idx.map((i: number) => { const p = BEAD_PRODUCTS[i]; return p ? { ...p } : null }).filter(Boolean) as any[]
  return (
    <View style={{ width: 130, flexShrink: 0, background: theme.bgPage, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      {/* 排名角标 */}
      <View style={{ position: 'absolute', top: 4, left: 4, zIndex: 2, width: 22, height: 22, borderRadius: '50%', background: rank <= 1 ? '#e05a5a' : rank === 2 ? theme.accent : theme.textDisabled, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{rank}</Text>
      </View>
      <View style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%', height: '100%', maxWidth: 100 }}>
          <BeadPreviewRing beads={beads} ropeColor={item.rope} onRemove={() => {}} compact stagger />
        </View>
      </View>
      <View style={{ padding: '2px 8px 8px', textAlign: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{item.name}</Text>
        <Text style={{ fontSize: 9, color: theme.textSecondary, marginTop: 1 }}>{item.desc}</Text>
        {/* 评分 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>{item.score}</Text>
          <Text style={{ fontSize: 8, color: theme.textDisabled }}>分</Text>
        </View>
      </View>
    </View>
  )
}

export default function IndexPage() {
  const [claimed, setClaimed] = useState(false)
  const [cl, setCl] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cnt, setCnt] = useState(0)

  useEffect(() => { api('/user/raw-materials').then(d => Array.isArray(d) && setCnt(d.filter((x: any) => x.count > 0).length)) }, [])

  const claim = useCallback(async () => {
    if (claimed || loading) return; setLoading(true)
    const r = await api('/user/claim-daily', { method: 'POST' })
    setCl(r); if (r.success) setClaimed(true); setLoading(false)
  }, [claimed, loading])

  const go = (p: string) => Taro.navigateTo({ url: p })

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }}>
      <ScrollView scrollY style={{ flex: 1, padding: '16px 16px 0' }}>

        {/* ====== 顶部品牌 ====== */}
        <View style={{ padding: '24px 20px 18px', marginBottom: 16, ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 26, fontWeight: 700, color: theme.textPrimary, letterSpacing: 2, marginBottom: 4 }}>灵珠手作</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, letterSpacing: 3 }}>编一串好运 从一颗原石开始</Text>
        </View>

        {/* ====== 游戏核心区 ====== */}

        {/* 每日盲盒 */}
        <View onClick={claim} style={{ marginBottom: 14, padding: 18, background: 'linear-gradient(135deg, #8db5a4 0%, #9db9a5 100%)', borderRadius: theme.radiusCard, display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
          <View style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.3 }}>{cl?.success ? '已领' : loading ? '...' : '每日'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{cl?.success ? `获得  ${cl.material.name}` : claimed || cl?.success === false ? '今日已领取' : '每日免费原料'}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{cl?.success ? `稀有度  ${cl.material.rarity}` : '点击领取 加工成珠子'}</Text>
          </View>
          <View style={{ width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>→</Text>
          </View>
        </View>

        {/* 数据面板 */}
        <View style={{ marginBottom: 14, padding: '14px 20px', ...S.card, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 10, color: theme.textSecondary, marginBottom: 3 }}>已收集原料</Text><Text style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>{cnt}</Text></View>
          <View style={{ width: 1, height: 34, background: theme.borderLight }} />
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 10, color: theme.textSecondary, marginBottom: 3 }}>采集源</Text><Text style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>6</Text></View>
          <View style={{ width: 1, height: 34, background: theme.borderLight }} />
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 10, color: theme.textSecondary, marginBottom: 3 }}>可加工类型</Text><Text style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>39</Text></View>
        </View>

        {/* 进入工作室 —— 视频入口卡片 */}
        <View onClick={() => go('/pages/workshop/index')} style={{ marginBottom: 20, ...S.card, borderRadius: theme.radiusCard, overflow: 'hidden', cursor: 'pointer' }}>
          <Video
            src='/videos/workshop.mp4'
            autoplay
            muted
            loop
            style={{ width: '100%', height: 180, display: 'block', objectFit: 'cover' }}
          />
          <View style={{ padding: '10px 16px 12px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>加工原料做珠子</Text>
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>点击进入工作室</Text>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, color: '#fff' }}>→</Text>
            </View>
          </View>
        </View>

        {/* ====== 下方灵感区：按运势/心愿分类排行 ====== */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 4 }}>手串灵感</Text>
          <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 16 }}>按心愿分类 看看哪种适合你</Text>
        </View>

        {BRACELET_GROUPS.map((group) => (
          <View key={group.label} style={{ marginBottom: 20 }}>
            {/* 分组标题 + 标签 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, display: 'flex' }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{group.label}</Text>
              <View style={{ padding: '1px 8px', borderRadius: theme.radiusTag, background: theme.primaryLight }}>
                <Text style={{ fontSize: 10, color: theme.primaryDark }}>{group.tag}</Text>
              </View>
            </View>
            <ScrollView scrollX showsHorizontalScrollIndicator={false} style={{ width: '100%' }} enhanced showScrollbar={false}>
              <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 2, paddingRight: 2 }}>
                {group.items.map((item, i) => (
                  <SampleCard key={item.name} item={item} rank={i + 1} />
                ))}
              </View>
            </ScrollView>
          </View>
        ))}

        {/* ====== 底部导航 ====== */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View onClick={() => go('/pages/collection/index')} style={{ flex: 1, padding: '14px 0', borderRadius: theme.radiusBtn, border: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: theme.textBody }}>图鉴</Text>
          </View>
          <View onClick={() => go('/pages/checkout/index')} style={{ flex: 1, padding: '14px 0', borderRadius: theme.radiusBtn, border: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: theme.textBody }}>下单</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
          <Text style={{ fontSize: 10, color: theme.textDisabled, letterSpacing: 4 }}>指尖流转 好运自来</Text>
        </View>
      </ScrollView>
    </View>
  )
}
