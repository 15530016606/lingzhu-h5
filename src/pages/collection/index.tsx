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
      {/* 顶栏 */}
      <div style={{
        padding: '14px 16px', background: theme.bgCard,
        borderBottom: `1px solid ${theme.borderLight}`,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}>
        <span onClick={() => Taro.navigateBack()} style={{
          fontSize: 16, color: theme.textSecondary, marginRight: 12,
          cursor: 'pointer', touchAction: 'manipulation',
        }}>‹</span>
        <div style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginRight: 8,
          background: 'linear-gradient(135deg, #a0c4ff, #b388ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>鉴</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>图鉴</span>
        <div style={{ flex: 1 }} />
        <div style={{
          padding: '3px 10px', borderRadius: 10,
          background: collectedCount >= 8 ? '#69f0ae22' : `${theme.accent}22`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: collectedCount >= 8 ? '#69f0ae' : theme.accent }}>
            已收集 {collectedCount}/16
          </span>
        </div>
      </div>

      {/* 进展条 */}
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>收集进度</span>
          <span style={{ fontSize: 10, color: theme.textSecondary }}>{collectedCount}/16 种原料类型</span>
        </div>
        <div style={{
          width: '100%', height: 6, borderRadius: 3,
          background: theme.borderLight, overflow: 'hidden',
        }}>
          <div style={{
            width: `${(collectedCount / 16) * 100}%`, height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, #a0c4ff, #b388ff, #ff80ab, #ffd54f)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px 20px' }}>
        {collectedCount === 0 && (
          <div style={{
            padding: 50, borderRadius: 16, textAlign: 'center',
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 36, opacity: 0.1, marginBottom: 8 }}>📕</div>
            <div style={{ fontSize: 13, color: theme.textDisabled, marginBottom: 4 }}>
              还没有收集到珠子
            </div>
            <div style={{ fontSize: 11, color: theme.textSecondary }}>
              先去采集源获取原料 → 加工成珠子
            </div>
            <div onClick={() => Taro.navigateBack()} style={{
              marginTop: 14, padding: '8px 24px', borderRadius: 16,
              background: `linear-gradient(135deg, ${theme.primary}, #c4956a)`,
              display: 'inline-block', cursor: 'pointer', touchAction: 'manipulation',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>返回首页</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALL_MATERIALS.map(material => {
            const info = MATERIAL_INFO[material] || { label: material, color: '#999', bg: '#eee' }
            const collected = collectedByMaterial[material] || []
            const totalBeads = collected.reduce((s, b) => s + b.count, 0)
            const hasIt = collected.length > 0

            return (
              <div key={material} style={{
                padding: '14px', borderRadius: 14,
                background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
                opacity: hasIt ? 1 : 0.5,
                boxShadow: hasIt ? `0 2px 6px ${theme.shadow}` : 'none',
              }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {/* 色球 */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: hasIt
                      ? `radial-gradient(circle at 35% 30%, ${info.bg}, ${info.color})`
                      : '#e8e4e0',
                    boxShadow: hasIt ? `0 2px 8px ${info.color}44` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {hasIt ? (
                      <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{info.label.charAt(0)}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: '#c0b8a8' }}>?</span>
                    )}
                  </div>
                  {/* 名称+统计 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: hasIt ? theme.textPrimary : theme.textDisabled }}>
                        {info.label}
                      </span>
                      {totalBeads > 0 && (
                        <span style={{ fontSize: 11, color: info.color, fontWeight: 600 }}>{totalBeads} 颗</span>
                      )}
                      {!hasIt && (
                        <span style={{ fontSize: 9, color: '#c0b8a0' }}>未收集</span>
                      )}
                    </div>
                    {hasIt && (
                      <div style={{ display: 'flex', flexDirection: 'row', gap: 4, marginTop: 4 }}>
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
                  {/* 展开箭头 */}
                  {hasIt && (
                    <span style={{ fontSize: 14, color: theme.border, fontWeight: 300 }}>▸</span>
                  )}
                </div>
                {/* 珠子列表 */}
                {collected.length > 0 && (
                  <div style={{
                    display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6,
                    marginTop: 10, paddingTop: 10,
                    borderTop: `1px solid ${theme.borderLight}`,
                  }}>
                    {collected.map(item => (
                      <div key={item.id} style={{
                        padding: '4px 10px', borderRadius: 10,
                        background: theme.bgPage,
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: 3,
                          background: QUALITY_COLORS[item.quality] || '#999',
                        }} />
                        <span style={{ fontSize: 10, color: theme.textPrimary }}>{item.name}</span>
                        {item.count > 1 && (
                          <span style={{ fontSize: 9, color: theme.textSecondary }}>x{item.count}</span>
                        )}
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
