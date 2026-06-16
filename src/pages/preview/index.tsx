import { useMemo, useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { calcWristSize, calcTotalPrice, getWristStatus } from '@/data/bead-products'

export default function PreviewPage() {
  const { currentDesign, ropeColor, clearDesign } = useBeadStore()

  const wristSize = useMemo(() => calcWristSize(currentDesign), [currentDesign])
  const totalPrice = useMemo(() => calcTotalPrice(currentDesign), [currentDesign])
  const wristStatus = getWristStatus(wristSize)
  const statusColor = wristStatus === 'normal' ? '#1a1a2e' : '#c0392b'

  if (currentDesign.length === 0) {
    return (
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5', padding: 20 }}>
        <Text style={{ fontSize: 14, color: '#999', marginBottom: 16 }}>还没有选择珠子</Text>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '12px 32px', backgroundColor: '#2c3e50', borderRadius: 12, cursor: 'pointer' }}>
          <Text style={{ fontSize: 14, color: '#fff' }}>返回设计</Text>
        </View>
      </View>
    )
  }

  const goCheckout = () => {
    Taro.navigateTo({ url: '/pages/checkout/index' })
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* ===== 固定顶部：标题 + 预览 ===== */}
      <View style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        {/* 标题栏 */}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', position: 'relative' }}>
          <View onClick={() => Taro.navigateBack()} style={{ position: 'absolute', left: 16, top: 12, padding: '4px 8px', cursor: 'pointer' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>{'< 返回'}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>确认订单</Text>
        </View>

        {/* 手串预览 — 增大预览区让手串占比更高 */}
        <View style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: '100%', height: '100%', maxWidth: 320 }}>
            <BeadPreviewRing beads={currentDesign} ropeColor={ropeColor} onRemove={() => {}} compact />
          </View>
        </View>

        {/* 快捷摘要 */}
        <View style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '8px 16px 14px' }}>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>手围</Text>
            <Text style={{ fontSize: 15, fontWeight: 700, color: statusColor }}>{wristSize}cm</Text>
            <Text style={{ fontSize: 10, color: statusColor }}>{wristStatus === 'short' ? '偏短' : wristStatus === 'long' ? '偏长' : '合适'}</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>珠子</Text>
            <Text style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{currentDesign.length}颗</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>合计</Text>
            <Text style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* ===== 可滚动内容 ===== */}
      <ScrollView scrollY style={{ flex: 1 }}>
        {/* 珠子清单 */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '14px 16px' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 10 }}>珠子清单</Text>
          {currentDesign.map((bead, i) => (
            <View key={bead._key || i} style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 5, borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ fontSize: 12, color: '#666' }}>{bead.name} {bead.sizeMm}mm</Text>
              <Text style={{ fontSize: 12, color: '#1a1a2e' }}>¥{bead.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 价格明细 */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '14px 16px' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>价格明细</Text>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>珠子费</Text>
            <Text style={{ fontSize: 13, color: '#1a1a2e' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>手工费</Text>
            <Text style={{ fontSize: 13, color: '#1a1a2e' }}>免费</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4, borderTop: '1px solid #e8e8e8', marginTop: 4, paddingTop: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>合计</Text>
            <Text style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* 底部留白 */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== 底部固定按钮 ===== */}
      <View style={{ padding: '12px 16px', paddingBottom: 28, backgroundColor: '#ffffff', borderTop: '1px solid #e8e8e8' }}>
        <View
          onClick={goCheckout}
          style={{ width: '100%', padding: '14px 0', backgroundColor: '#2c3e50', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
            去结算 ¥{totalPrice.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )
}
