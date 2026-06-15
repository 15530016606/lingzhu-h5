import { useRef, useState, useEffect, useCallback } from 'react'
import { View, Image } from '@tarojs/components'
import { BeadProduct } from '../../data/bead-products'

interface Props {
  beads: BeadProduct[]
  ropeColor: string
  onRemove: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  compact?: boolean      // 紧凑模式：珠子缩小
}

const ROPE_WIDTH = 3
const ORBIT_RATIO = 0.32

function beadSizeFromProduct(p: BeadProduct, compact?: boolean): number {
  const mm = p.sizeMm || 6
  if (compact) {
    // 紧凑模式：适应 16 颗在 110px 小容器不重叠
    if (mm <= 6) return 12
    if (mm <= 8) return 14
    if (mm <= 10) return 16
    return 18
  }
  if (mm <= 6) return 33
  if (mm <= 8) return 44
  if (mm <= 10) return 50
  return 56
}

function shadowFromAngle(angle: number, base: number, compact?: boolean) {
  const s = Math.abs(Math.sin(angle))
  if (compact) {
    return `${(2 + s * 2).toFixed(2)}px ${(2 + s * 3).toFixed(2)}px ${(3 + s * 3).toFixed(2)}px rgba(0,0,0,${(base * 0.5).toFixed(3)})`
  }
  return `${(6 + s * 5.33).toFixed(2)}px ${(6 + s * 8).toFixed(2)}px ${(8 + s * 7.6).toFixed(2)}px rgba(0,0,0,${base.toFixed(3)})`
}

function highlightProps(angle: number, beadSize: number) {
  return {
    dotW: beadSize * 0.147,
    dotH: beadSize * 0.099,
    dotRotation: -(angle * 180) / Math.PI - 128,
    dotX: -(beadSize * 0.155),
    dotY: -(beadSize * 0.199),
    alpha: 0.955,
  }
}

/** 环形拖拽：全部监听器挂在 ring 上，不需要 document 级事件 */
export default function BeadPreviewRing({ beads, ropeColor, onRemove, onReorder, compact }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 375, h: 400 })
  const dragRef = useRef({ index: -1, active: false, startX: 0, startY: 0 })
  const beadsRef = useRef(beads)
  beadsRef.current = beads
  const removingRef = useRef<Set<number>>(new Set())
  // 配饰旋转偏移量（每次点击 +45deg）
  const rotationOffsets = useRef<Map<number, number>>(new Map())

  const handleAccessoryRotate = useCallback((index: number) => {
    const current = rotationOffsets.current.get(index) || 0
    rotationOffsets.current.set(index, current + 45)
    // 强制刷新（通过更新一个计数器）
    setRotateTick(t => t + 1)
  }, [])
  const [rotateTick, setRotateTick] = useState(0)

  // 触发移除动画，延迟执行
  const handleRemoveWithAnim = useCallback((index: number) => {
    if (dragRef.current.active) return
    if (removingRef.current.has(index)) return
    removingRef.current.add(index)
    const ring = ringRef.current
    if (ring) {
      const bead = ring.querySelector(`.bead-item[data-index="${index}"]`) as HTMLElement
      if (bead) {
        bead.classList.add('removing')
        bead.style.transition = 'none'
        bead.style.animation = 'none'
      }
    }
    setTimeout(() => {
      removingRef.current.delete(index)
      onRemove(index)
    }, 250)
  }, [onRemove])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) setDims({ w: rect.width, h: rect.height })
    }
    measure()
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) setDims({ w: width, h: height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 自适应计算已完成（见下面的 render 逻辑）

  // 全部原生 pointer events 挂在 ring 上 + document 用于 move/up
  useEffect(() => {
    const ring = ringRef.current
    if (!ring || beads.length < 2) return

    const getBeadByIndex = (idx: number): HTMLElement | null =>
      ring.querySelector(`.bead-item[data-index="${idx}"]`) as HTMLElement

    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest('.bead-item') as HTMLElement
      if (!target) return
      const idx = parseInt(target.dataset.index || '-1', 10)
      if (idx < 0) return
      dragRef.current = { index: idx, active: true, startX: e.clientX, startY: e.clientY }
      target.classList.add('dragging')
      target.style.transition = 'none'
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return
      const idx = dragRef.current.index
      const bead = getBeadByIndex(idx)
      if (!bead) return
      const ringRect = ring.getBoundingClientRect()
      const cx = ringRect.left + ringRect.width / 2
      const cy = ringRect.top + ringRect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      bead.style.transform = `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(0deg)`
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!dragRef.current.active) return
      const fromIdx = dragRef.current.index
      const bead = getBeadByIndex(fromIdx)
      if (bead) {
        bead.classList.remove('dragging')
        bead.style.transition = ''
        bead.style.transform = ''
      }
      dragRef.current = { index: -1, active: false, startX: 0, startY: 0 }

      // 计算目标位置
      const ringRect = ring.getBoundingClientRect()
      const cx = ringRect.left + ringRect.width / 2
      const cy = ringRect.top + ringRect.height / 2
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
      const count = beadsRef.current.length
      let targetIdx = Math.round(((angle + Math.PI / 2) / (Math.PI * 2)) * count)
      targetIdx = ((targetIdx % count) + count) % count

      if (targetIdx !== fromIdx && onReorder) {
        onReorder(fromIdx, targetIdx)
      }
    }

    ring.addEventListener('pointerdown', onPointerDown)
    // move/up 挂 document 上，即使用户拖出 ring 区域也能继续
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)

    return () => {
      ring.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }, [onReorder, beads.length]) // beads.length 变化时重建监听器

  // 自适应：根据珠子数量和容器大小计算轨道半径和缩放
  const count = beads.length
  const minDim = Math.min(dims.w, dims.h)
  const avgBeadSize = count > 0
    ? beads.reduce((s, b) => s + beadSizeFromProduct(b, compact), 0) / count
    : 33

  // 需要的最小轨道周长 = 珠子直径总和 × 1.3（30%间距）
  const neededCirc = count > 0 ? count * avgBeadSize * 1.3 : 0
  const idealOrbitR = neededCirc / (2 * Math.PI)

  // 容器允许的最大轨道半径
  const maxOrbitByContainer = minDim * 0.38
  const maxOrbitGlobal = compact ? 100 : 140

  // 实际轨道半径：取三者中的合理值
  const orbitR = count > 1
    ? Math.min(maxOrbitGlobal, Math.max(idealOrbitR, 50), maxOrbitByContainer)
    : Math.min(maxOrbitGlobal, maxOrbitByContainer * 0.6)

  const ropeSize = orbitR * 2
  const neededTotal = ropeSize + ROPE_WIDTH * 2 + (compact ? 36 : 56)
  const maxFit = Math.min(dims.w, dims.h)
  const scale = neededTotal > 0 && maxFit > 0 ? Math.min(1, maxFit / neededTotal * 0.92) : 1

  return (
    <View
      ref={containerRef}
      className="bracelet-preview"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        transformOrigin: 'center center',
        willChange: 'transform',
        transform: `rotate(0deg) scale(${scale.toFixed(4)})`,
      }}
    >
      <View className="rope-circle" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: ropeSize, height: ropeSize, borderRadius: '50%',
        border: `${ROPE_WIDTH}px solid ${ropeColor}`,
        transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        boxSizing: 'content-box', zIndex: 1,
      }} />

      <View
        ref={ringRef}
        className={`bracelet-ring${count > 0 ? ' has-beads' : ''}`}
        style={{
          position: 'relative', width: '100%', height: '100%',
          maxWidth: '100%', maxHeight: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'none',
        }}
      >
        {beads.map((bead, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2
          const bx = Math.cos(angle) * orbitR
          const by = Math.sin(angle) * orbitR
          const rotation = (angle * 180) / Math.PI
          const isNew = i === count - 1 && count >= 1
          const bSize = beadSizeFromProduct(bead, compact)
          const hl = highlightProps(angle, bSize)

          const cssVars = {
            '--bead-x': `${bx.toFixed(4)}px`,
            '--bead-y': `${by.toFixed(4)}px`,
            '--bead-rotation': `${rotation.toFixed(2)}deg`,
            '--bead-shadow': shadowFromAngle(angle, 0.31, compact),
            '--bead-shadow-hover': shadowFromAngle(angle, 0.35, compact),
            '--bead-shadow-drag': shadowFromAngle(angle, 0.38, compact),
            '--bead-highlight-dot-width': `${hl.dotW.toFixed(2)}px`,
            '--bead-highlight-dot-height': `${hl.dotH.toFixed(2)}px`,
            '--bead-highlight-dot-rotation': `${hl.dotRotation.toFixed(2)}deg`,
            '--bead-highlight-dot-x': `${hl.dotX.toFixed(2)}px`,
            '--bead-highlight-dot-y': `${hl.dotY.toFixed(2)}px`,
            '--bead-highlight-dot-alpha': `${hl.alpha}`,
          }

          return (
            <View
              key={bead._key || bead.id}
              className={`bead-item${isNew ? ' bead-adding bead-fly-in' : ''}${bead.type === 'accessory' ? ' bead-accessory' : ''}`}
              data-index={i}
              style={{
                position: 'absolute', width: bSize, height: bSize,
                top: '50%', left: '50%',
                borderRadius: bead.type === 'accessory' ? '4px' : '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab',
                overflow: bead.type === 'accessory' ? 'visible' : 'hidden',
                transform: `translate(-50%, -50%) translate(${bx.toFixed(4)}px, ${by.toFixed(4)}px) rotate(${(rotation + (rotationOffsets.current.get(i) || 0)).toFixed(2)}deg)`,
                zIndex: isNew ? 100 : i + 2,
                boxShadow: bead.type === 'accessory' ? 'none' : cssVars['--bead-shadow'],
                transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s, opacity 0.24s',
                touchAction: 'none', transformOrigin: 'center center',
                marginLeft: 0, marginTop: 0, willChange: 'transform', userSelect: 'none',
                ...cssVars,
              } as any}
              onClick={() => {
                if (bead.type === 'accessory') {
                  handleAccessoryRotate(i)
                } else {
                  handleRemoveWithAnim(i)
                }
              }}
            >
              <View className="bead-light-layer" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                borderRadius: 'inherit', zIndex: 2,
              }}>
                <View className="bead-highlight-dot" style={{
                  position: 'absolute', left: '50%', top: '50%', borderRadius: '50%',
                  pointerEvents: 'none',
                  width: 'var(--bead-highlight-dot-width, 11px)',
                  height: 'var(--bead-highlight-dot-height, 6px)',
                  transform: 'translate(-50%,-50%) translate(var(--bead-highlight-dot-x, -6px),var(--bead-highlight-dot-y, -6px)) rotate(var(--bead-highlight-dot-rotation, 0deg))',
                  background: 'radial-gradient(ellipse at center,rgba(255,255,255,var(--bead-highlight-dot-alpha,.95)) 0% 58%,rgba(255,255,255,calc(var(--bead-highlight-dot-alpha,.95) * .36)) 84%,#fff0)',
                  filter: 'blur(0.1px)', boxShadow: 'rgba(255,255,255,0.28) 0px 0px 0.9px',
                }} />
              </View>
              <Image
                src={`/images/beads/${bead.imageUrl}`}
                mode="aspectFit"
                style={{
                  width: '100%', height: '100%', objectFit: 'contain',
                  borderRadius: bead.type === 'accessory' ? 0 : '50%',
                  position: 'relative', zIndex: 1,
                  pointerEvents: 'none',
                  backgroundColor: bead.type === 'accessory' ? 'transparent' : '#f5f5f5',
                }}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}
