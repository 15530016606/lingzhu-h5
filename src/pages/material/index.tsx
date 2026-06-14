import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MATERIALS, Material } from '@/lib/data'
import { useBeadStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'

definePageConfig({
  navigationBarTitleText: '选择材质'
})

const MaterialPage = () => {
  const { setMaterial } = useBeadStore()

  const selectMaterial = (material: Material) => {
    setMaterial(material)
    Taro.navigateTo({ url: '/pages/color/index' })
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-3">选择材质</Text>
      <Text className="block text-base text-[#C4A0A0] mb-6">选择你喜欢的珠子材质，每种都有独特质感</Text>

      <ScrollView className="flex-1" scrollY>
        <View className="flex flex-col gap-4 pb-8">
          {MATERIALS.map((material) => (
            <Card
              key={material.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#FFE0E0] overflow-hidden"
              onClick={() => selectMaterial(material)}
            >
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-4">
                  {/* 材质预览球 */}
                  <View className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE0E0] to-[#FFF5F5]">
                    <View
                      className="w-14 h-14 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 35% 30%, ${material.colors[0].gradient[1]}, ${material.colors[0].hex}, ${material.colors[0].gradient[0]})`,
                        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)`,
                      }}
                    />
                  </View>
                  {/* 材质信息 */}
                  <View className="flex-1">
                    <Text className="block text-lg font-semibold text-[#2D1B14]">{material.name}</Text>
                    <Text className="block text-xs text-[#C4A0A0] mt-1">{material.desc}</Text>
                    <View className="flex flex-row gap-1 mt-2">
                      <View className="px-2 py-1 rounded-full bg-[#FFE0E0]">
                        <Text className="block text-xs text-[#8B6B6B]">{material.colors.length}色可选</Text>
                      </View>
                      <View className="px-2 py-1 rounded-full bg-[#FFE0E0]">
                        <Text className="block text-xs text-[#8B6B6B]">
                          {material.glossType === 'glossy' ? '光泽' :
                           material.glossType === 'matte' ? '磨砂' :
                           material.glossType === 'clear' ? '通透' :
                           material.glossType === 'soft' ? '温润' : '闪亮'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* 箭头 */}
                  <Text className="block text-lg text-[#FF6B6B]">›</Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default MaterialPage
