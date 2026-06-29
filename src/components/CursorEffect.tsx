import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number
  color: string
}

const COLORS = [
  'rgba(212,165,116,0.35)',
  'rgba(196,149,106,0.30)',
  'rgba(232,210,180,0.25)',
  'rgba(255,220,180,0.20)',
]

export default function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pos = useRef({ x: -999, y: -999 })
  const particles = useRef<Particle[]>([])
  const raf = useRef(0)
  const lastBurst = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onPointer = (e: MouseEvent | TouchEvent) => {
      let x: number, y: number
      if ('touches' in e) {
        const t = e.touches[0]
        if (!t) return
        x = t.clientX; y = t.clientY
      } else {
        x = e.clientX; y = e.clientY
        // 鼠标离开窗口时隐藏
        if ((e as MouseEvent).target === canvas) return
      }
      pos.current.x = x
      pos.current.y = y

      const now = Date.now()
      if (now - lastBurst.current > 80) {
        lastBurst.current = now
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 0.5 + Math.random() * 1.5
          particles.current.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            life: 0,
            maxLife: 30 + Math.random() * 40,
            size: 1.5 + Math.random() * 3,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          })
        }
      }
    }

    const onLeave = () => {
      pos.current.x = -999
      pos.current.y = -999
    }

    window.addEventListener('mousemove', onPointer)
    window.addEventListener('touchmove', onPointer)
    window.addEventListener('touchstart', onPointer)
    window.addEventListener('mouseleave', onLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 光标光晕
      const px = pos.current.x
      const py = pos.current.y
      if (px > -100) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 120)
        glow.addColorStop(0, 'rgba(212,165,116,0.08)')
        glow.addColorStop(0.4, 'rgba(212,165,116,0.04)')
        glow.addColorStop(1, 'rgba(212,165,116,0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 小光晕跟随
        const dot = ctx.createRadialGradient(px, py, 0, px, py, 40)
        dot.addColorStop(0, 'rgba(255,220,180,0.12)')
        dot.addColorStop(0.5, 'rgba(212,165,116,0.06)')
        dot.addColorStop(1, 'rgba(212,165,116,0)')
        ctx.fillStyle = dot
        ctx.beginPath()
        ctx.arc(px, py, 40, 0, Math.PI * 2)
        ctx.fill()
      }

      // 粒子更新
      const ps = particles.current
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.life++
        if (p.life > p.maxLife) {
          ps.splice(i, 1)
          continue
        }
        const alpha = 1 - p.life / p.maxLife
        const size = p.size * (0.5 + 0.5 * alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha.toFixed(2)})`)
        ctx.fill()
      }

      raf.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onPointer)
      window.removeEventListener('touchmove', onPointer)
      window.removeEventListener('touchstart', onPointer)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 99999,
      }}
    />
  )
}
