import { View, Text, Image } from '@tarojs/components'
import { BeadProduct } from '../../data/bead-products'

interface Props {
  product: BeadProduct
  onSelect: (product: BeadProduct) => void
}

export default function MaterialCard({ product, onSelect }: Props) {
  const imgUrl = `/images/beads/${product.imageUrl}`

  return (
    <View
      className="material-card"
      onClick={() => onSelect(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* 图片区 - 占卡片的 65% 高度 */}
      <View
        className="material-image"
        style={{
          width: '100%',
          height: 130,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          padding: 10,
          overflow: 'hidden',
        }}
      >
        <Image
          src={imgUrl}
          mode="aspectFit"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </View>

      {/* 信息区 */}
      <View
        className="material-info"
        style={{
          padding: '6px 8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Text
          className="material-name"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#333',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Text>
        <View
          className="material-meta"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>
            {product.sizeMm}mm
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>
            ¥{product.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )
}
