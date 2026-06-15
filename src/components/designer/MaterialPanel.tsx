import { useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { BeadProduct, BEAD_PRODUCTS, getProductsByCategory, getCategories } from '../../data/bead-products'
import MaterialCard from './MaterialCard'
import CategorySidebar from './CategorySidebar'

interface Props {
  onAddBead: (product: BeadProduct) => void
}

type TabType = 'beads' | 'accessories'

export default function MaterialPanel({ onAddBead }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('beads')
  const [activeCategory, setActiveCategory] = useState('all')

  // 切换 tab 时重置分类
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setActiveCategory('all')
  }

  // 当前 tab 的品类列表
  const categories = useMemo(() => getCategories(activeTab === 'accessories' ? 'accessory' : 'bead'), [activeTab])

  // 当前显示的产物
  const products = useMemo(() => {
    return getProductsByCategory(activeCategory, activeTab === 'accessories' ? 'accessory' : 'bead')
  }, [activeCategory, activeTab])

  const totalCount = activeTab === 'beads'
    ? BEAD_PRODUCTS.filter(p => p.type === 'bead').length
    : BEAD_PRODUCTS.filter(p => p.type === 'accessory').length

  return (
    <View
      className="materials-section-bottom"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e8e8e8',
        boxShadow: 'rgba(0,0,0,0.04) 0px -1px 0px 0px',
        height: '48vh',
        maxHeight: 480,
      }}
    >
      {/* 标签栏 */}
      <View className="type-toolbar" style={{ display: 'flex', alignItems: 'center', padding: '4px 12px 10px', gap: 10 }}>
        <View className="type-tabs" style={{ display: 'flex', gap: 8 }}>
          <View
            className="type-tab"
            style={{
              padding: '6px 16px',
              fontSize: 14,
              color: activeTab === 'beads' ? '#000' : '#999',
              backgroundColor: activeTab === 'beads' ? '#ffffff' : '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: 16,
              cursor: 'pointer',
            }}
            onClick={() => handleTabChange('beads')}
          >
            珠子
          </View>
          <View
            className="type-tab"
            style={{
              padding: '6px 16px',
              fontSize: 14,
              color: activeTab === 'accessories' ? '#000' : '#999',
              backgroundColor: activeTab === 'accessories' ? '#ffffff' : '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: 16,
              cursor: 'pointer',
            }}
            onClick={() => handleTabChange('accessories')}
          >
            配饰
          </View>
        </View>

        {/* 搜索筛选按钮 */}
        <View
          className="materials-filter-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f7f7f8',
            color: '#6b7280',
            border: '1px solid #e4e4e7',
            borderRadius: 16,
            padding: '7px 12px',
            fontSize: 13,
            fontWeight: 500,
            marginLeft: 'auto',
            gap: 6,
          }}
        >
          <Text>搜索筛选</Text>
          <Text style={{ fontSize: 11, color: '#999' }}>{totalCount}</Text>
        </View>
      </View>

      {/* 内容区 */}
      <View className="materials-content" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左: 类别侧栏 */}
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* 右: 材料网格 */}
        <View className="materials-grid-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 8 }}>
          <View className="materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {products.map((product) => (
              <MaterialCard
                key={`${product.id}-${product.sizeMm}`}
                product={product}
                onSelect={onAddBead}
              />
            ))}
          </View>
          <View style={{ height: 12 }} />
        </View>
      </View>
    </View>
  )
}
