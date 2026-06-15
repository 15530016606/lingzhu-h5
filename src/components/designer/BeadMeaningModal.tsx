import { View, Text, Image } from '@tarojs/components'
import { BeadProduct } from '../../data/bead-products'
import { BeadMeaning } from '../../data/bead-meanings'

interface Props {
  visible: boolean
  product: BeadProduct | null
  meaning: BeadMeaning | null
  onClose: () => void
}

export default function BeadMeaningModal({ visible, product, meaning, onClose }: Props) {
  if (!visible || !product || !meaning) return null

  const imgUrl = `/images/beads/${product.imageUrl}`

  return (
    <View
      className="bead-meaning-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <View
        className="bead-meaning-card"
        style={{
          width: '100%',
          maxWidth: 300,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation?.()
          e.preventDefault?.()
        }}
      >
        {/* 标题 */}
        <Text style={{ fontSize: 18, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>
          {product.name}
        </Text>

        {/* 图片 */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            overflow: 'hidden',
            marginBottom: 16,
            border: '1px solid #e8e8e8',
          }}
        >
          <Image
            src={imgUrl}
            mode="aspectFill"
            style={{ width: '100%', height: '100%' }}
          />
        </View>

        {/* 信息 */}
        <View style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: 13, color: '#999' }}>寓意</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>{meaning.meaning}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: 13, color: '#999' }}>五行</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>{meaning.element}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: 13, color: '#999' }}>幸运数字</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>{meaning.luckyNumber}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: 13, color: '#999' }}>推荐用途</Text>
            <Text style={{ fontSize: 13, color: '#333' }}>{meaning.useCase}</Text>
          </View>
        </View>

        {/* 诗句 */}
        <View
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: '#f9f9f9',
            borderRadius: 8,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: '#c8a96e', fontStyle: 'italic' }}>
            {meaning.poem}
          </Text>
        </View>

        {/* 关闭按钮 */}
        <View
          style={{
            marginTop: 20,
            padding: '8px 32px',
            backgroundColor: '#2c3e50',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          <Text style={{ fontSize: 14, color: '#ffffff' }}>关闭</Text>
        </View>
      </View>
    </View>
  )
}
