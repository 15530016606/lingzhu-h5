import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { BeadProduct, BEAD_PRODUCTS, getProductsByCategory, getCategories } from '../../data/bead-products'
import MaterialCard from './MaterialCard'
import CategorySidebar from './CategorySidebar'
import RopeSelector from './RopeSelector'
import { useBeadStore } from '@/lib/store'

interface Props {
  onAddBead: (product: BeadProduct) => void
  onSlideChange?: (pct: number) => void
  defaultPct?: number    // 默认展开百分比（0=全展开，100=全收起）
}

type TabType = 'beads' | 'accessories'

const PANEL_H = 400
const HANDLE_H = 36

export default function MaterialPanel({ onAddBead, onSlideChange, defaultPct = 100 }: Props) {
  const { ropeColor, setRopeColor } = useBeadStore()
  const [activeTab, setActiveTab] = useState<TabType>('beads')
  const [activeCategory, setActiveCategory] = useState('all')
  const contentRef = useRef<HTMLDivElement>(null)

  const [slidePct, setSlidePct] = useState(defaultPct)
  const dragState = useRef({ active: false, startY: 0, startPct: defaultPct, totalDy: 0 })
  const slidePctRef = useRef(slidePct)
  slidePctRef.current = slidePct
  const maxSlidePx = PANEL_H - HANDLE_H

  // 面板最高露出不超过视口 48%，保证手串完整可见
  const minSlidePct = useMemo(() => {
    const maxVisible = window.innerHeight * 0.43
    const minSlidePx = Math.max(0, PANEL_H - maxVisible)
    return (minSlidePx / maxSlidePx) * 100
  }, [])

  // 通知父级面板状态变化
  useEffect(() => {
    onSlideChange?.(slidePct)
  }, [slidePct, onSlideChange])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const handleEl = el.querySelector('.panel-handle') as HTMLElement
    if (!handleEl) return

    const onDown = (e: PointerEvent) => {
      dragState.current = { active: true, startY: e.clientY, startPct: slidePctRef.current, totalDy: 0 }
      handleEl.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragState.current.active) return
      const dy = e.clientY - dragState.current.startY
      dragState.current.totalDy += Math.abs(dy)
      const deltaPct = (dy / maxSlidePx) * 100
      const newPct = Math.max(minSlidePct, Math.min(100, dragState.current.startPct + deltaPct))
      setSlidePct(newPct)
    }

    const onUp = () => {
      dragState.current.active = false
    }

    handleEl.addEventListener('pointerdown', onDown)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      handleEl.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [minSlidePct])

  const contentVisible = slidePct < 85
  const maxSlide = PANEL_H - HANDLE_H
  const slidePx = (slidePct / 100) * maxSlide

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setActiveCategory('all')
    if (slidePct > 50) setSlidePct(0)
  }

  const categories = useMemo(() => getCategories(activeTab === 'accessories' ? 'accessory' : 'bead'), [activeTab])
  const products = useMemo(() => getProductsByCategory(activeCategory, activeTab === 'accessories' ? 'accessory' : 'bead'), [activeCategory, activeTab])
  const totalCount = activeTab === 'beads'
    ? BEAD_PRODUCTS.filter(p => p.type === 'bead').length
    : BEAD_PRODUCTS.filter(p => p.type === 'accessory').length

  return (
    <View
      ref={contentRef}
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 120,
        height: PANEL_H,
        transform: `translateY(${slidePx}px)`,
        transition: dragState.current.active ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e8e8e8',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        touchAction: 'none',
      }}
    >
      {/* 把手 */}
      <View
        className="panel-handle"
        onClick={() => {
          // 拖拽距离小于 5px 才算点击（切换展开/收起），否则忽略
          if (dragState.current.totalDy < 5) {
            setSlidePct(slidePct > 50 ? minSlidePct : 100)
          }
        }}
        style={{
          height: HANDLE_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', flexShrink: 0, touchAction: 'none',
        }}
      >
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#c8c8c8' }} />
      </View>

      {contentVisible && (
        <>
          {/* 绳色选择 */}
          <View style={{
            padding: '2px 14px 8px', flexShrink: 0,
            animation: 'panelFadeIn 0.2s ease-out',
          }}>
            <RopeSelector value={ropeColor} onChange={setRopeColor} />
          </View>

          {/* 标签栏 */}
          <View style={{
            display: 'flex', alignItems: 'center', padding: '0 12px 8px', gap: 10, flexShrink: 0,
          }}>
            <View style={{ display: 'flex', gap: 8 }}>
              <View onClick={() => handleTabChange('beads')}
                style={{
                  padding: '4px 12px', fontSize: 13,
                  color: activeTab === 'beads' ? '#000' : '#999',
                  backgroundColor: activeTab === 'beads' ? '#ffffff' : '#f9f9f9',
                  border: '1px solid #e0e0e0', borderRadius: 14, cursor: 'pointer',
                }}>珠子</View>
              <View onClick={() => handleTabChange('accessories')}
                style={{
                  padding: '4px 12px', fontSize: 13,
                  color: activeTab === 'accessories' ? '#000' : '#999',
                  backgroundColor: activeTab === 'accessories' ? '#ffffff' : '#f9f9f9',
                  border: '1px solid #e0e0e0', borderRadius: 14, cursor: 'pointer',
                }}>配饰</View>
            </View>
            <View style={{
              marginLeft: 'auto', padding: '4px 10px', backgroundColor: '#f7f7f8',
              border: '1px solid #e4e4e7', borderRadius: 14, fontSize: 12, color: '#6b7280',
            }}>
              <Text style={{ fontSize: 11 }}>筛选 {totalCount}</Text>
            </View>
          </View>

          {/* 分类 + 网格 */}
          <View style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <CategorySidebar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
            <View style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 6px' }}>
              <View className="materials-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
              }}>
                {products.map((p) => (
                  <MaterialCard key={`${p.id}-${p.sizeMm}`} product={p} onSelect={onAddBead} compact />
                ))}
              </View>
              <View style={{ height: 12 }} />
            </View>
          </View>
        </>
      )}
    </View>
  )
}
