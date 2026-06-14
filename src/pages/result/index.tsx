import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'

const CATEGORY_MAP: Record<string, { name: string; color: string }> = {
  career: { name: '事业', color: '#FF6B6B' },
  love: { name: '爱情', color: '#FF6B6B' },
  health: { name: '健康', color: '#50B898' },
  wealth: { name: '财运', color: '#FFD700' },
}

const ResultPage = () => {
  const { beads, rope, charms, fortune, resetConfig } = useBeadStore()

  if (!fortune) {
    Taro.navigateBack()
    return null
  }

  const saveToAlbum = () => {
    Taro.showToast({ title: '已保存到相册', icon: 'success' })
  }

  const shareToFriend = () => {
    Taro.showToast({ title: '分享链接已复制', icon: 'success' })
  }

  const makeNewBracelet = () => {
    resetConfig()
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  const renderStars = (score: number) => {
    const filled = '★'
    const empty = '☆'
    return filled.repeat(score) + empty.repeat(5 - score)
  }

  return (
    <ScrollView className="h-screen bg-[#FFF5F5]" scrollY>
      <View className="px-5 pt-8 pb-10">
        {/* 签文头部 */}
        <View className="flex flex-col items-center mb-6">
          <View className="mb-3">
            <View className="px-4 py-1.5 rounded-full bg-[#FF6B6B]/10 border border-[#FF6B6B]/30">
              <Text className="block text-xs text-[#FF6B6B] font-medium">{fortune.category}</Text>
            </View>
          </View>
          <Text className="block text-2xl font-bold text-[#2D1B14] text-center leading-tight">{fortune.title}</Text>
        </View>

        {/* 诗句卡片 */}
        <View className="rounded-2xl border border-[#FFE0E0] p-5 mb-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
          <Text className="block text-sm text-[#8B6B6B] text-center leading-relaxed whitespace-pre-line">{fortune.poem}</Text>
        </View>

        {/* 四维运势 */}
        <Text className="block text-xs text-[#C4A0A0] mb-3 font-medium">运势详解</Text>
        <View className="flex flex-row gap-2 mb-5">
          {(['career', 'love', 'health', 'wealth'] as const).map((key) => {
            const info = CATEGORY_MAP[key]
            const score = fortune.scores[key]
            return (
              <View key={key} className="flex-1 rounded-xl border border-[#FFE0E0] p-3" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
                <Text className="block text-xs text-[#C4A0A0] text-center mb-1">{info.name}</Text>
                <Text className="block text-lg text-center" style={{ color: info.color }}>{renderStars(score)}</Text>
              </View>
            )
          })}
        </View>

        {/* 建议 */}
        <Text className="block text-xs text-[#C4A0A0] mb-3 font-medium">建议</Text>
        <View className="rounded-2xl border border-[#FFE0E0] p-4 mb-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
          <Text className="block text-sm text-[#8B6B6B] leading-relaxed">{fortune.advice}</Text>
        </View>

        {/* 手串信息 + 幸运信息 */}
        <View className="flex flex-row gap-2 mb-6">
          {/* 手串 */}
          <View className="flex-1 rounded-xl border border-[#FFE0E0] p-3" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
            <Text className="block text-[10px] text-[#C4A0A0] mb-2">手串</Text>
            {beads.length > 0 ? (
              <>
                <Text className="block text-xs text-[#2D1B14]">{beads.length}颗珠子</Text>
                <Text className="block text-[10px] text-[#C4A0A0]">{rope.name}</Text>
                {charms.length > 0 && (
                  <Text className="block text-xs text-[#2D1B14] mt-1">{charms.map(c => c.icon).join('')}</Text>
                )}
              </>
            ) : (
              <Text className="block text-xs text-[#C4A0A0]">手串信息</Text>
            )}
          </View>

          {/* 幸运信息 */}
          <View className="flex-1 rounded-xl border border-[#FFE0E0] p-3" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)' }}>
            <Text className="block text-[10px] text-[#C4A0A0] mb-2">今日幸运</Text>
            <Text className="block text-xs text-[#2D1B14]">颜色 · {fortune.lucky.color}</Text>
            <Text className="block text-xs text-[#2D1B14]">数字 · {fortune.lucky.number}</Text>
            <Text className="block text-xs text-[#2D1B14]">方向 · {fortune.lucky.direction}</Text>
          </View>
        </View>

        {/* 分隔 */}
        <View className="w-full h-px bg-[#FFE0E0] mb-5" />

        {/* 日期 */}
        <Text className="block text-xs text-[#C4A0A0] text-center mb-6">
          灵珠手作 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        {/* 操作按钮 */}
        <View className="flex flex-col gap-3">
          <View
            className="w-full py-4 rounded-xl flex items-center justify-center interactive"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
            onClick={saveToAlbum}
          >
            <Text className="block text-base font-bold text-[#FFFFFF]">保存到相册</Text>
          </View>
          <View
            className="w-full py-3 rounded-xl flex items-center justify-center border border-[#FF6B6B] interactive"
            onClick={shareToFriend}
          >
            <Text className="block text-sm font-medium text-[#FF6B6B]">分享给好友</Text>
          </View>
          <View
            className="w-full py-3 rounded-xl flex items-center justify-center border border-[#FFE0E0] interactive mt-1"
            onClick={makeNewBracelet}
          >
            <Text className="block text-sm font-medium text-[#C4A0A0]">再编一条</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ResultPage
