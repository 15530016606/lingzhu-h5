import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { getInventory, BeadItem } from '@/lib/inventory'
import { ALL_MATERIALS, MATERIAL_INFO } from '@/lib/material-map'

const QUALITY_COLORS: Record<string, string> = { 稀有: '#ffd54f', 普通: '#a0c4ff', 粗糙: '#c4b89e' }

export default function CollectionPage() {
  const [beads, setBeads] = useState<BeadItem[]>([])

  useEffect(() => {
    setBeads(getInventory())
  }, [])

  const collectedByMaterial: Record<string, BeadItem[]> = {}
  beads.forEach(b => {
    if (!collectedByMaterial[b.material]) collectedByMaterial[b.material] = []
    collectedByMaterial[b.material].push(b)
  })

  const collectedCount = new Set(beads.map(i => i.material)).size

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', background: theme.bgCard, borderBottom: `1px solid ${theme.borderLight}`,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
      }}>
        <span onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: theme.textSecondary, marginRight: 12, cursor: 'pointer', touchAction: 'manipulation' }}>‹</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>图鉴</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: theme.textSecondary }}>
          已收录 {collectedCount}/16 种
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALL_MATERIALS.map(material => {
            const info = MATERIAL_INFO[material] || { label: material, color: '#999', bg: '#eee' }
            const collected = collectedByMaterial[material] || []
            const totalBeads = collected.reduce((s, b) => s + b.count, 0)

            return (
              <div key={material} style={{
                padding: '12px', borderRadius: 14,
                background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
                opacity: collected.length > 0 ? 1 : 0.45,
              }}>
                {/* 类型行 */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {/* 色球 */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: collected.length > 0
                      ? `radial-gradient(circle at 35% 30%, ${info.bg}, ${info.color})`
                      : '#e0ddd8',
                    boxShadow: collected.length > 0 ? `0 2px 8px ${info.color}44` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {collected.length > 0 ? (
                      <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                        {info.label.charAt(0)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 14, color: '#c0b8a8' }}>?</span>
                    )}
                  </div>
                  {/* 名称 + 统计 */}
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: collected.length > 0 ? theme.textPrimary : theme.textDisabled }}>
                      {info.label}
                    </span>
                    {collected.length > 0 && (
                      <span style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 6 }}>
                        {totalBeads} 颗
                      </span>
                    )}
                    {collected.length === 0 && (
                      <div style={{ fontSize: 10, color: theme.textDisabled, marginTop: 2 }}>
                        未收录
                      </div>
                    )}
                  </div>
                  {/* 品质分布 */}
                  {collected.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                      {['稀有', '普通', '粗糙'].map(q => {
                        const cnt = collected.filter(b => b.quality === q).reduce((s, b) => s + b.count, 0)
                        return cnt > 0 ? (
                          <div key={q} style={{
                            padding: '1px 6px', borderRadius: 6,
                            background: (QUALITY_COLORS[q] || '#999') + '33',
                          }}>
                            <span style={{ fontSize: 8, color: QUALITY_COLORS[q] || '#999', fontWeight: 600 }}>
                              {cnt}{q === '稀有' ? '★' : q === '普通' ? '●' : '○'}
                            </span>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
                {/* 已收集的珠子列表 */}
                {collected.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.borderLight}` }}>
                    {collected.map(item => (
                      <div key={item.id} style={{
                        padding: '4px 8px', borderRadius: 8,
                        background: theme.bgPage,
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{ fontSize: 10, color: theme.textPrimary }}>{item.name}</span>
                        <span style={{ fontSize: 9, color: QUALITY_COLORS[item.quality] || '#999' }}>{item.quality}</span>
                        <span style={{ fontSize: 9, color: theme.textSecondary }}>x{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
