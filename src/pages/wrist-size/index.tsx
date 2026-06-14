import { useState, useEffect, useRef } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { BEAD_SIZES_MM, recommendBeadCount } from '@/lib/data'
import { getH5Canvas } from '@/lib/canvas'

const WRIST_PRESETS = [14, 15, 16, 17, 18, 19, 20]

const WristSizePage = () => {
  const { wristSizeCm, setWristSize, resetBeads } = useBeadStore()
  const [size, setSize] = useState(wristSizeCm)
  const [beadMm, setBeadMm] = useState(8)
  const previewRef = useRef<any>(null)
  const rotRef = useRef(0)

  const recommended = recommendBeadCount(size, beadMm)

  // 预览环
  useEffect(() => {
    let mounted = true
    const animate = () => {
      if (!mounted) return
      const canvas = getH5Canvas('wristPreview')
      if (!canvas) { previewRef.current = requestAnimationFrame(animate); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = 2
      canvas.width = 260 * dpr
      canvas.height = 260 * dpr
      canvas.style.width = '260px'
      canvas.style.height = '260px'
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, 260, 260)
      rotRef.current = (rotRef.current + 0.3) % 360

      const cx = 130, cy = 130
      const rx = 80, ry = 50
      const count = recommended
      const rot = rotRef.current * Math.PI / 180

      // 椭圆轨道线
      ctx.beginPath()
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2 + rot
        const x = cx + Math.cos(a) * rx
        const y = cy + Math.sin(a) * ry
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 珠子占位
      const effective = Math.min(count, 30)
      for (let i = 0; i < effective; i++) {
        const a = (i / effective) * Math.PI * 2 + rot
        const x = cx + Math.cos(a) * rx
        const y = cy + Math.sin(a) * ry
        const z = Math.sin(a)
        const scale = 0.7 + (z + 1) * 0.15
        const r = 7 * scale

        // 珠子阴影
        ctx.beginPath()
        ctx.arc(x + 1, y + 2, r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.fill()

        // 珠子
        const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x, y, r)
        grad.addColorStop(0, '#FF6B6B')
        grad.addColorStop(0.5, '#E06060')
        grad.addColorStop(1, '#8B3A3A')
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // 高光
        const hl = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x - r * 0.2, y - r * 0.3, r * 0.5)
        hl.addColorStop(0, 'rgba(255,255,255,0.4)')
        hl.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = hl
        ctx.fill()
      }

      previewRef.current = requestAnimationFrame(animate)
    }
    previewRef.current = requestAnimationFrame(animate)
    return () => { mounted = false; if (previewRef.current) cancelAnimationFrame(previewRef.current) }
  }, [size, beadMm])

  const confirm = () => {
    setWristSize(size)
    resetBeads()
    Taro.navigateTo({ url: '/pages/bead-shop/index' })
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-2">选手腕</Text>
      <Text className="block text-base text-[#8B6B6B] mb-6">帮你推荐合适的珠子数量和尺寸</Text>

      {/* 预览环 */}
      <View className="flex items-center justify-center mb-6">
        <Canvas id="wristPreview" type="2d" style={{ width: '260px', height: '260px' }} />
      </View>

      {/* 推荐信息 */}
      <View className="rounded-2xl border border-[#FFE0E0] p-4 mb-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
        <View className="flex flex-row items-center justify-between">
          <Text className="block text-sm text-[#8B6B6B]">{size}cm · {beadMm}mm</Text>
          <Text className="block text-xl font-bold text-[#FF6B6B]">{recommended} 颗</Text>
        </View>
      </View>

      {/* 手腕围 */}
      <Text className="block text-sm font-medium text-[#2D1B14] mb-3">手腕围</Text>
      <View className="flex flex-row flex-wrap gap-2 mb-6">
        {WRIST_PRESETS.map((w) => (
          <View key={w} className={`py-3 px-5 rounded-xl border interactive ${size === w ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FFE0E0] bg-[#FFFFFF]'}`} onClick={() => setSize(w)}>
            <Text className={`block text-base font-medium ${size === w ? 'text-[#FF6B6B]' : 'text-[#2D1B14]'}`}>{w}cm</Text>
          </View>
        ))}
      </View>

      {/* 珠子大小 */}
      <Text className="block text-sm font-medium text-[#2D1B14] mb-3">珠子大小</Text>
      <View className="flex flex-row gap-2 mb-8">
        {BEAD_SIZES_MM.map((mm) => (
          <View key={mm} className={`py-3 flex-1 rounded-xl border flex items-center justify-center interactive ${beadMm === mm ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FFE0E0] bg-[#FFFFFF]'}`} onClick={() => setBeadMm(mm)}>
            <Text className={`block text-sm ${beadMm === mm ? 'text-[#FF6B6B]' : 'text-[#2D1B14]'}`}>{mm}mm</Text>
          </View>
        ))}
      </View>

      <View
        className="w-full py-4 rounded-xl flex items-center justify-center interactive mt-auto"
        style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
        onClick={confirm}
      >
        <Text className="block text-base font-bold text-[#FFFFFF]">下一步 · 选珠子</Text>
      </View>
    </View>
  )
}

export default WristSizePage
