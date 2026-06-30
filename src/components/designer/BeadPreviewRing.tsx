import { useRef, useState, useEffect, useCallback } from 'react'
import { BeadProduct } from '../../data/bead-products'

interface Props {
  beads: BeadProduct[]
  ropeColor: string
  onRemove: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  compact?: boolean      // 紧凑模式：珠子缩小
  stagger?: boolean      // 所有珠子依次入场动画
  static?: boolean       // 纯展示：禁交互、禁动画
}

const ROPE_WIDTH = 3

function beadSizeFromProduct(p: BeadProduct, compact?: boolean): number {
  const mm = p.sizeMm || 6
  if (compact) {
    if (mm <= 6) return 10
    if (mm <= 8) return 12
    if (mm <= 10) return 14
    return 16
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

export default function BeadPreviewRing({ beads, ropeColor, onRemove, onReorder, compact, stagger, static: isStatic }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 375, h: 400 })

  // 自适应
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

  // 计算轨道
  const count = beads.length
  const minDim = Math.min(dims.w, dims.h)
  const avgBeadSize = count > 0
    ? beads.reduce((s, b) => s + beadSizeFromProduct(b, compact), 0) / count
    : 33

  const neededCirc = count > 0 ? count * avgBeadSize * 1.3 : 0
  const idealOrbitR = neededCirc / (2 * Math.PI)
  const maxOrbitByContainer = minDim * 0.38
  const maxOrbitGlobal = compact ? 100 : 140

  const orbitR = count > 1
    ? Math.min(maxOrbitGlobal, Math.max(idealOrbitR, 50), maxOrbitByContainer)
    : Math.min(maxOrbitGlobal, maxOrbitByContainer * 0.6)

  const ropeSize = orbitR * 2
  const neededTotal = ropeSize + ROPE_WIDTH * 2 + (compact ? 36 : 56)
  const maxFit = Math.min(dims.w, dims.h)
  const scale = neededTotal > 0 && maxFit > 0 ? Math.min(1, maxFit / neededTotal * 0.92) : 1

  return (
    <div
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
      <div className="rope-circle" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: ropeSize, height: ropeSize, borderRadius: '50%',
        border: `${ROPE_WIDTH}px solid ${ropeColor}`,
        transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        boxSizing: 'content-box', zIndex: 1,
      }} />

      <div
        ref={ringRef}
        className={`bracelet-ring${count > 0 ? ' has-beads' : ''}`}
        style={{
          position: 'relative', width: '100%', height: '100%',
          maxWidth: '100%', maxHeight: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: isStatic ? 'auto' : 'none',
          pointerEvents: isStatic ? 'none' as any : 'auto',
        }}
      >
        {beads.map((bead, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2
          const bx = Math.cos(angle) * orbitR
          const by = Math.sin(angle) * orbitR
          const rotation = (angle * 180) / Math.PI
          const bSize = beadSizeFromProduct(bead, compact)
          const hl = highlightProps(angle, bSize)

          return (
            <div
              key={bead._key || bead.id}
              data-index={i}
              style={{
                position: 'absolute', width: bSize, height: bSize,
                top: '50%', left: '50%',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                transform: `translate(-50%, -50%) translate(${bx.toFixed(4)}px, ${by.toFixed(4)}px) rotate(${rotation.toFixed(2)}deg)`,
                zIndex: i + 2,
                boxShadow: shadowFromAngle(angle, 0.31, compact),
                touchAction: 'none',
                transformOrigin: 'center center',
                userSelect: 'none',
              } as any}
            >
              <div className="bead-light-layer" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                borderRadius: 'inherit', zIndex: 2,
              }}>
                <div className="bead-highlight-dot" style={{
                  position: 'absolute', left: '50%', top: '50%', borderRadius: '50%',
                  pointerEvents: 'none',
                  width: hl.dotW.toFixed(2) + 'px',
                  height: hl.dotH.toFixed(2) + 'px',
                  transform: `translate(-50%,-50%) translate(${hl.dotX.toFixed(2)}px,${hl.dotY.toFixed(2)}px) rotate(${hl.dotRotation.toFixed(2)}deg)`,
                  background: `radial-gradient(ellipse at center,rgba(255,255,255,${hl.alpha}) 0% 58%,rgba(255,255,255,${(hl.alpha * 0.36).toFixed(3)}) 84%,#fff0)`,
                  filter: 'blur(0.1px)', boxShadow: 'rgba(255,255,255,0.28) 0px 0px 0.9px',
                }} />
              </div>
              <img
                src={`./images/beads/${bead.imageUrl}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'contain',
                  borderRadius: '50%',
                  position: 'relative', zIndex: 1,
                  pointerEvents: 'none',
                  backgroundColor: '#f5f5f5',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
