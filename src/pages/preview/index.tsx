import { useEffect, useRef, useState } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { renderHandDrawnBracelet } from '@/lib/renderer'
import { useBeadStore } from '@/lib/store'
import { DAILY_FREE_COUNT } from '@/lib/data'
import { getH5Canvas } from '@/lib/canvas'

const PreviewPage = () => {
  const animRef = useRef<any>(null)
  const rotationRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dragRef = useRef<{ lastX: number; lastY: number; dragging: boolean }>({ lastX: 0, lastY: 0, dragging: false })
  const { beadConfig, beads, rope, charms, generateFortune, consumeChance, dailyRecord } = useBeadStore()
  const [isZoomed, setIsZoomed] = useState(false)
  const [isRotating, setIsRotating] = useState(true)

  const hasNewData = beads.length > 0
  const displayMaterial = hasNewData ? beads[0].material : beadConfig.material
  const displayColor = hasNewData ? beads[0].color : beadConfig.color
  const displayCount = hasNewData ? beads.length : beadConfig.beadCount

  // 渲染
  useEffect(() => {
    if (!displayMaterial || !displayColor) return
    let mounted = true
    const getCanvas = () => {
      if (canvasRef.current) return canvasRef.current
      const el = getH5Canvas('previewCanvas')
      if (el) canvasRef.current = el
      return el
    }
    const animate = () => {
      if (!mounted) return
      const node = getCanvas()
      if (node) {
        if (isRotating && !dragRef.current.dragging) {
          rotationRef.current = (rotationRef.current + 0.3) % 360
        }
        const w = isZoomed ? 380 : 320
        const h = isZoomed ? 380 : 320
        if (hasNewData) {
          renderHandDrawnBracelet(node, beads, w, h, rotationRef.current)
        } else if (displayMaterial && displayColor) {
          renderHandDrawnBracelet(node, [{ material: displayMaterial, color: displayColor, sizeMm: 8, id: '0' }], w, h, rotationRef.current)
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    setTimeout(() => { animRef.current = requestAnimationFrame(animate) }, 100)
    return () => { mounted = false; if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [isRotating, isZoomed, beads, beadConfig, hasNewData])

  // 触摸拖拽
  const onTouchStart = (e: any) => {
    const t = e.touches?.[0] || e
    dragRef.current = { lastX: t.clientX, lastY: t.clientY, dragging: true }
    setIsRotating(false)
  }
  const onTouchMove = (e: any) => {
    if (!dragRef.current.dragging) return
    const t = e.touches?.[0] || e
    const dx = t.clientX - dragRef.current.lastX
    dragRef.current.lastX = t.clientX
    dragRef.current.lastY = t.clientY
    rotationRef.current = (rotationRef.current + dx * 0.5) % 360
  }
  const onTouchEnd = () => {
    dragRef.current.dragging = false
  }

  if (!displayMaterial || !displayColor) {
    Taro.navigateBack()
    return null
  }

  const toggleRotate = () => setIsRotating(!isRotating)
  const toggleZoom = () => setIsZoomed(!isZoomed)

  const confirmBracelet = () => {
    const used = dailyRecord.count
    if (used >= DAILY_FREE_COUNT) {
      Taro.showModal({
        title: '今日次数已用完',
        content: '每日免费编串3条已经用完，观看广告可获得额外次数',
        confirmText: '观看广告',
        cancelText: '算了',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '广告播放中...', icon: 'none' })
            setTimeout(() => { generateFortune(); Taro.navigateTo({ url: '/pages/result/index' }) }, 2000)
          }
        }
      })
      return
    }
    if (consumeChance()) { generateFortune(); Taro.navigateTo({ url: '/pages/result/index' }) }
    else { Taro.showToast({ title: '今日次数已用尽', icon: 'none' }) }
  }

  const goBack = () => Taro.navigateBack()

  return (
    <View className="min-h-screen bg-[#FFF5F5] flex flex-col items-center px-6 py-6">
      <Text className="block text-xl font-bold text-[#2D1B14] mb-1">3D 预览</Text>
      <Text className="block text-base text-[#C4A0A0] mb-4">
        {beads.length > 0 ? `${beads.length}颗珠子` : `${displayColor.name}${displayMaterial.name}`}
        {charms.length > 0 ? ` · +${charms.length}件挂件` : ''}
        {rope.name !== '弹力绳' ? ` · ${rope.name}` : ''}
      </Text>

      <View className="flex-1 flex items-center justify-center w-full">
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            width: isZoomed ? '380px' : '320px',
            height: isZoomed ? '380px' : '320px',
            background: '#FFF5F5',
            border: '1px solid #FFE0E0',
            boxShadow: '0 0 40px rgba(255, 107, 107, 0.1)',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseMove={onTouchMove}
          onMouseUp={onTouchEnd}
          onMouseLeave={onTouchEnd}
        >
          <Canvas id="previewCanvas" type="2d" className="w-full h-full" style={{ width: isZoomed ? '380px' : '320px', height: isZoomed ? '380px' : '320px' }} />
        </View>
      </View>

      <View className="flex flex-row items-center justify-center gap-4 my-4">
        <View className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#FFE0E0] flex items-center justify-center interactive" onClick={toggleRotate}>
          <Text className="block text-lg">{isRotating ? '停' : '转'}</Text>
        </View>
        <View className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#FFE0E0] flex items-center justify-center interactive" onClick={toggleZoom}>
          <Text className="block text-lg">{isZoomed ? '放' : '缩'}</Text>
        </View>
      </View>

      {hasNewData && (
        <View className="flex flex-row items-center gap-2 mb-4">
          {beads.map((b, i) => (
            <View key={i} className="w-5 h-5 rounded-full border border-[#FFE0E0]" style={{
              background: `radial-gradient(circle at 35% 30%, ${b.color.gradient[1]}, ${b.color.hex})`,
            }} />
          ))}
        </View>
      )}

      <View className="w-full flex flex-col gap-3 max-w-xs">
        <View className="w-full py-4 rounded-xl flex items-center justify-center interactive" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }} onClick={confirmBracelet}>
          <Text className="block text-base font-bold text-[#FFFFFF]">确认 · 测算运势</Text>
        </View>
        <Text className="block text-center text-sm text-[#C4A0A0] py-2 interactive" onClick={goBack}>返回修改</Text>
      </View>
    </View>
  )
}

export default PreviewPage
