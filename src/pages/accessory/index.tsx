import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ACCESSORIES, Accessory } from '@/lib/data'
import { useBeadStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'

definePageConfig({
  navigationBarTitleText: '选择配珠'
})

const AccessoryPage = () => {
  const { beadConfig, addAccessory, removeAccessory } = useBeadStore()
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null)
  const material = beadConfig.material
  const color = beadConfig.color

  if (!material || !color) {
    Taro.navigateBack()
    return null
  }

  const toggleAccessory = (accessory: Accessory) => {
    if (selectedAcc === accessory.id) {
      setSelectedAcc(null)
    } else {
      setSelectedAcc(accessory.id)
      addAccessory(accessory)
    }
  }

  const removeSelected = (index: number) => {
    removeAccessory(index)
    setSelectedAcc(null)
  }

  const goToPreview = () => {
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  const skipToPreview = () => {
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-3">点缀配珠</Text>
      <Text className="block text-base text-[#C4A0A0] mb-6">
        添加配珠来点缀你的{color.name}{material.name}手串
      </Text>

      {/* 已选配珠列表 */}
      {beadConfig.accessories.length > 0 && (
        <Card className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] mb-4">
          <CardContent className="p-4">
            <Text className="block text-xs text-[#C4A0A0] mb-3">已选配珠</Text>
            <View className="flex flex-row flex-wrap gap-3">
              {beadConfig.accessories.map((item, index) => (
                <View
                  key={index}
                  className="flex flex-row items-center gap-2 px-3 py-2 rounded-lg bg-[#FFE0E0]"
                >
                  <Text className="text-base">{item.accessory.icon}</Text>
                  <Text className="block text-xs text-[#8B6B6B]">{item.accessory.name}</Text>
                  <Text
                    className="block text-xs text-[#E06060] ml-1"
                    onClick={() => removeSelected(index)}
                  >
                    ✕
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}

      {/* 当前预览 */}
      <Card className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] mb-6">
        <CardContent className="p-6 flex flex-row items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} className="flex flex-col items-center">
              <View
                className="w-8 h-8 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${color.gradient[1]}, ${color.hex}, ${color.gradient[0]})`,
                  boxShadow: `inset 0 -1px 2px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)`,
                }}
              />
              {i === 1 && beadConfig.accessories.some(a => a.accessory.type === 'spacer_gold') && (
                <View className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] -mt-1" />
              )}
              {i === 3 && beadConfig.accessories.some(a => a.accessory.type === 'pendant') && (
                <View className="w-3 h-4 rounded-b-full bg-gradient-to-br from-[#E8D0FF] to-[#A060B0] -mt-1" />
              )}
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 配珠选项 */}
      <ScrollView className="flex-1" scrollY>
        <View className="flex flex-col gap-3 pb-8">
          {ACCESSORIES.map((acc) => (
            <Card
              key={acc.id}
              className={`bg-[#FFFFFF] rounded-xl border overflow-hidden ${
                selectedAcc === acc.id ? 'border-[#FF6B6B] ring-1 ring-[#FF6B6B]' : 'border-[#FFE0E0]'
              }`}
              onClick={() => toggleAccessory(acc)}
            >
              <CardContent className="p-4 flex flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-lg bg-[#FFE0E0] flex items-center justify-center">
                  <Text className="text-2xl">{acc.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-medium text-[#2D1B14]">{acc.name}</Text>
                  <Text className="block text-xs text-[#C4A0A0] mt-1">
                    {acc.type === 'spacer_gold' ? '金色点缀，提升华贵感' :
                     acc.type === 'spacer_silver' ? '银色点缀，增添清雅气质' :
                     acc.type === 'tassel' ? '灵动流苏，随动作摇曳' :
                     '精致吊坠，点睛之笔'}
                  </Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAcc === acc.id ? 'border-[#FF6B6B] bg-[#FF6B6B]' : 'border-[#FFE0E0]'
                  }`}
                >
                  {selectedAcc === acc.id && (
                    <Text className="block text-xs text-[#FFFFFF] font-bold">✓</Text>
                  )}
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className="flex flex-col gap-2 pt-4">
        <View
          className="w-full py-4 rounded-xl flex items-center justify-center interactive"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)',
          }}
          onClick={goToPreview}
        >
          <Text className="block text-base font-bold text-[#FFFFFF]">
            完成 · 3D预览
          </Text>
        </View>
        <Text
          className="block text-center text-xs text-[#C4A0A0] py-2"
          onClick={skipToPreview}
        >
          跳过，直接预览
        </Text>
      </View>
    </View>
  )
}

export default AccessoryPage
