import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import { useBeadStore } from '@/lib/store'
import { calcTotalPrice, BEAD_PRODUCTS } from '@/data/bead-products'

interface SavedDesign {
  name: string
  phone: string
  note: string
  beads: any[]
  ropeColor: string
  wristSize: number
  totalPrice: number
  date: string
}

const FavoritesPage = () => {
  const { setDesign, setRopeColor } = useBeadStore()
  const [designs, setDesigns] = useState<SavedDesign[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved-designs') || '[]')
    setDesigns(saved)
  }, [])

  const handleUse = (d: SavedDesign) => {
    setDesign(d.beads)
    setRopeColor(d.ropeColor || 'rgba(180,180,180,0.6)')
    Taro.navigateTo({ url: '/pages/bead-designer/index' })
  }

  const handleDelete = (idx: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '将移除这条收藏',
      success: (res) => {
        if (res.confirm) {
          const updated = designs.filter((_, i) => i !== idx)
          setDesigns(updated)
          localStorage.setItem('saved-designs', JSON.stringify(updated))
          Taro.showToast({ title: '已删除', icon: 'none' })
        }
      },
    })
  }

  return (
    <View style={{ height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 导航栏 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>{'< 返回'}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>我的收藏</Text>
        <View style={{ width: 50 }} />
      </View>

      {designs.length === 0 ? (
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24, color: '#ccc' }}>♡</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#999', marginBottom: 4 }}>还没有收藏的手串</Text>
          <Text style={{ fontSize: 12, color: '#bbb' }}>完成设计后可收藏到这里</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ flex: 1, padding: '16px' }}>
          <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {designs.map((d, i) => {
              const beads = d.beads || []
              const price = d.totalPrice || calcTotalPrice(beads)
              return (
                <View key={i} style={{ borderRadius: 12, border: '1px solid #e8e8e8', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  {/* 预览 + 信息 */}
                  <View style={{ display: 'flex', flexDirection: 'row', padding: 12, gap: 12 }}>
                    <View style={{ width: 80, height: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BeadPreviewRing beads={beads} ropeColor={d.ropeColor || 'rgba(180,180,180,0.6)'} onRemove={() => {}} compact />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 }}>{d.name}</Text>
                      <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{beads.length}颗 · {d.wristSize}cm</Text>
                      <Text style={{ fontSize: 11, color: '#999' }}>{new Date(d.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 15, fontWeight: 700, color: '#c0392b' }}>¥{price.toFixed(2)}</Text>
                      <View
                        onClick={() => handleDelete(i)}
                        style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#f5f5f5', cursor: 'pointer' }}
                      >
                        <Text style={{ fontSize: 11, color: '#999' }}>删除</Text>
                      </View>
                    </View>
                  </View>

                  {/* 操作按钮 */}
                  <View style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'row', gap: 8 }}>
                    <View
                      onClick={() => handleUse(d)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 8, backgroundColor: '#2c3e50', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>继续编辑</Text>
                    </View>
                    <View
                      onClick={() => {
                        setDesign(beads)
                        setRopeColor(d.ropeColor || 'rgba(180,180,180,0.6)')
                        Taro.navigateTo({ url: '/pages/preview/index' })
                      }}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e8e8e8', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <Text style={{ fontSize: 12, color: '#666' }}>去下单</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </View>
  )
}

export default FavoritesPage
