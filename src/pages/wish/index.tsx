import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MATERIALS } from '@/lib/data'
import { useBeadStore } from '@/lib/store'

const WISH_CATEGORIES = [
  { id: 'career', name: '事业', icon: '📈', desc: '步步高升', materialId: 'agate', colorIndex: 0 },
  { id: 'love', name: '爱情', icon: '💕', desc: '良缘天定', materialId: 'crystal', colorIndex: 1 },
  { id: 'wealth', name: '财运', icon: '💰', desc: '财源滚滚', materialId: 'gilt', colorIndex: 0 },
  { id: 'health', name: '健康', icon: '🍃', desc: '岁岁平安', materialId: 'jade', colorIndex: 0 },
  { id: 'study', name: '学业', icon: '📚', desc: '学业有成', materialId: 'crystal', colorIndex: 0 },
  { id: 'family', name: '家庭', icon: '🏠', desc: '家和万事兴', materialId: 'bodhi', colorIndex: 0 },
  { id: 'wealth2', name: '偏财', icon: '🎲', desc: '意外之喜', materialId: 'amber', colorIndex: 0 },
  { id: 'peace', name: '平安', icon: '🛡️', desc: '出入平安', materialId: 'obsidian', colorIndex: 0 },
  { id: 'beauty', name: '美容', icon: '🌸', desc: '容颜焕发', materialId: 'coral', colorIndex: 1 },
]

const WishPage = () => {
  const { setMaterial, setColor, setGameMode, resetConfig } = useBeadStore()

  const selectWish = (categoryId: string) => {
    const wish = WISH_CATEGORIES.find(w => w.id === categoryId)
    if (!wish) return
    const material = MATERIALS.find(m => m.id === wish.materialId)
    if (!material) return
    setGameMode('wish')
    resetConfig()
    setMaterial(material)
    setColor(material.colors[wish.colorIndex])
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-2">心选编</Text>
      <Text className="block text-base text-[#8B6B6B] mb-6">完成测试题，系统为你推荐最合适的珠子</Text>

      <ScrollView className="flex-1" scrollY>
        <View className="grid grid-cols-3 gap-4 pb-8">
          {WISH_CATEGORIES.map((wish) => {
            const material = MATERIALS.find(m => m.id === wish.materialId)
            const color = material?.colors[wish.colorIndex]
            return (
              <View
                key={wish.id}
                className="rounded-2xl border border-[#FFE0E0] overflow-hidden interactive"
                style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}
                onClick={() => selectWish(wish.id)}
              >
                <View className="p-4 flex flex-col items-center">
                  <Text className="text-3xl mb-2">{wish.icon}</Text>
                  <Text className="block text-base font-medium text-[#2D1B14]">{wish.name}</Text>
                  <Text className="block text-xs text-[#C4A0A0] mt-1">{wish.desc}</Text>
                  {color && (
                    <View className="flex flex-row items-center gap-1 mt-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ background: color.hex }}
                      />
                      <Text className="block text-[10px] text-[#C4A0A0]">{material?.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

export default WishPage
