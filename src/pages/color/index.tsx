import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MaterialColor } from '@/lib/data'
import { useBeadStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'

definePageConfig({
  navigationBarTitleText: '选择颜色'
})

const ColorPage = () => {
  const { beadConfig, setColor } = useBeadStore()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const material = beadConfig.material

  // 如果没有选择材质，返回
  if (!material) {
    Taro.navigateBack()
    return null
  }

  const selectColor = (color: MaterialColor, index: number) => {
    setSelectedIndex(index)
    setColor(color)
  }

  const confirmColor = () => {
    if (selectedIndex !== null) {
      Taro.navigateTo({ url: '/pages/accessory/index' })
    }
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-3">选择颜色</Text>
      <Text className="block text-base text-[#C4A0A0] mb-6">
        为{material.name}选择一种心仪的颜色
      </Text>

      {/* 当前选中的预览 */}
      {selectedIndex !== null && (
        <Card className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] mb-6">
          <CardContent className="p-6 flex flex-col items-center">
            <View
              className="w-24 h-24 rounded-full mb-3"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${material.colors[selectedIndex].gradient[1]}, ${material.colors[selectedIndex].hex}, ${material.colors[selectedIndex].gradient[0]})`,
                boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 3px 6px rgba(255,255,255,0.15), 0 0 20px rgba(255,107,107,0.2)`,
              }}
            />
            <Text className="block text-lg font-semibold text-[#2D1B14]">
              {material.colors[selectedIndex].name}
            </Text>
          </CardContent>
        </Card>
      )}

      {/* 颜色选项网格 */}
      <ScrollView className="flex-1" scrollY>
        <View className="grid grid-cols-3 gap-4 pb-8">
          {material.colors.map((color, index) => (
            <Card
              key={index}
              className={`bg-[#FFFFFF] rounded-xl border overflow-hidden ${
                selectedIndex === index ? 'border-[#FF6B6B] ring-1 ring-[#FF6B6B]' : 'border-[#FFE0E0]'
              }`}
              onClick={() => selectColor(color, index)}
            >
              <CardContent className="p-3 flex flex-col items-center">
                <View
                  className="w-16 h-16 rounded-full mb-2"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${color.gradient[1]}, ${color.hex}, ${color.gradient[0]})`,
                    boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)`,
                  }}
                />
                <Text
                  className={`block text-xs text-center ${
                      selectedIndex === index ? 'text-[#FF6B6B]' : 'text-[#8B6B6B]'
                    }`}
                >
                    {color.name}
                  </Text>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* 底部确认按钮 */}
      <View className="pt-4">
        <View
          className={`w-full py-4 rounded-xl flex items-center justify-center interactive ${
            selectedIndex !== null
              ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF9A9E]'
              : 'bg-[#FFE0E0]'
          }`}
          onClick={confirmColor}
        >
          <Text
            className={`block text-base font-bold ${
                selectedIndex !== null ? 'text-[#FFFFFF]' : 'text-[#C4A0A0]'
              }`}
          >
            下一步 · 选择配珠
          </Text>
        </View>
      </View>
    </View>
  )
}

export default ColorPage
