import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme, card } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json' } })
  return res.json()
}

type Source = { id: string; name: string; icon: string }
type Material = { id: string; name: string; sourceId: string; rarity: string; imageUrl: string }

const RARITY_COLORS: Record<string, string> = { common: '#c4b89e', uncommon: '#5ba3e6', rare: '#c8a96e', legendary: '#e05a5a' }
const RARITY_LABELS: Record<string, string> = { common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说' }

export default function CollectionPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [materialsBySource, setMaterialsBySource] = useState<Record<string, Material[]>>({})

  useEffect(() => {
    Promise.all([api('/raw-materials/sources'), api('/raw-materials')]).then(([s, m]) => {
      const srcs = s as Source[]
      setSources(srcs)
      const g: Record<string, Material[]> = {}
      for (const mat of m as Material[]) {
        if (!g[mat.sourceId]) g[mat.sourceId] = []
        g[mat.sourceId].push(mat)
      }
      setMaterialsBySource(g)
    })
  }, [])

  return (
    <View style={{ minHeight: '100vh', backgroundColor: theme.bgPage }}>
      <View style={{ backgroundColor: theme.textPrimary, padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 16, fontWeight: 700, color: theme.bgCard }}>珠子图鉴</Text>
      </View>
      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {sources.map((src) => {
          const mats = materialsBySource[src.id] || []
          return (
            <View key={src.id} style={{ marginBottom: 16 }}>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>{src.icon}</Text>
                <Text style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>{src.name}</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 11, color: theme.textDisabled }}>0/{mats.length}</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {mats.map(mat => (
                  <View key={mat.id} style={{ width: 'calc(25% - 6px)', padding: 8, ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 44, height: 44, borderRadius: theme.radiusSmall, backgroundColor: theme.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {mat.imageUrl ? <img src={`/images/beads/${mat.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                    </View>
                    <Text style={{ fontSize: 10, color: theme.textBody, textAlign: 'center', lineHeight: 1.2 }}>{mat.name}</Text>
                    <Text style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, color: '#fff', backgroundColor: RARITY_COLORS[mat.rarity] || '#999' }}>
                      {RARITY_LABELS[mat.rarity] || mat.rarity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
