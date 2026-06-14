import { useEffect, useRef, useState } from 'react'
import { View, Text, Canvas, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { renderBeadBracelet } from '@/lib/renderer'
import { useBeadStore } from '@/lib/store'
import { MATERIALS } from '@/lib/data'
import { getH5Canvas } from '@/lib/canvas'

const IndexPage = () => {
  const animationRef = useRef<any>(null)
  const rotationRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { dailyRecord, signInRecords, getStreakCount } = useBeadStore()
  const [streakCount, setStreakCount] = useState(0)
  const [dailyUsed, setDailyUsed] = useState(0)

  const defaultMaterial = MATERIALS[0]
  const defaultColor = defaultMaterial.colors[0]

  useEffect(() => {
    setStreakCount(getStreakCount())
    setDailyUsed(dailyRecord.count)
  }, [signInRecords, dailyRecord])

  useEffect(() => {
    let mounted = true
    // H5: 直接获取 canvas DOM 节点，不用 Taro.createSelectorQuery
    const getCanvas = () => {
      if (canvasRef.current) return canvasRef.current
      const el = getH5Canvas('braceletCanvas')
      if (el) canvasRef.current = el
      return el
    }
    const animate = () => {
      if (!mounted) return
      const node = getCanvas()
      if (node) {
        rotationRef.current = (rotationRef.current + 0.5) % 360
        renderBeadBracelet({
          canvas: node,
          config: {
            material: defaultMaterial,
            color: defaultColor,
            accessories: [],
            beadCount: 7,
          },
          width: 300,
          height: 300,
          rotation: rotationRef.current,
          showHalo: true,
        })
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      mounted = false
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const goToFree = () => Taro.navigateTo({ url: '/pages/wrist-size/index' })
  const goToWish = () => Taro.navigateTo({ url: '/pages/quiz/index' })
  const goToCouple = () => Taro.navigateTo({ url: '/pages/couple/index' })
  const goToSignIn = () => Taro.navigateTo({ url: '/pages/signin/index' })
  const goToFavorites = () => Taro.showToast({ title: '收藏功能开发中', icon: 'none' })

  return (
    <View className="min-h-screen bg-[#FFF5F5] flex flex-col items-center px-6 py-6">
      {/* Logo */}
      <View className="flex flex-col items-center mt-4 mb-2">
        <Text className="text-3xl font-bold text-[#FF6B6B]">灵珠手作</Text>
        <Text className="block text-base text-[#C4A0A0] mt-1">编一串好运 · 测今日运势</Text>
      </View>

      {/* 3D 预览 */}
      <View className="w-full max-w-xs h-72 bg-gradient-to-b from-[#FFF0F0] to-[#FFE8E8] rounded-3xl flex items-center justify-center overflow-hidden mb-6 border border-[#FFE0E0] shadow-lg shadow-[#FF6B6B]/10">
        <Canvas id="braceletCanvas" type="2d" className="w-full h-full" style={{ width: '300px', height: '300px' }} />
      </View>

      {/* 每日状态 */}
      <View className="w-full max-w-xs flex flex-row items-center justify-around mb-6 px-4 py-3 rounded-2xl bg-[#FFFFFF]/60 border border-[#FFE0E0]">
        <View className="flex flex-col items-center">
          <Text className="block text-xs text-[#C4A0A0]">今日已编</Text>
          <Text className="block text-lg font-bold text-[#2D1B14]">{dailyUsed}/3</Text>
        </View>
        <View className="w-px h-8 bg-[#FFE0E0]" />
        <View className="flex flex-col items-center">
          <Text className="block text-xs text-[#C4A0A0]">连续签到</Text>
          <Text className="block text-lg font-bold text-[#FF6B6B]">{streakCount}天</Text>
        </View>
      </View>

      {/* 三种玩法 */}
      <ScrollView className="w-full flex-1" scrollY>
        <View className="flex flex-col gap-3 pb-4 max-w-xs mx-auto">
          {/* L1 自由编 */}
          <View
            className="w-full rounded-2xl border overflow-hidden interactive"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0F0 100%)',
              borderColor: '#FF6B6B', borderWidth: '1.5px',
              boxShadow: '0 0 20px rgba(255,107,107,0.08)',
            }}
            onClick={goToFree}
          >
            <View className="p-5">
              <View className="flex flex-row items-center gap-4">
                <View className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B6B]/30 to-[#FF6B6B]/5 flex items-center justify-center border border-[#FF6B6B]/20">
                  <Text className="text-2xl">编</Text>
                </View>
                <View className="flex-1">
                  <Text className="block text-lg font-bold text-[#2D1B14]">自由编</Text>
                  <Text className="block text-sm text-[#8B6B6B] mt-0.5">从 14 种材质中自由搭配</Text>
                  <Text className="block text-xs text-[#C4A0A0] mt-1">约 1-2 分钟</Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                  <Text className="text-sm font-bold text-[#FFFFFF]">→</Text>
                </View>
              </View>
            </View>
          </View>

          {/* L2 许愿编 */}
          <View
            className="w-full rounded-2xl border border-[#FFE0E0] overflow-hidden interactive"
            style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}
            onClick={goToWish}
          >
            <View className="p-4">
              <View className="flex flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E06060]/20 to-[#E06060]/5 flex items-center justify-center">
                  <Text className="text-xl">愿</Text>
                </View>
                <View className="flex-1">
                  <View className="flex flex-row items-center gap-2">
                    <Text className="block text-base font-bold text-[#2D1B14]">许愿编</Text>
                    <View className="px-2 py-0.5 rounded-full bg-[#FF6B6B]/10 border border-[#FF6B6B]/30">
                      <Text className="text-[10px] text-[#FF6B6B]">NEW</Text>
                    </View>
                  </View>
                  <Text className="block text-xs text-[#C4A0A0] mt-0.5">选愿望系统自动配珠</Text>
                </View>
                <Text className="text-lg text-[#C4A0A0]">›</Text>
              </View>
            </View>
          </View>

          {/* L3 缘分编 */}
          <View
            className="w-full rounded-2xl border border-[#FFE0E0] overflow-hidden interactive"
            style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}
            onClick={goToCouple}
          >
            <View className="p-4">
              <View className="flex flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-[#96E0D0]/20 to-[#96E0D0]/5 flex items-center justify-center">
                  <Text className="text-xl">缘</Text>
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-bold text-[#2D1B14]">缘分编</Text>
                  <Text className="block text-xs text-[#C4A0A0] mt-0.5">双人合珠，测缘分指数</Text>
                </View>
                <Text className="text-lg text-[#C4A0A0]">›</Text>
              </View>
            </View>
          </View>

          {/* 底部按钮 */}
          <View className="flex flex-row gap-3 mt-1">
            <View
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center border border-[#FF6B6B]/40 interactive"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,107,107,0.02) 100%)' }}
              onClick={goToSignIn}
            >
              <Text className="block text-sm font-medium text-[#FF6B6B]">每日签到</Text>
            </View>
            <View
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center border border-[#FFE0E0] interactive"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}
              onClick={goToFavorites}
            >
              <Text className="block text-sm font-medium text-[#C4A0A0]">我的收藏</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="w-full flex items-center py-3">
        <Text className="block text-xs text-[#C4A0A0]">指尖流转 · 好运自来</Text>
      </View>
    </View>
  )
}

export default IndexPage
