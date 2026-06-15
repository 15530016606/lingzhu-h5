import { useRef, useState, useEffect, useCallback } from 'react'
import { View, Image } from '@tarojs/components'
import { BeadProduct } from '../../data/bead-products'

interface Props {
  beads: BeadProduct[]
  ropeColor: string
  onRemove: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

const ROPE_WIDTH = 3
const ORBIT_RATIO = 0.32

function beadSizeFromProduct(p: BeadProduct): number {
  const mm = p.sizeMm || 6
  if (mm <= 6) return 33
  if (mm <= 8) return 44
  if (mm <= 10) return 50
  return 56
}

function shadowFromAngle(angle: number, base: number) {
  const s = Math.abs(Math.sin(angle))
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
export default function BeadPreviewRing({ beads, ropeColor, onRemove, onReorder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 375, h: 400 })
  const [scale, setScale] = useState(1)
  const dragRef = useRef({ index: -1, active: false, startX: 0, startY: 0 })
  const beadsRef = useRef(beads)
  beadsRef.current = beads

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

  useEffect(() => {
    const minDim = Math.min(dims.w, dims.h)
    const orbitR2 = Math.min(140, minDim * 0.32)
    const ropeSize = orbitR2 * 2
    const needed = ropeSize + ROPE_WIDTH * 2 + 44
    const maxFit = Math.min(dims.w, dims.h)
    const s = needed > 0 && maxFit > 0 ? Math.min(1, maxFit / needed * 0.92) : 1
    setScale(s)
  }, [dims])

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
  }, [beads.length, onReorder]) // beads.length 变化时重建监听器

  const handleClick = useCallback((e: any, index: number) => {
    if (dragRef.current.active) return
    onRemove(index)
  }, [onRemove])

  const count = beads.length
  const minDim = Math.min(dims.w, dims.h)
  const orbitR = Math.min(140, minDim * ORBIT_RATIO)
  const ropeSize = orbitR * 2

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
          const bSize = beadSizeFromProduct(bead)
          const hl = highlightProps(angle, bSize)

          const cssVars = {
            '--bead-x': `${bx.toFixed(4)}px`,
            '--bead-y': `${by.toFixed(4)}px`,
            '--bead-rotation': `${rotation.toFixed(2)}deg`,
            '--bead-shadow': shadowFromAngle(angle, 0.31),
            '--bead-shadow-hover': shadowFromAngle(angle, 0.35),
            '--bead-shadow-drag': shadowFromAngle(angle, 0.38),
            '--bead-highlight-dot-width': `${hl.dotW.toFixed(2)}px`,
            '--bead-highlight-dot-height': `${hl.dotH.toFixed(2)}px`,
            '--bead-highlight-dot-rotation': `${hl.dotRotation.toFixed(2)}deg`,
            '--bead-highlight-dot-x': `${hl.dotX.toFixed(2)}px`,
            '--bead-highlight-dot-y': `${hl.dotY.toFixed(2)}px`,
            '--bead-highlight-dot-alpha': `${hl.alpha}`,
          }

          return (
            <View
              key={`${bead.id}-${i}`}
              className={`bead-item${isNew ? ' bead-adding bead-fly-in' : ''}`}
              data-index={i}
              style={{
                position: 'absolute', width: bSize, height: bSize,
                top: '50%', left: '50%', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', overflow: 'hidden',
                transform: `translate(-50%, -50%) translate(${bx.toFixed(4)}px, ${by.toFixed(4)}px) rotate(${rotation.toFixed(2)}deg)`,
                zIndex: isNew ? 100 : i + 2,
                boxShadow: cssVars['--bead-shadow'],
                transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s, opacity 0.24s',
                touchAction: 'none', transformOrigin: 'center center',
                marginLeft: 0, marginTop: 0, willChange: 'transform', userSelect: 'none',
                ...cssVars,
              } as any}
              onClick={(e: any) => handleClick(e, i)}
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
                mode="aspectFill"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: '50%', position: 'relative', zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}
