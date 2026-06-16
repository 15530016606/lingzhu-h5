import { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { BEAD_PRODUCTS } from '@/data/bead-products'
import { COLOR_THEMES, makeThemeBracelet, getThemeCharms, ColorTheme } from '@/data/color-themes'

export default function ColorThemePage() {
  const { setDesign, setRopeColor } = useBeadStore()
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(COLOR_THEMES[0])

  const previewBeads = useMemo(() => {
    const beads = makeThemeBracelet(activeTheme)
    const charms = getThemeCharms(activeTheme.id)
    return [...beads, ...charms]
  }, [activeTheme])

  const handleUseTheme = () => {
    const beads = makeThemeBracelet(activeTheme)
    setDesign(beads)
    setRopeColor('rgba(180,180,180,0.6)')
    Taro.navigateTo({ url: '/pages/bead-designer/index' })
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>{'< 返回'}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>色系编</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* 色系选择 — 横向滚动标签 */}
      <ScrollView
        scrollX
        showScrollbar={false}
        style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', gap: 8, padding: '10px 16px' }}>
          {COLOR_THEMES.map((theme) => {
            const active = theme.id === activeTheme.id
            return (
              <View
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: active ? '1.5px solid #2c3e50' : '1px solid #e8e8e8',
                  backgroundColor: active ? '#ffffff' : '#fafafa',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <View style={{ width: 14, height: 14, borderRadius: '50%', background: theme.gradient, flexShrink: 0 }} />
                <Text style={{ fontSize: 13, color: active ? '#2c3e50' : '#666', fontWeight: active ? 600 : 400 }}>
                  {theme.name}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* 主内容区 */}
      <ScrollView scrollY style={{ flex: 1, padding: '16px' }}>
        {/* 当前色系预览 */}
        <View
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          {/* 色系横幅 */}
          <View
            style={{
              height: 100,
              background: activeTheme.gradient,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              {activeTheme.name}
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
              {activeTheme.desc}
            </Text>
          </View>

          {/* 手串预览 */}
          <View
            style={{
              backgroundColor: '#ffffff',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 0',
            }}
          >
            <View style={{ width: '100%', height: '100%', maxWidth: 240 }}>
              <BeadPreviewRing
                beads={previewBeads}
                ropeColor="rgba(180,180,180,0.6)"
                onRemove={() => {}}
                compact
                stagger
              />
            </View>
          </View>
        </View>

        {/* 设计说明 */}
        <View style={{ borderRadius: 12, border: '1px solid #e8e8e8', padding: 14, marginBottom: 16, backgroundColor: '#ffffff' }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View style={{ width: 4, height: 14, backgroundColor: '#c8a96e', borderRadius: 2 }} />
            <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>搭配解析</Text>
          </View>
          {activeTheme.beadIndices.map((idx, i) => {
            const p = BEAD_PRODUCTS[idx]
            if (!p) return null
            return (
              <View key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                <View style={{ width: 20, height: 20, borderRadius: 4, background: activeTheme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{p.name} {p.sizeMm}mm</Text>
              </View>
            )
          })}
        </View>

        {/* 使用按钮 */}
        <View
          onClick={handleUseTheme}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            backgroundColor: '#2c3e50',
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
            使用此色系 · 开始编串
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
