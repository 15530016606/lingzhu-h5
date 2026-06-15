import { View, Text } from '@tarojs/components'

interface Props {
  value: string
  onChange: (color: string) => void
}

const ROPE_OPTIONS = [
  { name: '灰', color: 'rgba(180,180,180,0.6)' },
  { name: '棕', color: 'rgba(139,90,43,0.6)' },
  { name: '红', color: 'rgba(200,60,60,0.6)' },
  { name: '黑', color: 'rgba(40,40,40,0.6)' },
  { name: '金', color: 'rgba(200,170,80,0.6)' },
]

export default function RopeSelector({ value, onChange }: Props) {
  return (
    <View
      className="rope-selector"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '4px 12px',
      }}
    >
      <Text style={{ fontSize: 12, color: '#999' }}>绳色</Text>
      {ROPE_OPTIONS.map((opt) => {
        const isActive = value === opt.color
        return (
          <View
            key={opt.color}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: opt.color,
              border: isActive ? '2px solid #2c3e50' : '2px solid transparent',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            onClick={() => onChange(opt.color)}
          >
            {isActive && (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                  }}
                />
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
