import { useEffect, useRef } from 'react'

export default function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let running = true
      let pos = { x: -999, y: -999 }
      const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }[] = []
      let lastBurst = 0
      const COLORS = ['rgba(212,165,116,0.35)', 'rgba(196,149,106,0.30)', 'rgba(232,210,180,0.25)', 'rgba(255,220,180,0.20)']

      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
      resize()
      window.addEventListener('resize', resize)

      const onMove = (e: MouseEvent | TouchEvent) => {
        let x: number, y: number
        if ('touches' in e) {
          const t = e.touches[0] || (e as any).changedTouches?.[0]
          if (!t) return
          x = t.clientX; y = t.clientY
        } else {
          x = e.clientX; y = e.clientY
        }
        pos = { x, y }

        const now = Date.now()
        if (now - lastBurst > 80) {
          lastBurst = now
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 0.5 + Math.random() * 1.5
            particles.push({
              x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.5,
              life: 0, maxLife: 30 + Math.random() * 40,
              size: 1.5 + Math.random() * 3,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
            })
          }
        }
      }

      const onLeave = () => { pos = { x: -999, y: -999 } }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('touchmove', onMove)
      window.addEventListener('touchstart', onMove)
      window.addEventListener('mouseleave', onLeave)

      const animate = () => {
        if (!running) return
        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (pos.x > -100) {
            const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 120)
            g.addColorStop(0, 'rgba(212,165,116,0.08)')
            g.addColorStop(0.4, 'rgba(212,165,116,0.04)')
            g.addColorStop(1, 'rgba(212,165,116,0)')
            ctx.fillStyle = g
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const d = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 40)
            d.addColorStop(0, 'rgba(255,220,180,0.12)')
            d.addColorStop(0.5, 'rgba(212,165,116,0.06)')
            d.addColorStop(1, 'rgba(212,165,116,0)')
            ctx.fillStyle = d
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2)
            ctx.fill()
          }

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life++
            if (p.life > p.maxLife) { particles.splice(i, 1); continue }
            const a = 1 - p.life / p.maxLife
            const s = p.size * (0.5 + 0.5 * a)
            ctx.beginPath()
            ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(212,165,116,${(a * 0.35).toFixed(3)})`
            ctx.fill()
          }
        } catch {}
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)

      return () => {
        running = false
        cancelAnimationFrame(0)
        window.removeEventListener('resize', resize)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchstart', onMove)
        window.removeEventListener('mouseleave', onLeave)
      }
    } catch {}
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
