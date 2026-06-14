import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'
import { ROPE_TYPES, CHARMS, Charm } from '@/lib/data'

const RopeCharmPage = () => {
  const { rope, charms, setRope, addCharm, removeCharm, setGameMode, resetBeads } = useBeadStore()
  const [selectedRope, setSelectedRope] = useState(rope)
  const [selectedCharms, setSelectedCharms] = useState<Charm[]>(charms)

  const toggleCharm = (c: Charm) => {
    if (selectedCharms.some(x => x.id === c.id)) {
      setSelectedCharms(selectedCharms.filter(x => x.id !== c.id))
    } else {
      setSelectedCharms([...selectedCharms, c])
    }
  }

  const confirm = () => {
    setRope(selectedRope)
    // 清空 charms 重新添加
    charms.forEach((_, i) => removeCharm(i))
    selectedCharms.forEach(c => addCharm(c))
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 py-6 flex flex-col">
      <Text className="block text-4xl font-bold text-[#2D1B14] mb-2">选配件</Text>
      <Text className="block text-base text-[#8B6B6B] mb-6">选择绳子和可爱小挂件</Text>

      {/* 绳子 */}
      <Text className="block text-sm font-medium text-[#2D1B14] mb-3">绳子材质</Text>
      <View className="flex flex-col gap-3 mb-8">
        {ROPE_TYPES.map((r) => (
          <View
            key={r.id}
            className={`rounded-xl border p-4 flex flex-row items-center gap-4 interactive ${
              selectedRope.id === r.id
                ? 'border-[#FF6B6B] bg-[#FF6B6B]/10'
                : 'border-[#FFE0E0] bg-[#FFFFFF]'
            }`}
            onClick={() => setSelectedRope(r)}
          >
            <View className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: r.color }}>
              <Text className="text-lg">〰️</Text>
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-[#2D1B14]">{r.name}</Text>
              <Text className="block text-xs text-[#C4A0A0]">{r.desc}</Text>
            </View>
            {selectedRope.id === r.id && (
              <Text className="text-[#FF6B6B]">✓</Text>
            )}
          </View>
        ))}
      </View>

      {/* 小玩偶 */}
      <Text className="block text-sm font-medium text-[#2D1B14] mb-3">小挂件（可多选）</Text>
      <ScrollView className="flex-1" scrollY>
        <View className="flex flex-col gap-3 pb-8">
          {(['animal', 'food', 'symbol', 'nature'] as const).map((cat) => {
            const items = CHARMS.filter(c => c.category === cat)
            const catName = { animal: '动物', food: '食物', symbol: '符号', nature: '自然' }[cat]
            return (
              <View key={cat}>
                <Text className="block text-xs text-[#C4A0A0] mb-2">{catName}</Text>
                <View className="grid grid-cols-5 gap-3">
                  {items.map((c) => (
                    <View
                      key={c.id}
                      className={`rounded-xl border p-2 flex flex-col items-center interactive ${
                        selectedCharms.some(x => x.id === c.id)
                          ? 'border-[#FF6B6B] bg-[#FF6B6B]/10'
                          : 'border-[#FFE0E0] bg-[#FFFFFF]'
                      }`}
                      onClick={() => toggleCharm(c)}
                    >
                      <Text className="text-2xl mb-1">{c.icon}</Text>
                      <Text className="block text-[10px] text-[#2D1B14]">{c.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* 底部 */}
      <View className="pt-3 pb-6">
        <View
          className="w-full py-4 rounded-xl flex items-center justify-center interactive"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
          onClick={confirm}
        >
          <Text className="block text-base font-bold text-[#FFFFFF]">完成 · 3D预览</Text>
        </View>
      </View>
    </View>
  )
}

export default RopeCharmPage
