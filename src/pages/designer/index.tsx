import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { playSound } from '@/lib/sound'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import RopeSelector from '@/components/designer/RopeSelector'
import { BEAD_PRODUCTS, BeadProduct } from '@/data/bead-products'
import { getInventory, BeadItem, consumeBead } from '@/lib/inventory'

const COLORS: Record<string, string> = {
  white: '#a0c4ff', purple: '#b388ff', pink: '#ff80ab',
  gold: '#ffd54f', green: '#69f0ae', blue: '#40c4ff',
  jade_green: '#90c890', jade_white: '#d4c8a0',
  wood_root: '#b89870', bark: '#a08860',
  fruit_seed: '#d4a070', fruit_pulp: '#d48860',
  shell: '#a8c8e0', pebble: '#a09888',
  artificial_clay: '#c0a888', artificial_resin: '#d4b898',
}

const MAT_LIST = ['white','purple','pink','gold','green','blue','jade_green','jade_white','wood_root','bark','fruit_seed','fruit_pulp','shell','pebble','artificial_clay','artificial_resin']

export default function DesignerPage() {
  const [inventory, setInventory] = useState<BeadItem[]>([])
  const [selectedBeads, setSelectedBeads] = useState<BeadProduct[]>([])
  const [selectedMeta, setSelectedMeta] = useState<{ id: string; name: string; material: string }[]>([])
  const [ropeColor, setRopeColor] = useState('rgba(180,180,180,0.6)')
  // 记录每种珠子在串珠中已用个数
  const usedCount = useRef<Record<string, number>>({})

  useEffect(() => {
    setInventory(getInventory())
  }, [])

  const getUsed = useCallback((id: string) => usedCount.current[id] || 0, [])

  const addBead = useCallback((item: BeadItem) => {
    if (selectedBeads.length >= 16) {
      Taro.showToast({ title: '最多16颗', icon: 'none' })
      return
    }
    // 校验库存数量
    const used = usedCount.current[item.id] || 0
    if (used >= item.count) {
      Taro.showToast({ title: '库存不足', icon: 'none' })
      return
    }
    playSound('chime1', 0.3)
    const imgIndex = MAT_LIST.indexOf(item.material.replace('_rare', ''))
    const imageUrl = imgIndex >= 0 ? `${imgIndex}.png` : '0.png'
    const beadProduct: BeadProduct = {
      id: item.id,
      name: item.name,
      categoryId: item.material,
      sizeMm: 8,
      price: item.quality === '稀有' ? 3800 : item.quality === '普通' ? 1800 : 800,
      imageUrl,
      type: 'bead',
      _key: `${item.id}_${Date.now()}`,
    }
    setSelectedBeads(prev => [...prev, beadProduct])
    setSelectedMeta(prev => [...prev, { id: item.id, name: item.name, material: item.material }])
    usedCount.current[item.id] = used + 1
  }, [selectedBeads.length])

  const removeBead = useCallback((index: number) => {
    const removed = selectedMeta[index]
    setSelectedBeads(prev => prev.filter((_, i) => i !== index))
    setSelectedMeta(prev => prev.filter((_, i) => i !== index))
    // 释放已用计数
    if (removed) {
      const cur = usedCount.current[removed.id] || 0
      usedCount.current[removed.id] = Math.max(0, cur - 1)
    }
    playSound('click_error', 0.2)
  }, [selectedMeta])

  const clearAll = useCallback(() => {
    setSelectedBeads([])
    setSelectedMeta([])
    usedCount.current = {}
    playSound('whoosh', 0.3)
  }, [])

  const confirmDesign = useCallback(async () => {
    if (selectedBeads.length < 2) {
      Taro.showToast({ title: '至少选2颗珠子', icon: 'none' })
      return
    }
    // 消耗珠子
    for (const m of selectedMeta) {
      await consumeBead(m.id, m.material)
    }
    Taro.showToast({ title: `已串好 ${selectedBeads.length} 颗`, icon: 'success' })
    // 更新库存显示
    setInventory(getInventory())
    setSelectedBeads([])
    setSelectedMeta([])
    usedCount.current = {}
  }, [selectedBeads, selectedMeta])

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

        {/* 顶栏 */}
        <div style={{
          marginBottom: 16, display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <span onClick={() => Taro.navigateBack()} style={{
            fontSize: 16, color: theme.textSecondary, marginRight: 12,
            cursor: 'pointer', touchAction: 'manipulation', padding: '2px 4px',
          }}>‹</span>
          <div style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginRight: 8,
            background: 'linear-gradient(135deg, #d4a574, #c4956a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>串</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>串珠</span>
          <div style={{ flex: 1 }} />
          <div style={{
            padding: '3px 10px', borderRadius: 10,
            background: selectedBeads.length >= 2 ? `${theme.accent}22` : theme.borderLight,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: selectedBeads.length >= 2 ? theme.accent : theme.textDisabled }}>
              {selectedBeads.length}/16
            </span>
          </div>
        </div>

        {/* 预览区域 */}
        <div style={{
          background: theme.bgCard, borderRadius: theme.radiusCard,
          border: `1px solid ${theme.borderLight}`, marginBottom: 16,
          boxShadow: `0 2px 12px ${theme.shadow}`,
        }}>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
            {selectedBeads.length > 0 ? (
              <BeadPreviewRing beads={selectedBeads} ropeColor={ropeColor} onRemove={removeBead} />
            ) : (
              <div style={{ alignItems: 'center', gap: 8, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 36, opacity: 0.15 }}>📿</span>
                <span style={{ fontSize: 12, color: theme.textDisabled }}>点击下方珠子添加到手串</span>
              </div>
            )}
          </div>
          <RopeSelector value={ropeColor} onChange={setRopeColor} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px 12px' }}>
            <span style={{ fontSize: 11, color: selectedBeads.length >= 2 ? theme.accent : theme.textDisabled }}>
              已选 {selectedBeads.length}/16 颗
            </span>
            {selectedBeads.length > 0 && (
              <span onClick={clearAll} onTouchEnd={clearAll} style={{ fontSize: 11, color: '#e05a5a', cursor: 'pointer', touchAction: 'manipulation' }}>
                清空
              </span>
            )}
          </div>
        </div>

        {/* 确认按钮 */}
        <div
          onClick={confirmDesign}
          onTouchEnd={confirmDesign}
          style={{
            padding: '14px 0', borderRadius: theme.radiusBtn, marginBottom: 20, alignItems: 'center',
            background: selectedBeads.length >= 2 ? `linear-gradient(135deg, ${theme.primary}, #c4956a)` : theme.borderLight,
            cursor: selectedBeads.length >= 2 ? 'pointer' : 'default',
            opacity: selectedBeads.length >= 2 ? 1 : 0.5,
            touchAction: 'manipulation',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: selectedBeads.length >= 2 ? '#fff' : theme.textDisabled }}>
            确认串好 {selectedBeads.length > 0 ? `(${selectedBeads.length}颗)` : ''}
          </span>
        </div>

        {/* 珠子库存 */}
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>
          我的珠子 ({inventory.length} 种)
        </span>

        {inventory.length === 0 ? (
          <div style={{
            padding: 40, alignItems: 'center', background: theme.bgCard,
            borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`,
          }}>
            <span style={{ fontSize: 12, color: theme.textDisabled, textAlign: 'center' }}>
              还没有珠子，先去采集加工吧
            </span>
            <div
              onClick={() => Taro.navigateBack()}
              style={{
                marginTop: 12, padding: '8px 24px', borderRadius: 20,
                background: theme.primary, cursor: 'pointer', touchAction: 'manipulation',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>返回首页</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {inventory.map((item, i) => {
              const color = COLORS[item.material] || '#a0c4ff'
              const used = usedCount.current[item.id] || 0
              const remain = item.count - used
              return (
                <div
                  key={item.id}
                  onClick={() => addBead(item)}
                  onTouchEnd={() => addBead(item)}
                  style={{
                    width: 'calc(33.33% - 6px)', padding: '14px 6px 10px',
                    background: theme.bgCard, borderRadius: 12,
                    border: `1px solid ${theme.borderLight}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4, cursor: 'pointer', touchAction: 'manipulation',
                    opacity: remain > 0 ? 1 : 0.35,
                    boxShadow: remain > 0 ? `0 2px 6px ${theme.shadow}` : 'none',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 30%, ${color}88, ${color})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 2px 8px ${color}44`,
                  }}>
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: theme.textPrimary, textAlign: 'center', lineHeight: 1.2 }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 9, color: theme.textSecondary }}>
                    {item.quality} · {remain > 0 ? `剩余 ${remain}` : '已用完'}
                  </span>
                  {used > 0 && (
                    <div style={{
                      padding: '1px 6px', borderRadius: 6,
                      background: `${theme.accent}33`,
                    }}>
                      <span style={{ fontSize: 8, color: theme.accent, fontWeight: 600 }}>
                        已选 {used}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
