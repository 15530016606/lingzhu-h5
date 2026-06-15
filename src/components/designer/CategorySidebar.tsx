import { View, Text, ScrollView } from '@tarojs/components'
import { BeadCategory, getCategoryName } from '../../data/bead-products'

interface Props {
  categories: BeadCategory[]
  activeCategory: string
  onSelect: (categoryId: string) => void
}

export default function CategorySidebar({ categories, activeCategory, onSelect }: Props) {
  const allCategory: BeadCategory = { id: 'all', name: '全部', count: categories.reduce((s, c) => s + c.count, 0) }
  const list = [allCategory, ...categories]

  return (
    <View
      className="category-sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 77,
        flexShrink: 0,
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <ScrollView scrollY style={{ height: '100%' }}>
        {list.map((cat) => {
          const isActive = cat.id === activeCategory
          return (
            <View
              key={cat.id}
              className="category-item"
              style={{
                width: '100%',
                padding: '12px 10px',
                fontSize: 13.33,
                textAlign: 'center',
                backgroundColor: isActive ? '#ffffff' : '#f5f5f5',
                borderBottom: '1px solid #e8e8e8',
                cursor: 'pointer',
              }}
              onClick={() => onSelect(cat.id)}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: isActive ? '#000' : '#999',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {getCategoryName(cat.id)}
              </Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
