import { useCallback, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { theme } from '@/lib/theme'
import { preloadSounds, resumeAudio } from '@/lib/sound'
import { getGemCount, getScrapCount, getBackpack } from '@/lib/backpack'
import { getInventory } from '@/lib/inventory'
import { ALL_MATERIALS, MATERIAL_INFO } from '@/lib/material-map'
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

  // 实时数据
  const gemCount = getGemCount()
  const scrapCount = getScrapCount()
  const backpack = getBackpack()
  const gemTypes = backpack.filter(i => i.type === 'gem').length
  const beadInv = getInventory()
  const beadTotal = beadInv.reduce((s, i) => s + i.count, 0)
  const beadTypes = beadInv.length
  const collectedTypes = new Set(beadInv.map(i => i.material))
  const collectedCount = collectedTypes.size

  useEffect(() => {
    preloadSounds()
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

        {/* ===== 顶部品牌 ===== */}
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, letterSpacing: 1 }}>灵珠手作</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: theme.textSecondary, letterSpacing: 2 }}>从一颗原石开始</span>
        </div>

        {/* ===== 每日盲盒 — 大卡片 ===== */}
        <div
          onClick={claim}
          style={{
            marginBottom: 14, padding: '18px 20px', borderRadius: 20,
            background: 'linear-gradient(135deg, #e8d5b8, #d4a574)',
            boxShadow: '0 4px 20px rgba(212,165,116,0.35)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
                {cl?.success ? '今日已领取' : loading ? '领取中...' : '今日盲盒'}
              </span>
              <div style={{ height: 4 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                {cl?.success
                  ? `获得 ${cl?.items?.length || 0} 种原料`
                  : '每日签到领取随机原料 可加工成珠子'
                }
              </span>
            </div>
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 26, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                {cl?.success ? '🎁' : '🎀'}
              </span>
            </div>
          </div>
          {/* 盲盒预览原料 */}
          {cl?.items && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {cl.items.map((it: any, i: number) => {
                const info = MATERIAL_INFO[it.id] || { label: it.name, color: '#999', bg: '#eee' }
                return (
                  <div key={i} style={{
                    padding: '3px 8px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.25)',
                  }}>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{info.label} x{it.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== 统计行 ===== */}
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 14,
          background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>{gemCount}</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>原料</span>
          </div>
          <div style={{ width: 1, height: 28, background: theme.borderLight }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>{beadTotal}</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>珠子</span>
          </div>
          <div style={{ width: 1, height: 28, background: theme.borderLight }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>{collectedCount}/16</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>图鉴</span>
          </div>
          <div style={{ width: 1, height: 28, background: theme.borderLight }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>{scrapCount}</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>废料</span>
          </div>
        </div>

        {/* ===== 快捷入口行 ===== */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <div onClick={() => go('/pages/backpack/index')} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer', touchAction: 'manipulation',
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>🎒</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>背包</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>{gemTypes} 种原料</span>
          </div>
          <div onClick={() => go('/pages/designer/index')} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer', touchAction: 'manipulation',
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>📿</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>串珠</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>{beadTotal} 颗可用</span>
          </div>
          <div onClick={() => go('/pages/collection/index')} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer', touchAction: 'manipulation',
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>📕</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>图鉴</span>
            <span style={{ fontSize: 9, color: theme.textSecondary }}>{collectedCount}/16 种</span>
          </div>
        </div>

        {/* ===== ① 采集源 ===== */}
        <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#d4c8a0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>1</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>采集源</span>
          <span style={{ fontSize: 10, color: theme.textSecondary }}>玩游戏获取原料</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {SOURCES.map(src => (
            <div key={src.id} onClick={() => go(`/pages/scene/index?source=${src.id}`)} style={{
              width: 'calc(33.33% - 7px)', padding: '14px 8px 10px',
              background: theme.bgCard, borderRadius: theme.radiusCard,
              border: `1px solid ${theme.borderLight}`, cursor: 'pointer',
              boxShadow: `0 2px 8px ${theme.shadow}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              touchAction: 'manipulation',
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <img src={src.gif} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, textAlign: 'center' }}>{src.name}</span>
            </div>
          ))}
        </div>

        {/* ===== ② 加工入口 ===== */}
        <div onClick={() => go('/pages/backpack/index')} style={{
          marginBottom: 12, padding: 0, borderRadius: 16, overflow: 'hidden',
          background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
          boxShadow: `0 2px 8px ${theme.shadow}`, cursor: 'pointer', touchAction: 'manipulation',
          display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 22, height: 22, borderRadius: '50%', background: '#d4c8a0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>2</span>
          </div>
          <div style={{ width: 130, minHeight: 130, flexShrink: 0, overflow: 'hidden', background: '#f0e8d8' }}>
            <img src="/images/home/thumb_workshop-illustration.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>背包加工</span>
            <span style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.7 }}>
              {gemTypes > 0
                ? `背包里有 ${gemTypes} 种原料可加工`
                : '背包里还没有原料'
              }
            </span>
            <div style={{
              marginTop: 6, padding: '3px 10px', borderRadius: 10, alignSelf: 'flex-start',
              background: gemTypes > 0 ? `${theme.accent}22` : theme.borderLight,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: gemTypes > 0 ? theme.accent : theme.textDisabled }}>
                {gemTypes > 0 ? `${gemCount} 个原料待加工 →` : '先去采集'}
              </span>
            </div>
          </div>
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, color: '#d4c8a0' }}>›</span>
          </div>
        </div>

        {/* ===== ③ 串珠入口 ===== */}
        <div onClick={() => go('/pages/designer/index')} style={{
          marginBottom: 0, padding: 0, borderRadius: 16, overflow: 'hidden',
          background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
          boxShadow: `0 2px 8px ${theme.shadow}`, cursor: 'pointer', touchAction: 'manipulation',
          display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 22, height: 22, borderRadius: '50%', background: '#d4c8a0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>3</span>
          </div>
          <div style={{ width: 130, minHeight: 130, flexShrink: 0, overflow: 'hidden', background: '#f0e8d8' }}>
            <img src="/images/home/thumb_bead-stringing-icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>开始串珠</span>
            <span style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.7 }}>
              {beadTotal > 0
                ? `已有 ${beadTotal} 颗珠子可串成手串`
                : '先采集加工获得珠子吧'
              }
            </span>
            <div style={{
              marginTop: 6, padding: '3px 10px', borderRadius: 10, alignSelf: 'flex-start',
              background: beadTotal > 0 ? `${theme.accent}22` : theme.borderLight,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: beadTotal > 0 ? theme.accent : theme.textDisabled }}>
                {beadTotal > 0 ? `${beadTypes} 种珠子` : '暂无珠子'}
              </span>
            </div>
          </div>
          <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, color: '#d4c8a0' }}>›</span>
          </div>
        </div>

        {/* 分隔 */}
        <div style={{ height: 24 }} />

        {/* ===== 手串灵感 ===== */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>手串灵感</span>
          {BRACELETS.map(group => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              <div style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, display: 'flex' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{group.label}</span>
                <div style={{ padding: '1px 6px', borderRadius: theme.radiusTag, background: theme.primaryLight }}>
                  <span style={{ fontSize: 9, color: theme.primaryDark }}>{group.tag}</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 2, paddingRight: 2 }}>
                  {group.items.map((item, i) => (
                    <div key={item.name} style={{ width: 120, flexShrink: 0, background: theme.bgPage, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 4, left: 4, zIndex: 2, width: 18, height: 18, borderRadius: '50%', background: i <= 0 ? '#e05a5a' : i === 1 ? theme.accent : theme.textDisabled, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                      </div>
                      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', height: '100%', maxWidth: 90 }}>
                          <BeadPreviewRing beads={item.idx.map((i: number) => { const p = BEAD_PRODUCTS[i]; return p ? { ...p } : null }).filter(Boolean) as any[]} ropeColor={item.rope} onRemove={() => {}} compact stagger />
                        </div>
                      </div>
                      <div style={{ padding: '2px 6px 6px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>{item.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent }}>{item.score} 分</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== 底部 ===== */}
        <div style={{ padding: '16px 0 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: theme.textDisabled, letterSpacing: 4 }}>指尖流转 好运自来</span>
        </div>
      </div>
    </div>
  )
}
