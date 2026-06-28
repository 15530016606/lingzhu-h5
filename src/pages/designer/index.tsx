import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { playSound, resumeAudio } from '@/lib/sound'
import BeadPreviewRing from '@/components/designer/BeadPreviewRing'
import RopeSelector from '@/components/designer/RopeSelector'
import { BEAD_PRODUCTS, BeadProduct } from '@/data/bead-products'

const BASE_URL = 'http://localhost:3000'

interface InventoryItem {
  productIndex: number
  count: number
  name: string
}

const CATEGORIES: Record<string, string> = {
  crystal: '水晶', jade: '玉石', wood: '木料',
  fruit: '果料', shell: '贝壳', artificial: '人工料',
}

export default function DesignerPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedBeads, setSelectedBeads] = useState<BeadProduct[]>([])
  const [ropeColor, setRopeColor] = useState('rgba(180,180,180,0.6)')
  const [loading, setLoading] = useState(true)

  // 加载珠子库存
  useEffect(() => {
    const token = Taro.getStorageSync('token') || ''
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${BASE_URL}/api/user/me/inventory`, { headers })
      .then(r => r.json())
      .then((data: InventoryItem[]) => {
        setInventory(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { setLoading(false); setInventory([]) })
  }, [])

  // 添加珠子到串
  const addBead = useCallback((item: InventoryItem) => {
    if (selectedBeads.length >= 16) {
      Taro.showToast({ title: '最多16颗', icon: 'none' })
      return
    }
    resumeAudio()
    playSound('chime1', 0.3)
    const product = BEAD_PRODUCTS[item.productIndex]
    if (!product) return
    setSelectedBeads(prev => [...prev, { ...product, _key: `${product.id}_${Date.now()}` }])
  }, [selectedBeads])

  // 移除珠子
  const removeBead = useCallback((index: number) => {
    setSelectedBeads(prev => prev.filter((_, i) => i !== index))
    playSound('click_error', 0.2)
  }, [])

  // 清空
  const clearAll = useCallback(() => {
    setSelectedBeads([])
    playSound('whoosh', 0.3)
  }, [])

  // 确认定稿
  const confirmDesign = useCallback(() => {
    if (selectedBeads.length < 2) {
      Taro.showToast({ title: '至少选2颗珠子', icon: 'none' })
      return
    }
    const beadIds = selectedBeads.map(b => b.id).join(',')
    Taro.navigateTo({
      url: `/pages/checkout/index?beads=${beadIds}&rope=${encodeURIComponent(ropeColor)}&count=${selectedBeads.length}`,
    })
  }, [selectedBeads, ropeColor])

  // 按类别分组库存
  const grouped: Record<string, InventoryItem[]> = {}
  inventory.forEach(item => {
    const product = BEAD_PRODUCTS[item.productIndex]
    const cat = product?.categoryId || 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }}>
      <ScrollView scrollY style={{ flex: 1, padding: '16px 16px 80px' }}>

        {/* 串珠预览 */}
        <View style={{
          background: theme.bgCard, borderRadius: theme.radiusCard,
          border: `1px solid ${theme.borderLight}`, marginBottom: 16,
          boxShadow: `0 2px 12px ${theme.shadow}`,
          padding: '10px 0',
        }}>
          <View style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selectedBeads.length > 0 ? (
              <View style={{ width: '90%', height: '100%' }}>
                <BeadPreviewRing
                  beads={selectedBeads}
                  ropeColor={ropeColor}
                  onRemove={removeBead}
                />
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: theme.textDisabled }}>点击下方珠子开始串珠</Text>
            )}
          </View>
          <RopeSelector value={ropeColor} onChange={setRopeColor} />
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 8, padding: '4px 16px 8px' }}>
            <Text style={{ fontSize: 11, color: selectedBeads.length >= 2 ? theme.accent : theme.textDisabled, fontWeight: 600 }}>
              已选 {selectedBeads.length}/16 颗
            </Text>
            {selectedBeads.length > 0 && (
              <Text onClick={clearAll} onTouchEnd={clearAll}
                style={{ fontSize: 11, color: '#e05a5a', cursor: 'pointer' }}>
                清空
              </Text>
            )}
          </View>
        </View>

        {/* 确认按钮 */}
        <View onClick={confirmDesign} onTouchEnd={confirmDesign} style={{
          padding: '14px 0', borderRadius: theme.radiusBtn,
          background: `linear-gradient(135deg, ${theme.primary}, #c4956a)`,
          alignItems: 'center', marginBottom: 16, cursor: 'pointer',
          boxShadow: `0 3px 10px ${theme.shadow}`,
        }}>
          <Text style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
            确认定稿 {selectedBeads.length > 0 ? `(${selectedBeads.length}颗)` : ''}
          </Text>
        </View>

        {/* 珠子库存列表 */}
        <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 10 }}>
          我的珠子库存
        </Text>

        {loading ? (
          <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', padding: 20 }}>
            加载中...
          </Text>
        ) : inventory.length === 0 ? (
          <View style={{
            padding: 30, alignItems: 'center', background: theme.bgCard,
            borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`,
          }}>
            <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center' }}>
              还没有珠子，先去采集加工吧
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([catId, items]) => (
            <View key={catId} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 6, fontWeight: 600 }}>
                {CATEGORIES[catId] || catId}
              </Text>
              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {items.map((item, i) => {
                  const product = BEAD_PRODUCTS[item.productIndex]
                  if (!product) return null
                  return (
                    <View key={`${item.productIndex}_${i}`}
                      onClick={() => addBead(item)} onTouchEnd={() => addBead(item)}
                      style={{
                        width: 'calc(25% - 6px)', padding: '10px 6px 8px',
                        background: theme.bgCard, borderRadius: 12,
                        border: `1px solid ${theme.borderLight}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        cursor: 'pointer', gap: 4,
                      }}
                    >
                      <View style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 30%, #e8f0ff, #a0c4ff)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                          {product.name.charAt(0)}
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 9, color: theme.textPrimary, textAlign: 'center',
                        lineHeight: 1.2,
                      }}>{product.name}</Text>
                      <Text style={{ fontSize: 8, color: theme.accent }}>x{item.count}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
