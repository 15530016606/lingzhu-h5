import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import MaterialPanel from '@/components/designer/MaterialPanel'
import RopeSelector from '@/components/designer/RopeSelector'
import { useBeadStore } from '@/lib/store'
import { calcWristSize, calcTotalPrice, getWristStatus } from '@/data/bead-products'

export default function BeadDesignerPage() {
  const { currentDesign, addToDesign, removeFromDesign, reorderDesign, clearDesign, ropeColor, setRopeColor } = useBeadStore()

  const wristSize = useMemo(() => calcWristSize(currentDesign), [currentDesign])
  const totalPrice = useMemo(() => calcTotalPrice(currentDesign), [currentDesign])
  const wristStatus = getWristStatus(wristSize)

  const handleAddBead = (product) => addToDesign(product)
  const handleRemoveBead = (index) => removeFromDesign(index)

  const handleClear = () => {
    if (currentDesign.length === 0) return
    Taro.showModal({
      title: '确认清空',
      content: '将移除所有已选珠子',
      success: (res) => { if (res.confirm) clearDesign() },
    })
  }

  const handleSave = () => Taro.showToast({ title: '已保存草稿', icon: 'success' })

  const handleComplete = () => {
    if (currentDesign.length < 4) {
      Taro.showToast({ title: '至少需要4颗珠子', icon: 'none' })
      return
    }
    if (wristStatus === 'short') {
      Taro.showToast({ title: `手围${wristSize}cm 过短，请再加几颗`, icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/preview/index' })
  }

  const statusColor = wristStatus === 'normal' ? '#333' : wristStatus === 'short' ? '#c0392b' : '#c8a96e'

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
      <View style={{ position: 'fixed', top: 60, right: 10, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 12, fontSize: 12 }}>
        <Text style={{ color: '#999' }}>帮助</Text>
      </View>

      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', paddingBottom: 8 }}>
        <View style={{ flex: 1, position: 'relative', minHeight: 220 }}>
          {currentDesign.length === 0 ? (
            <View style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Text style={{ fontSize: 14, color: '#bbb' }}>点击下方珠子开始设计</Text>
            </View>
          ) : (
            <BeadPreviewRing beads={currentDesign} ropeColor={ropeColor} onRemove={handleRemoveBead} onReorder={reorderDesign} />
          )}
        </View>

        <RopeSelector value={ropeColor} onChange={setRopeColor} />

        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6px 12px', gap: 20 }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '4px 8px', fontSize: 12 }}>
            <Text>手围约</Text>
            <Text style={{ color: statusColor, fontWeight: 500 }}>{wristSize}cm</Text>
            <Text style={{ color: statusColor }}>{wristStatus === 'short' ? '过短' : wristStatus === 'long' ? '略长' : ''}</Text>
          </View>
          <View style={{ fontSize: 12, color: '#999' }}>
            <Text>合计: </Text>
            <Text style={{ color: '#333', fontSize: 13 }}>¥{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 15px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8', zIndex: 10 }}>
        <View onClick={handleClear} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentDesign.length === 0 ? 0.4 : 1 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>🗑</Text>
        </View>
        <View style={{ display: 'flex', gap: 10 }}>
          <View onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, cursor: 'pointer' }}>
            <Text style={{ fontSize: 14, color: '#333' }}>保存</Text>
          </View>
          <View onClick={handleComplete} style={{ padding: '8px 16px', backgroundColor: '#2c3e50', borderRadius: 8, cursor: 'pointer' }}>
            <Text style={{ fontSize: 14, color: '#fff' }}>完成设计</Text>
          </View>
        </View>
      </View>

      <MaterialPanel onAddBead={handleAddBead} currentCount={currentDesign.length} />
    </View>
  )
}
