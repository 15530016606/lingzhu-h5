import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { getInventory, BeadItem } from '@/lib/inventory'

const COLORS: Record<string, { bg: string; color: string; label: string }> = {
  white: { bg: '#a0c4ff88', color: '#a0c4ff', label: '水晶' },
  purple: { bg: '#b388ff88', color: '#b388ff', label: '紫晶' },
  pink: { bg: '#ff80ab88', color: '#ff80ab', label: '粉晶' },
  gold: { bg: '#ffd54f88', color: '#ffd54f', label: '发晶' },
  green: { bg: '#69f0ae88', color: '#69f0ae', label: '绿幽灵' },
  blue: { bg: '#40c4ff88', color: '#40c4ff', label: '海蓝宝' },
  jade_green: { bg: '#90c89088', color: '#90c890', label: '翡翠' },
  jade_white: { bg: '#d4c8a088', color: '#d4c8a0', label: '白玉' },
  wood_root: { bg: '#b8987088', color: '#b89870', label: '木料' },
  bark: { bg: '#a0886088', color: '#a08860', label: '树皮' },
  fruit_seed: { bg: '#d4a07088', color: '#d4a070', label: '果种' },
  fruit_pulp: { bg: '#d4886088', color: '#d48860', label: '果肉' },
  shell: { bg: '#a8c8e088', color: '#a8c8e0', label: '贝壳' },
  pebble: { bg: '#a0988888', color: '#a09888', label: '卵石' },
  artificial_clay: { bg: '#c0a88888', color: '#c0a888', label: '黏土' },
  artificial_resin: { bg: '#d4b89888', color: '#d4b898', label: '树脂' },
}

const QUALITY_ORDER = ['稀有', '普通', '粗糙']
const QUALITY_COLORS: Record<string, string> = { 稀有: '#ffd54f', 普通: '#a0c4ff', 粗糙: '#c4b89e' }

export default function CollectionPage() {
  const [beads, setBeads] = useState<BeadItem[]>([])

  useEffect(() => {
    setBeads(getInventory())
  }, [])

  // 按原料类型分组
  const grouped: Record<string, BeadItem[]> = {}
  beads.forEach(b => {
    if (!grouped[b.material]) grouped[b.material] = []
    grouped[b.material].push(b)
  })

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      <div style={{
        padding: '14px 16px', background: theme.bgCard, borderBottom: `1px solid ${theme.borderLight}`,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
      }}>
        <span onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: theme.textSecondary, marginRight: 12, cursor: 'pointer', touchAction: 'manipulation' }}>‹</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>我的珠子图鉴</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: theme.textSecondary }}>共 {beads.reduce((s, b) => s + b.count, 0)} 颗</span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
        {Object.entries(grouped).length === 0 ? (
          <div style={{ padding: 60, alignItems: 'center' }}>
            <span style={{ fontSize: 48, opacity: 0.15 }}>📿</span>
            <span style={{ fontSize: 13, color: theme.textDisabled, textAlign: 'center', marginTop: 12 }}>
              还没有收集到珠子{'\n'}先去采集加工吧
            </span>
          </div>
        ) : (
          Object.entries(grouped).map(([material, items]) => {
            const cfg = COLORS[material] || { bg: '#99999988', color: '#999', label: material }
            return (
              <div key={material} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: cfg.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>{cfg.label}</span>
                  <span style={{ fontSize: 10, color: theme.textSecondary }}>
                    {items.reduce((s, i) => s + i.count, 0)} 颗
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      width: 'calc(33.33% - 6px)', padding: '10px 6px 8px',
                      background: theme.bgCard, borderRadius: 12,
                      border: `1px solid ${theme.borderLight}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 4,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 30%, ${cfg.bg}, ${cfg.color})`,
                        boxShadow: `0 2px 8px ${cfg.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                          {item.name.charAt(0)}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: theme.textPrimary, textAlign: 'center', lineHeight: 1.2 }}>
                        {item.name}
                      </span>
                      <div style={{
                        padding: '1px 6px', borderRadius: 6,
                        background: (QUALITY_COLORS[item.quality] || '#c4b89e') + '33',
                      }}>
                        <span style={{ fontSize: 8, color: QUALITY_COLORS[item.quality] || '#c4b89e', fontWeight: 600 }}>
                          {item.quality}
                        </span>
                      </div>
                      <span style={{ fontSize: 9, color: theme.textSecondary }}>
                        x{item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
