import { BeadProduct } from '../../data/bead-products'

interface Props {
  product: BeadProduct
  onSelect: (product: BeadProduct) => void
  compact?: boolean
}

export default function MaterialCard({ product, onSelect, compact }: Props) {
  const imgUrl = `./images/beads/${product.imageUrl}`

  const imgH = compact ? 56 : 120
  const infoPad = compact ? '4px 6px 6px' : '6px 8px 10px'
  const nameSize = compact ? 11 : 13
  const metaSize = compact ? 10 : 12

  return (
    <div
      className="material-card"
      onClick={() => onSelect(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div
        className="material-image"
        style={{
          width: '100%',
          height: imgH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          padding: 6,
          overflow: 'hidden',
        }}
      >
        <img
          src={imgUrl}
          style={{
            width: '85%',
            height: '85%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        className="material-info"
        style={{
          padding: infoPad,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <span
          className="material-name"
          style={{
            fontSize: nameSize,
            fontWeight: 500,
            color: '#333',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </span>
        <div
          className="material-meta"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: metaSize, color: '#888', fontWeight: 500 }}>
            {product.sizeMm}mm
          </span>
          <span style={{ fontSize: metaSize, color: '#999' }}>
            ¥{product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
