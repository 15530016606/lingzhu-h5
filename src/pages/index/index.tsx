import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { BEAD_PRODUCTS } from '@/data/bead-products'

/* ── 样品手串定义：每个样品用一组商品索引，重复填满 14-17 颗 ── */
const SAMPLE_BRACELETS: {
  name: string
  desc: string
  /* 在 BEAD_PRODUCTS 里的索引，实际手串会按这个顺序循环填满 16 颗 */
  pattern: number[]
  ropeColor: string
}[] = [
  {
    name: '紫气东来',
    desc: '紫水晶 · 白水晶 · 星光粉',
    pattern: [14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14, 16, 0, 14, 36, 14],
    // 巴西紫水晶8+薰衣草紫10+白水晶6+巴西紫8+星光粉10
    ropeColor: 'rgba(40,40,40,0.6)',
  },
  {
    name: '金色年华',
    desc: '黄水晶 · 白水晶 · 金发晶',
    pattern: [26, 34, 2, 26, 34, 2, 26, 34, 131, 2, 26, 34, 2, 26, 34, 2],
    // 柠檬黄8+黄塔晶10+白水晶10
    ropeColor: 'rgba(180,180,180,0.6)',
  },
  {
    name: '青山绿水',
    desc: '绿幽灵 · 白幽灵 · 绿发晶',
    pattern: [7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7, 5, 115, 7],
    // 白幽灵10+白幽灵6+绿发晶8
    ropeColor: 'rgba(180,180,180,0.6)',
  },
  {
    name: '皓月星辰',
    desc: '月光石 · 星光粉 · 白水晶',
    pattern: [1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1, 36, 37, 1],
    // 白水晶8+星光粉10+星光粉6
    ropeColor: 'rgba(40,40,40,0.6)',
  },
]

function resolveSampleBeads(pattern: number[]) {
  return pattern
    .map((idx) => {
      const p = BEAD_PRODUCTS[idx]
      if (!p) return null
      return { ...p }
    })
    .filter(Boolean) as any[]
}

/* ── 样品手串卡片 ── */
function SampleBraceletCard({
  sample,
  onSelect,
}: {
  sample: (typeof SAMPLE_BRACELETS)[0]
  onSelect: (pattern: number[], ropeColor: string) => void
}) {
  const previewBeads = resolveSampleBeads(sample.pattern)

  return (
    <View
      onClick={() => onSelect(sample.pattern, sample.ropeColor)}
      style={{
        width: 140,
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* 预览环 */}
      <View
        style={{
          width: '100%',
          height: 110,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: '100%', height: '100%', maxWidth: 110 }}>
          <BeadPreviewRing
            beads={previewBeads}
            ropeColor={sample.ropeColor}
            onRemove={() => {}}
            compact
            stagger
          />
        </View>
      </View>

      {/* 名称 */}
      <View style={{ width: '100%', padding: '6px 8px 8px', textAlign: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: 1,
          }}
        >
          {sample.name}
        </Text>
        <Text style={{ fontSize: 10, color: '#999', lineHeight: 1.3 }}>
          {sample.desc} · {sample.pattern.length}颗
        </Text>
      </View>
    </View>
  )
}

const IndexPage = () => {
  const { dailyRecord, signInRecords, getStreakCount, setDesign, setRopeColor } = useBeadStore()
  const [streakCount, setStreakCount] = useState(0)
  const [dailyUsed, setDailyUsed] = useState(0)

  useEffect(() => {
    setStreakCount(getStreakCount())
    setDailyUsed(dailyRecord.count)
  }, [signInRecords, dailyRecord])

  const goToFree = () => Taro.navigateTo({ url: '/pages/bead-designer/index' })
  const goToWish = () => Taro.navigateTo({ url: '/pages/quiz/index' })
  const goToCouple = () => Taro.navigateTo({ url: '/pages/couple/index' })
  const goToColorTheme = () => Taro.navigateTo({ url: '/pages/color-theme/index' })
  const goToSignIn = () => Taro.navigateTo({ url: '/pages/signin/index' })
  const goToFavorites = () => Taro.navigateTo({ url: '/pages/favorites/index' })

  const handleSampleSelect = useCallback(
    (pattern: number[], ropeColor: string) => {
      const beads = resolveSampleBeads(pattern)
      setDesign(beads)
      setRopeColor(ropeColor)
      Taro.navigateTo({ url: '/pages/bead-designer/index' })
    },
    [setDesign, setRopeColor],
  )

  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ===== 顶部品牌区 + 样品预览 ===== */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          borderRadius: 16,
          padding: '20px 0 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50', marginBottom: 2 }}>
          灵珠手作
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#999',
            marginBottom: 14,
            letterSpacing: 1,
          }}
        >
          编一串好运 · 测每日运势
        </Text>

        {/* 样品手串横向预览 */}
        <ScrollView
          scrollX
          showsHorizontalScrollIndicator={false}
          style={{ width: '100%' }}
          enhanced
          showScrollbar={false}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 4,
            }}
          >
            {SAMPLE_BRACELETS.map((sample, i) => (
              <SampleBraceletCard
                key={i}
                sample={sample}
                onSelect={handleSampleSelect}
              />
            ))}
          </View>
        </ScrollView>

        {/* 编串入口 */}
        <View
          onClick={goToFree}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
            padding: '8px 24px',
            borderRadius: 20,
            backgroundColor: '#2c3e50',
            cursor: 'pointer',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
            从零开始编
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>→</Text>
        </View>
      </View>

      {/* ===== 数据卡片 ===== */}
      <View
        style={{
          margin: '12px 16px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>今日已编</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#1a1a2e' }}>
            {dailyUsed}/3
          </Text>
        </View>
        <View style={{ width: 1, height: 32, backgroundColor: '#e8e8e8' }} />
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#999' }}>连续签到</Text>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50' }}>
            {streakCount}天
          </Text>
        </View>
      </View>

      {/* ===== 四个入口：2x2 网格 ===== */}
      <ScrollView scrollY style={{ flex: 1, padding: '0 16px' }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          {/* 自由编 */}
          <View
            style={{
              width: 'calc(50% - 5px)',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={goToFree}
          >
            <View
              style={{
                padding: '20px 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(44,62,80,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: '#2c3e50' }}>编</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>自由编</Text>
              <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4, textAlign: 'center' }}>206 种珠子自由搭配</Text>
            </View>
          </View>

          {/* 心选编 */}
          <View
            style={{
              width: 'calc(50% - 5px)',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={goToWish}
          >
            <View
              style={{
                padding: '20px 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(200,169,110,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: '#c8a96e' }}>心</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>心选编</Text>
              <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4, textAlign: 'center' }}>测试性格，推荐珠子</Text>
            </View>
          </View>

          {/* 缘分编 */}
          <View
            style={{
              width: 'calc(50% - 5px)',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={goToCouple}
          >
            <View
              style={{
                padding: '20px 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(44,62,80,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: '#2c3e50' }}>缘</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>缘分编</Text>
              <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4, textAlign: 'center' }}>双人合珠测缘分</Text>
            </View>
          </View>

          {/* 色系编 */}
          <View
            style={{
              width: 'calc(50% - 5px)',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={goToColorTheme}
          >
            <View
              style={{
                padding: '20px 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: '#c8a96e' }}>色</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>色系编</Text>
              <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4, textAlign: 'center' }}>选色系，系统配珠</Text>
            </View>
          </View>
        </View>

          {/* 底部双按钮 */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 2 }}>
            <View
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 10,
                border: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
              }}
              onClick={goToSignIn}
            >
              <Text style={{ fontSize: 13, color: '#666' }}>每日签到</Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 10,
                border: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
              }}
              onClick={goToFavorites}
            >
              <Text style={{ fontSize: 13, color: '#666' }}>我的收藏</Text>
            </View>
          </View>

        {/* 底部文案 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px 0 28px',
          }}
        >
          <Text style={{ fontSize: 11, color: '#ccc', letterSpacing: 2 }}>
            指尖流转 · 好运自来
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default IndexPage
