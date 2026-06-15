import { useMemo, useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { calcWristSize, calcTotalPrice, getWristStatus } from '@/data/bead-products'

export default function PreviewPage() {
  const { currentDesign, ropeColor, clearDesign } = useBeadStore()
  const [designName, setDesignName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const wristSize = useMemo(() => calcWristSize(currentDesign), [currentDesign])
  const totalPrice = useMemo(() => calcTotalPrice(currentDesign), [currentDesign])
  const wristStatus = getWristStatus(wristSize)
  const statusColor = wristStatus === 'normal' ? '#333' : '#c0392b'

  if (currentDesign.length === 0) {
    return (
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#999', marginBottom: 20 }}>还没有选择珠子</Text>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '12px 32px', backgroundColor: '#2c3e50', borderRadius: 12, cursor: 'pointer' }}>
          <Text style={{ fontSize: 15, color: '#fff' }}>返回设计</Text>
        </View>
      </View>
    )
  }

  const handleSubmit = () => {
    const name = designName.trim() || `手串 ${new Date().toLocaleDateString()}`
    const savedDesigns = JSON.parse(localStorage.getItem('saved-designs') || '[]')
    savedDesigns.push({
      name, phone, note,
      beads: currentDesign, ropeColor,
      wristSize, totalPrice,
      date: new Date().toISOString(),
    })
    localStorage.setItem('saved-designs', JSON.stringify(savedDesigns))
    setSubmitted(true)
    Taro.showToast({ title: '下单成功！', icon: 'success' })
    setTimeout(() => { clearDesign(); Taro.navigateBack() }, 1500)
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* ===== 固定顶部：标题 + 预览 ===== */}
      <View style={{ backgroundColor: '#ffffff' }}>
        {/* 标题栏 */}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
          <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px', cursor: 'pointer' }}>
            <Text style={{ fontSize: 15, color: '#666' }}>{'< 返回'}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>确认订单</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* 手串预览 — 居中、宽度受限 */}
        <View style={{
          height: 220,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{ width: '100%', height: '100%', maxWidth: 320 }}>
            <BeadPreviewRing beads={currentDesign} ropeColor={ropeColor} onRemove={() => {}} compact />
          </View>
        </View>

        {/* 快捷摘要 */}
        <View style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '10px 16px 14px' }}>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>手围</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: statusColor }}>{wristSize}cm</Text>
            <Text style={{ fontSize: 11, color: statusColor }}>{wristStatus === 'short' ? '偏短' : wristStatus === 'long' ? '偏长' : '合适'}</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>珠子</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{currentDesign.length}颗</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>合计</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: '#c0392b' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* ===== 可滚动内容：订单详情 + 表单 ===== */}
      <ScrollView scrollY style={{ flex: 1 }}>
        {/* 名称 */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '12px 16px' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>定制信息</Text>
          <Input
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: 8, fontSize: 14, color: '#333', marginBottom: 8,
              backgroundColor: '#fafafa', boxSizing: 'border-box',
            }}
            placeholder="给你的手串取个名字（可选）"
            value={designName}
            onInput={(e: any) => setDesignName(e.detail.value)}
          />
          <Input
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: 8, fontSize: 14, color: '#333', marginBottom: 8,
              backgroundColor: '#fafafa', boxSizing: 'border-box',
            }}
            placeholder="手机号码（可选）"
            value={phone}
            onInput={(e: any) => setPhone(e.detail.value)}
          />
          <Input
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #ddd',
              borderRadius: 8, fontSize: 14, color: '#333',
              backgroundColor: '#fafafa', boxSizing: 'border-box',
            }}
            placeholder="备注（可选）"
            value={note}
            onInput={(e: any) => setNote(e.detail.value)}
          />
        </View>

        {/* 价格明细 */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '12px 16px' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>价格明细</Text>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>珠子费</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>手工费</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>免费</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4, borderTop: '1px solid #eee', marginTop: 4, paddingTop: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>合计</Text>
            <Text style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* 珠子清单 */}
        <View style={{ backgroundColor: '#ffffff', marginTop: 8, padding: '12px 16px' }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>珠子清单</Text>
          {currentDesign.map((bead, i) => (
            <View key={bead._key || i} style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '1px solid #f5f5f5' }}>
              <Text style={{ fontSize: 13, color: '#666' }}>{bead.name} {bead.sizeMm}mm</Text>
              <Text style={{ fontSize: 13, color: '#333' }}>¥{bead.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* 提交按钮 */}
        <View style={{ padding: '16px 16px 30px' }}>
          <View
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '14px 0', backgroundColor: '#2c3e50',
              borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
              {submitted ? '已提交 ✓' : '提交定制'}
            </Text>
          </View>
          {!submitted && (
            <View onClick={() => { clearDesign(); Taro.navigateBack() }} style={{ padding: '10px 0', cursor: 'pointer', textAlign: 'center' }}>
              <Text style={{ fontSize: 13, color: '#999' }}>重新设计</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
