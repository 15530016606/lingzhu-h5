import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_BASE || ''

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  })
  return res.json()
}

type Source = { id: string; name: string; icon: string }
type Material = { id: string; name: string; sourceId: string; rarity: string; imageUrl: string }

const RARITY_COLORS: Record<string, string> = {
  common: '#8e9eab', uncommon: '#5ba3e6', rare: '#c8a96e', legendary: '#e74c3c',
}
const RARITY_LABELS: Record<string, string> = {
  common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说',
}

export default function CollectionPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [materialsBySource, setMaterialsBySource] = useState<Record<string, Material[]>>({})
  const [userMaterials, setUserMaterials] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      api('/raw-materials/sources'),
      api('/raw-materials'),
    ]).then(([sourcesData, materialsData]) => {
      const srcs = sourcesData as Source[]
      setSources(srcs)

      const grouped: Record<string, Material[]> = {}
      for (const mat of materialsData as Material[]) {
        if (!grouped[mat.sourceId]) grouped[mat.sourceId] = []
        grouped[mat.sourceId].push(mat)
      }
      setMaterialsBySource(grouped)
    })
  }, [])

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#2c3e50', padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>珠子图鉴</Text>
      </View>

      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {sources.map((source) => {
          const mats = materialsBySource[source.id] || []
          const collected = 0 // todo: 接入已收集数据
          return (
            <View key={source.id} style={{ marginBottom: 16 }}>
              {/* 采集源标题 */}
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>{source.icon}</Text>
                <Text style={{ fontSize: 15, fontWeight: 600, color: '#2c3e50' }}>{source.name}</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 11, color: '#ccc' }}>{collected}/{mats.length}</Text>
              </View>

              {/* 材料网格 */}
              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {mats.map((mat) => (
                  <View key={mat.id} style={{
                    width: 'calc(25% - 6px)', padding: 8,
                    backgroundColor: '#ffffff', borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4,
                  }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 8,
                      backgroundColor: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#ccc', overflow: 'hidden',
                    }}>
                      {mat.imageUrl
                        ? <img src={`/images/beads/${mat.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📦'
                      }
                    </View>
                    <Text style={{ fontSize: 10, color: '#666', textAlign: 'center', lineHeight: 1.2 }}>{mat.name}</Text>
                    <Text style={{
                      fontSize: 8, padding: '1px 4px', borderRadius: 3,
                      color: '#fff',
                      backgroundColor: RARITY_COLORS[mat.rarity] || '#999',
                    }}>
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
