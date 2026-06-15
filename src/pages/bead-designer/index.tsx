import { useMemo, useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import MaterialPanel from '@/components/designer/MaterialPanel'
import { useBeadStore } from '@/lib/store'
import { calcWristSize, calcTotalPrice, getWristStatus } from '@/data/bead-products'

export default function BeadDesignerPage() {
  const { currentDesign, addToDesign, removeFromDesign, reorderDesign, clearDesign, ropeColor } = useBeadStore()
  const [panelPct, setPanelPct] = useState(100) // 0=展开, 100=收起

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

  // 面板收起时预览居中，展开时预览上移
  const showButtons = currentDesign.length > 0

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
      {/* 浮动操作按钮 — 页面中上方 */}
      {showButtons && (
        <View style={{
          position: 'fixed', top: 56, right: 12, zIndex: 100,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <View
            onClick={handleClear}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e0e0e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Text style={{ fontSize: 15, color: '#666' }}>🗑</Text>
          </View>
          <View
            onClick={handleComplete}
            style={{
              padding: '7px 16px', borderRadius: 18,
              backgroundColor: '#2c3e50',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(44,62,80,0.25)',
            }}
          >
            <Text style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>完成设计</Text>
          </View>
        </View>
      )}

      {/* 浮动信息 — 手围/价格 */}
      <View style={{
        position: 'fixed', top: 58, left: 12, zIndex: 100,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        {currentDesign.length > 0 && (
          <>
            <View style={{
              display: 'flex', alignItems: 'center', gap: 3,
              backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e8e8e8',
              borderRadius: 10, padding: '3px 8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <Text style={{ fontSize: 11, color: '#999' }}>手围</Text>
              <Text style={{ fontSize: 13, color: statusColor, fontWeight: 500 }}>{wristSize}cm</Text>
              <Text style={{ fontSize: 10, color: statusColor }}>
                {wristStatus === 'short' ? '偏短' : wristStatus === 'long' ? '偏长' : ''}
              </Text>
            </View>
            <View style={{
              display: 'flex', alignItems: 'center', gap: 3,
              backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e8e8e8',
              borderRadius: 10, padding: '3px 8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <Text style={{ fontSize: 11, color: '#999' }}>合计</Text>
              <Text style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>¥{totalPrice.toFixed(2)}</Text>
            </View>
          </>
        )}
      </View>

      {/* 预览区 — paddingBottom 跟随面板可见高度，手串自动缩放 */}
      <View style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: Math.max(36, 400 - (panelPct / 100) * 364),
        transition: 'padding-bottom 0.3s ease',
        position: 'relative',
        overflow: 'visible',
      }}>
        <View style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
          {currentDesign.length === 0 ? (
            <View style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Text style={{ fontSize: 14, color: '#bbb' }}>点击下方珠子开始设计</Text>
            </View>
          ) : (
            <BeadPreviewRing beads={currentDesign} ropeColor={ropeColor} onRemove={handleRemoveBead} onReorder={reorderDesign} />
          )}
        </View>
      </View>

      {/* 选材面板 */}
      <MaterialPanel onAddBead={handleAddBead} onSlideChange={setPanelPct} />
    </View>
  )
}
