import { useCallback, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { theme } from '@/lib/theme'
import { preloadSounds, resumeAudio } from '@/lib/sound'
import { getGemCount, getScrapCount, getBackpack } from '@/lib/backpack'
import { getInventory } from '@/lib/inventory'
import { MATERIAL_INFO } from '@/lib/material-map'
const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

const SOURCES = [
  { id: 'crystal', name: '水晶矿场', desc: '开采水晶原矿', gif: '/videos/bear-brown.gif' },
  { id: 'jade', name: '玉石矿场', desc: '开采玉石原石', gif: '/videos/bear-cub.gif' },
  { id: 'forest', name: '森林', desc: '收集木材树根', gif: '/videos/deer.gif' },
  { id: 'orchard', name: '果园', desc: '采摘果实种子', gif: '/videos/rabbit.gif' },
  { id: 'beach', name: '河床海岸', desc: '拾取卵石贝壳', gif: '/videos/otter.gif' },
  { id: 'workshop', name: '工坊', desc: '制胚烧制琉璃', gif: '/videos/workshop-icon.gif' },
]

const BRACELETS = [
  // ===== 按寓意 =====
  { label: '财运亨通', tag: '招财', items: [
    { name: '财源广进', desc: '金发晶 黄水晶 金曜石', score: '9.2', idx: [128, 24, 86, 128, 24, 86, 128, 24, 86, 128, 24, 86, 128, 24, 86, 128], rope: 'rgba(180,140,60,0.5)' },
    { name: '日进斗金', desc: '金虎眼 金发晶 黄水晶', score: '8.8', idx: [101, 128, 24, 101, 128, 24, 101, 128, 24, 101, 128, 24, 101, 128, 24, 101], rope: 'rgba(170,130,60,0.5)' },
    { name: '招财纳福', desc: '金曜石 黄水晶 蜜蜡', score: '8.5', idx: [86, 26, 183, 86, 26, 183, 86, 26, 183, 86, 26, 183, 86, 26, 183, 86], rope: 'rgba(190,150,70,0.5)' },
    { name: '富贵天成', desc: '蜜蜡 金发晶 金运石', score: '8.3', idx: [183, 130, 91, 183, 130, 91, 183, 130, 91, 183, 130, 91, 183, 130, 91, 183], rope: 'rgba(180,150,80,0.5)' },
  ]},
  { label: '桃花人缘', tag: '人缘', items: [
    { name: '粉黛佳人', desc: '星光粉 草莓晶 粉水晶双尖', score: '9.0', idx: [35, 72, 187, 35, 72, 187, 35, 72, 187, 35, 72, 187, 35, 72, 187, 35], rope: 'rgba(200,130,150,0.4)' },
    { name: '红鸾心动', desc: '鸽血红 果冻粉 星光粉', score: '8.7', idx: [75, 39, 35, 75, 39, 35, 75, 39, 35, 75, 39, 35, 75, 39, 35, 75], rope: 'rgba(200,100,130,0.4)' },
    { name: '甜蜜蜜', desc: '草莓晶 红玛瑙 果冻粉', score: '8.4', idx: [72, 78, 39, 72, 78, 39, 72, 78, 39, 72, 78, 39, 72, 78, 39, 72], rope: 'rgba(200,110,120,0.4)' },
    { name: '良缘天定', desc: '紫锂辉 星光粉 白水晶', score: '8.1', idx: [9, 35, 0, 9, 35, 0, 9, 35, 0, 9, 35, 0, 9, 35, 0, 9], rope: 'rgba(160,120,160,0.4)' },
  ]},
  { label: '健康平安', tag: '平安', items: [
    { name: '翠色清风', desc: '绿幽灵 葡萄石 碧玉', score: '9.1', idx: [60, 54, 157, 60, 54, 157, 60, 54, 157, 60, 54, 157, 60, 54, 157, 60], rope: 'rgba(100,160,100,0.4)' },
    { name: '玉石养人', desc: '和田玉 碧玉 绿松石', score: '8.6', idx: [153, 157, 177, 153, 157, 177, 153, 157, 177, 153, 157, 177, 153, 157, 177, 153], rope: 'rgba(130,150,100,0.4)' },
    { name: '福寿安康', desc: '沉香 绿幽灵 葡萄石', score: '8.3', idx: [142, 60, 54, 142, 60, 54, 142, 60, 54, 142, 60, 54, 142, 60, 54, 142], rope: 'rgba(100,120,80,0.5)' },
  ]},
  { label: '学业精进', tag: '文昌', items: [
    { name: '金榜题名', desc: '黄水晶 白水晶 蓝晶石', score: '8.8', idx: [24, 0, 51, 24, 0, 51, 24, 0, 51, 24, 0, 51, 24, 0, 51, 24], rope: 'rgba(150,140,100,0.4)' },
    { name: '睿智明澈', desc: '海蓝宝 白水晶 蓝月光', score: '8.5', idx: [43, 0, 64, 43, 0, 64, 43, 0, 64, 43, 0, 64, 43, 0, 64, 43], rope: 'rgba(100,140,200,0.4)' },
    { name: '步步高升', desc: '金发晶 金虎眼 白水晶', score: '8.2', idx: [128, 101, 0, 128, 101, 0, 128, 101, 0, 128, 101, 0, 128, 101, 0, 128], rope: 'rgba(160,130,80,0.4)' },
  ]},
  // ===== 按色系 =====
  { label: '白色系', tag: '纯净', items: [
    { name: '冰清玉洁', desc: '白水晶 白幽灵 白水晶方糖', score: '8.8', idx: [0, 7, 189, 0, 7, 189, 0, 7, 189, 0, 7, 189, 0, 7, 189, 0], rope: 'rgba(210,215,220,0.3)' },
    { name: '月华如水', desc: '白水晶 白水晶弯管 白幽灵', score: '8.5', idx: [0, 190, 7, 0, 190, 7, 0, 190, 7, 0, 190, 7, 0, 190, 7, 0], rope: 'rgba(200,205,210,0.3)' },
    { name: '雪落', desc: '白幽灵 白水晶 灰月光', score: '8.2', idx: [8, 0, 63, 8, 0, 63, 8, 0, 63, 8, 0, 63, 8, 0, 63, 8], rope: 'rgba(190,195,200,0.3)' },
    { name: '白玉', desc: '白水晶方糖 白水晶 白水晶双尖', score: '8.0', idx: [189, 0, 185, 189, 0, 185, 189, 0, 185, 189, 0, 185, 189, 0, 185, 189], rope: 'rgba(205,210,215,0.3)' },
  ]},
  { label: '紫色系', tag: '神秘', items: [
    { name: '紫气东来', desc: '巴西紫晶 乌拉圭紫晶 紫锂辉', score: '9.0', idx: [11, 20, 9, 11, 20, 9, 11, 20, 9, 11, 20, 9, 11, 20, 9, 11], rope: 'rgba(120,80,160,0.4)' },
    { name: '薰衣草', desc: '薰衣草紫晶 巴西紫晶 紫锂辉', score: '8.6', idx: [16, 12, 9, 16, 12, 9, 16, 12, 9, 16, 12, 9, 16, 12, 9, 16], rope: 'rgba(150,110,180,0.4)' },
    { name: '紫夜', desc: '乌拉圭紫晶 巴西紫晶 紫锂辉', score: '8.3', idx: [22, 13, 10, 22, 13, 10, 22, 13, 10, 22, 13, 10, 22, 13, 10, 22], rope: 'rgba(80,60,140,0.5)' },
    { name: '紫霞', desc: '紫锂辉 薰衣草紫晶 巴西紫晶', score: '8.1', idx: [15, 18, 14, 15, 18, 14, 15, 18, 14, 15, 18, 14, 15, 18, 14, 15], rope: 'rgba(140,90,170,0.4)' },
  ]},
  { label: '粉色系', tag: '温柔', items: [
    { name: '粉红泡泡', desc: '星光粉 果冻粉 粉晶双尖', score: '8.8', idx: [35, 39, 187, 35, 39, 187, 35, 39, 187, 35, 39, 187, 35, 39, 187, 35], rope: 'rgba(200,130,150,0.4)' },
    { name: '桃之夭夭', desc: '星光粉 果冻粉 白水晶', score: '8.4', idx: [36, 40, 0, 36, 40, 0, 36, 40, 0, 36, 40, 0, 36, 40, 0, 36], rope: 'rgba(200,140,150,0.4)' },
    { name: '胭脂扣', desc: '果冻粉 星光粉 红胶花', score: '8.1', idx: [41, 37, 123, 41, 37, 123, 41, 37, 123, 41, 37, 123, 41, 37, 123, 41], rope: 'rgba(210,110,130,0.4)' },
  ]},
  { label: '红色系', tag: '热情', items: [
    { name: '鸿运当头', desc: '南红 红玛瑙 鸽血红', score: '8.8', idx: [163, 78, 75, 163, 78, 75, 163, 78, 75, 163, 78, 75, 163, 78, 75, 163], rope: 'rgba(180,60,60,0.4)' },
    { name: '朱砂', desc: '帝王砂 南红 红玛瑙', score: '8.5', idx: [166, 164, 79, 166, 164, 79, 166, 164, 79, 166, 164, 79, 166, 164, 79, 166], rope: 'rgba(160,40,40,0.5)' },
    { name: '赤诚之心', desc: '石榴石 红玛瑙 鸽血红', score: '8.2', idx: [191, 80, 76, 191, 80, 76, 191, 80, 76, 191, 80, 76, 191, 80, 76, 191], rope: 'rgba(160,50,50,0.4)' },
  ]},
  { label: '绿色系', tag: '清新', items: [
    { name: '绿野仙踪', desc: '绿幽灵 碧玉 葡萄石', score: '9.0', idx: [60, 157, 54, 60, 157, 54, 60, 157, 54, 60, 157, 54, 60, 157, 54, 60], rope: 'rgba(80,160,100,0.4)' },
    { name: '森系', desc: '绿发晶 绿萤石 青提岫玉', score: '8.5', idx: [114, 58, 160, 114, 58, 160, 114, 58, 160, 114, 58, 160, 114, 58, 160, 114], rope: 'rgba(120,150,80,0.4)' },
    { name: '翡翠', desc: '碧玉 绿龙晶 绿松石', score: '8.2', idx: [158, 81, 177, 158, 81, 177, 158, 81, 177, 158, 81, 177, 158, 81, 177, 158], rope: 'rgba(100,180,120,0.4)' },
    { name: '青提', desc: '青提岫玉 葡萄石 碧玉', score: '8.0', idx: [161, 55, 155, 161, 55, 155, 161, 55, 155, 161, 55, 155, 161, 55, 155, 161], rope: 'rgba(140,180,100,0.4)' },
  ]},
  { label: '蓝色系', tag: '宁静', items: [
    { name: '碧海蓝天', desc: '海蓝宝 蓝晶石 蓝月光', score: '8.8', idx: [43, 51, 64, 43, 51, 64, 43, 51, 64, 43, 51, 64, 43, 51, 64, 43], rope: 'rgba(80,140,200,0.4)' },
    { name: '深海', desc: '海蓝宝 海纹石 蓝晶石', score: '8.4', idx: [45, 180, 52, 45, 180, 52, 45, 180, 52, 45, 180, 52, 45, 180, 52, 45], rope: 'rgba(60,120,180,0.4)' },
    { name: '星河', desc: '蓝月光 青金石 海蓝宝', score: '8.1', idx: [65, 199, 44, 65, 199, 44, 65, 199, 44, 65, 199, 44, 65, 199, 44, 65], rope: 'rgba(100,100,200,0.4)' },
  ]},
  { label: '金色系', tag: '阳光', items: [
    { name: '鎏金', desc: '金发晶 金曜石 蜜蜡', score: '8.8', idx: [128, 86, 183, 128, 86, 183, 128, 86, 183, 128, 86, 183, 128, 86, 183, 128], rope: 'rgba(180,140,80,0.5)' },
    { name: '暖阳', desc: '黄水晶 蜜蜡 黄塔晶', score: '8.5', idx: [24, 183, 31, 24, 183, 31, 24, 183, 31, 24, 183, 31, 24, 183, 31, 24], rope: 'rgba(200,160,80,0.5)' },
    { name: '落日', desc: '金虎眼 黄虎眼 金发晶', score: '8.2', idx: [103, 108, 131, 103, 108, 131, 103, 108, 131, 103, 108, 131, 103, 108, 131, 103], rope: 'rgba(180,150,70,0.5)' },
  ]},
  { label: '木质系', tag: '古朴', items: [
    { name: '禅意', desc: '沉香 星月菩提 檀木', score: '8.5', idx: [142, 141, 146, 142, 141, 146, 142, 141, 146, 142, 141, 146, 142, 141, 146, 142], rope: 'rgba(120,80,50,0.6)' },
    { name: '山野', desc: '猴头 树王 百香籽', score: '8.2', idx: [140, 137, 139, 140, 137, 139, 140, 137, 139, 140, 137, 139, 140, 137, 139, 140], rope: 'rgba(100,70,40,0.6)' },
    { name: '书香气', desc: '老山檀 黄杨木 沉香', score: '7.9', idx: [149, 165, 144, 149, 165, 144, 149, 165, 144, 149, 165, 144, 149, 165, 144, 149], rope: 'rgba(130,90,60,0.6)' },
  ]},
]

const QC = { bgCard: theme.bgCard, br: theme.radiusCard, bd: `1px solid ${theme.borderLight}`, sh: `0 2px 12px ${theme.shadow}` }

const StepBadge = ({ n }: { n: number }) => (
  <div style={{
    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #e0d0b0, #d4c8a0)',
    boxShadow: '0 2px 6px rgba(180,160,120,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{n}</span>
  </div>
)

const QuickBtn = ({ emoji, label, sub, onClick, accent }: { emoji: string; label: string; sub: string; onClick: () => void; accent?: boolean }) => (
  <div onClick={onClick} onTouchEnd={onClick} style={{
    flex: 1, padding: '12px 4px', borderRadius: 14, cursor: 'pointer', touchAction: 'manipulation',
    background: theme.bgCard, border: accent ? `1.5px solid ${theme.accent}44` : `1px solid ${theme.borderLight}`,
    boxShadow: accent ? `0 2px 8px ${theme.shadow}` : 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'transform 0.15s, box-shadow 0.15s',
    WebkitTapHighlightColor: 'transparent',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 12,
      background: accent ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}11)` : '#f5f0e8',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{label}</span>
    <span style={{ fontSize: 9, color: accent ? theme.accent : theme.textSecondary, fontWeight: accent ? 600 : 400 }}>{sub}</span>
  </div>
)

const FlowCard = ({ num, imgSrc, title, desc, badge, onClick }: {
  num: number; imgSrc: string; title: string; desc: string; badge: { text: string; active: boolean }; onClick: () => void
}) => (
  <div onClick={onClick} onTouchEnd={onClick} style={{
    marginBottom: 12, borderRadius: 18, overflow: 'hidden',
    background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
    boxShadow: `0 2px 12px ${theme.shadow}`, cursor: 'pointer', touchAction: 'manipulation',
    display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative',
    transition: 'transform 0.15s, box-shadow 0.15s',
    WebkitTapHighlightColor: 'transparent',
  }}>
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
      <StepBadge n={num} />
    </div>
    <div style={{
      width: 120, minHeight: 120, flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg, #f5efe4, #efe5d5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>{title}</span>
      <span style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{desc}</span>
      <div style={{
        marginTop: 4, padding: '4px 10px', borderRadius: 10, alignSelf: 'flex-start',
        background: badge.active ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}11)` : '#f0ece4',
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: badge.active ? theme.accent : '#b8b0a0' }}>{badge.text}</span>
      </div>
    </div>
    <div style={{
      width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: 18, color: '#d4c0a8', fontWeight: 300 }}>›</span>
    </div>
  </div>
)

export default function IndexPage() {
  const [claimed, setClaimed] = useState(false)
  const [cl, setCl] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userPhone, setUserPhone] = useState('')

  const gemCount = getGemCount()
  const scrapCount = getScrapCount()
  const backpack = getBackpack()
  const gemTypes = backpack.filter(i => i.type === 'gem').length
  const beadInv = getInventory()
  const beadTotal = beadInv.reduce((s, i) => s + i.count, 0)
  const beadTypes = beadInv.length
  const collectedCount = new Set(beadInv.map(i => i.material)).size

  useEffect(() => {
    preloadSounds()
    // 读取用户手机号
    const phone = localStorage.getItem('user_phone')
    if (phone) setUserPhone(phone)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_phone')
    window.location.hash = '#/pages/signin/index'
  }, [])

  const claim = useCallback(async () => {
    if (claimed || loading) return; setLoading(true)
    const r = await api('/user/claim-daily', { method: 'POST' })
    setCl(r); if (r.success) setClaimed(true); setLoading(false)
  }, [claimed, loading])

  const go = (p: string) => Taro.navigateTo({ url: p })

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }} onClick={resumeAudio}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px 16px 0' }}>

        {/* ===== 品牌头 ===== */}
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginRight: 10,
            background: 'linear-gradient(135deg, #d4a574, #c4956a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(212,165,116,0.3)',
          }}>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>灵</span>
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1 }}>灵珠手作</span>
            <div style={{ fontSize: 9, color: theme.textSecondary, letterSpacing: 2, marginTop: 1 }}>从一颗原石开始</div>
          </div>
          <div style={{ flex: 1 }} />
          {/* 登录/登出入口 */}
          {userPhone ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #d4a574, #c4956a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>
                  {userPhone.slice(-4)}
                </span>
              </div>
              <span onClick={handleLogout}
                style={{ fontSize: 10, color: '#b8a898', cursor: 'pointer', touchAction: 'manipulation', padding: '2px 4px' }}
              >退出</span>
            </div>
          ) : (
            <div onClick={() => { const t = Taro.getStorageSync('token'); if (t) Taro.showToast({ title: '已登录', icon: 'none' }); else go('/pages/signin/index') }}
              style={{ padding: '4px 10px', borderRadius: 12, background: theme.borderLight, cursor: 'pointer', touchAction: 'manipulation' }}>
              <span style={{ fontSize: 10, color: theme.textSecondary }}>登录</span>
            </div>
          )}
        </div>

        {/* ===== 每日盲盒 ===== */}
        <div onClick={claim} onTouchEnd={claim} style={{
          marginBottom: 14, padding: '20px 20px', borderRadius: 20,
          background: 'linear-gradient(135deg, #e8d5b8, #d4a574)',
          boxShadow: '0 4px 24px rgba(212,165,116,0.35)',
          cursor: 'pointer', touchAction: 'manipulation', position: 'relative', overflow: 'hidden',
        }}>
          {/* 背景装饰圆 */}
          <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                  {cl?.success ? '今日已领取' : loading ? '领取中...' : '每日盲盒'}
                </span>
                {cl?.success ? null : (
                  <div style={{ padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: 8, color: '#fff', fontWeight: 600 }}>每日</span>
                  </div>
                )}
              </div>
              <div style={{ height: 4 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                {cl?.success ? `获得 ${cl?.items?.length || 0} 种原料` : '每日签到领取随机原料 可加工成珠子'}
              </span>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 26 }}>{cl?.success ? '🎁' : '🎀'}</span>
            </div>
          </div>
          {cl?.items && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginTop: 12, position: 'relative', zIndex: 1 }}>
              {cl.items.map((it: any, i: number) => {
                const info = MATERIAL_INFO[it.id] || { label: it.name, color: '#999', bg: '#eee' }
                return (
                  <div key={i} style={{
                    padding: '4px 10px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: info.color }} />
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{info.label} x{it.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== 统计面板 ===== */}
        <div style={{
          marginBottom: 16, padding: '14px 16px', borderRadius: 16,
          background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
          boxShadow: `0 2px 8px ${theme.shadow}`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>{gemCount}</span>
              <span style={{ fontSize: 9, color: theme.textSecondary, letterSpacing: 0.5 }}>原料</span>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: `${theme.accent}44`, marginTop: 2 }} />
            </div>
            <div style={{ width: 1, height: 36, background: theme.borderLight }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>{beadTotal}</span>
              <span style={{ fontSize: 9, color: theme.textSecondary, letterSpacing: 0.5 }}>珠子</span>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: `${theme.accent}44`, marginTop: 2 }} />
            </div>
            <div style={{ width: 1, height: 36, background: theme.borderLight }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>{collectedCount}/16</span>
              <span style={{ fontSize: 9, color: theme.textSecondary, letterSpacing: 0.5 }}>图鉴</span>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: col => collectedCount >= 8 ? '#69f0ae44' : `${theme.accent}44`, marginTop: 2 }} />
            </div>
            <div style={{ width: 1, height: 36, background: theme.borderLight }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>{scrapCount}</span>
              <span style={{ fontSize: 9, color: theme.textSecondary, letterSpacing: 0.5 }}>废料</span>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: '#a0988844', marginTop: 2 }} />
            </div>
          </div>
        </div>

        {/* ===== 快捷入口 ===== */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          <QuickBtn emoji="🎒" label="背包" sub={gemTypes > 0 ? `${gemTypes} 种原料` : '空背包'} onClick={() => go('/pages/backpack/index')} />
          <QuickBtn emoji="📿" label="串珠" sub={beadTotal > 0 ? `${beadTotal} 颗可用` : '暂无珠子'} onClick={() => go('/pages/designer/index')} accent />
          <QuickBtn emoji="📕" label="图鉴" sub={`${collectedCount}/16 种`} onClick={() => go('/pages/collection/index')} />
        </div>

        {/* ===== ① 采集源 ===== */}
        <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StepBadge n={1} />
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>采集源</span>
          <div style={{ padding: '1px 8px', borderRadius: 8, background: theme.borderLight }}>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>玩游戏获取原料</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {SOURCES.map(src => (
            <div key={src.id} onClick={() => go(`/pages/scene/index?source=${src.id}`)} style={{
              width: 'calc(33.33% - 7px)', padding: '16px 8px 12px',
              background: theme.bgCard, borderRadius: 16,
              border: `1px solid ${theme.borderLight}`, cursor: 'pointer',
              boxShadow: `0 2px 8px ${theme.shadow}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              transition: 'transform 0.15s',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, overflow: 'hidden', marginBottom: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <img src={src.gif} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, textAlign: 'center' }}>{src.name}</span>
              <span style={{ fontSize: 9, color: theme.textSecondary, marginTop: 2 }}>{src.desc}</span>
            </div>
          ))}
        </div>

        {/* ===== ② 加工 ===== */}
        <FlowCard
          num={2}
          imgSrc="/images/home/thumb_workshop-illustration.png"
          title="背包加工"
          desc={gemTypes > 0 ? `背包里有 ${gemTypes} 种原料可加工成珠子` : '先去采集源获取原料吧'}
          badge={{ text: gemTypes > 0 ? `${gemCount} 个原料待加工` : '空背包', active: gemTypes > 0 }}
          onClick={() => go('/pages/backpack/index')}
        />

        {/* ===== ③ 串珠 ===== */}
        <FlowCard
          num={3}
          imgSrc="/images/home/thumb_bead-stringing-icon.png"
          title="开始串珠"
          desc={beadTotal > 0 ? `已有 ${beadTotal} 颗珠子可串成手串` : '加工出珠子再来串手串吧'}
          badge={{ text: beadTotal > 0 ? `${beadTypes} 种珠子` : '暂无珠子', active: beadTotal > 0 }}
          onClick={() => go('/pages/designer/index')}
        />

        {/* 分隔 */}
        <div style={{ height: 24 }} />

        {/* ===== 手串灵感 ===== */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>手串灵感</span>
            <span style={{ fontSize: 10, color: theme.textSecondary }}>定制你的专属手串</span>
          </div>
          {BRACELETS.map(group => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              <div style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, display: 'flex' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{group.label}</span>
                <div style={{ padding: '2px 8px', borderRadius: 8, background: 'linear-gradient(135deg, #f5efe4, #efe5d5)' }}>
                  <span style={{ fontSize: 9, color: '#b89870', fontWeight: 600 }}>{group.tag}</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 12, paddingLeft: 2, paddingRight: 2 }}>
                  {group.items.map((item, i) => (
                    <div key={item.name} style={{
                      width: 130, flexShrink: 0, background: theme.bgCard, borderRadius: 14,
                      overflow: 'hidden', position: 'relative',
                      border: `1px solid ${theme.borderLight}`,
                      boxShadow: `0 2px 6px ${theme.shadow}`,
                    }}>
                      <div style={{
                        position: 'absolute', top: 6, left: 6, zIndex: 2,
                        width: 20, height: 20, borderRadius: '50%',
                        background: i === 0 ? 'linear-gradient(135deg, #e05a5a, #d04040)' : i === 1 ? `linear-gradient(135deg, ${theme.accent}, #c4956a)` : '#d0c8b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                      </div>
                      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
                        <div style={{ width: '100%', height: '100%', maxWidth: 100 }}>
                          <BeadPreviewRing beads={item.idx.map((i: number) => { const p = BEAD_PRODUCTS[i]; return p ? { ...p } : null }).filter(Boolean) as any[]} ropeColor={item.rope} onRemove={() => {}} compact stagger />
                        </div>
                      </div>
                      <div style={{ padding: '2px 10px 10px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{item.name}</span>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: theme.textSecondary }}>{item.desc}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>{item.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== 底部 ===== */}
        <div style={{ padding: '20px 0 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: theme.textDisabled, letterSpacing: 4 }}>指尖流转 好运自来</div>
        </div>
      </div>
    </div>
  )
}