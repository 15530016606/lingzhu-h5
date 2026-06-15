import { View, Text, Image } from '@tarojs/components'
import { BeadProduct } from '../../data/bead-products'

interface Props {
  product: BeadProduct
  onSelect: (product: BeadProduct) => void
  onLongPress: (product: BeadProduct) => void
}

export default function MaterialCard({ product, onSelect }: Props) {
  const imgUrl = `/images/beads/${product.imageUrl}`

  return (
    <View
      className="material-card"
      onClick={() => onSelect(product)}
    >
      <View className="material-image">
        <Image
          src={imgUrl}
          mode="aspectFill"
          style={{ width: 48, height: 48, borderRadius: '50%' }}
        />
      </View>
      <View className="material-info">
        <Text style={{ fontSize: 11, color: '#666' }}>{product.sizeMm}mm</Text>
        <Text style={{ fontSize: 11, color: '#999' }}>¥{product.price.toFixed(2)}</Text>
      </View>
    </View>
  )
}
