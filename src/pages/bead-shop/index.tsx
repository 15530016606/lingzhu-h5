import { useState, useEffect, useRef } from 'react'
import { View, Text, Canvas, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { drawSingleHandDrawnBead } from '@/lib/renderer'
import { useBeadStore } from '@/lib/store'
import { MATERIALS, BEAD_SIZES_MM, BeadItem, recommendBeadCount } from '@/lib/data'
import { getH5Canvas } from '@/lib/canvas'

let beadIdCounter = 0
const newId = () => `bead_${++beadIdCounter}`

const BeadShopPage = () => {
  const { beads, wristSizeCm, addBead, removeBead, updateBead } = useBeadStore()
  const previewRef = useRef<any>(null)
  const rotRef = useRef(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selecting, setSelecting] = useState<'material' | 'color' | 'size'>('material')
  const [pickMaterial, setPickMaterial] = useState(MATERIALS[0])
  const [pickColor, setPickColor] = useState(MATERIALS[0].colors[0])
  const [pickSize, setPickSize] = useState(8)

  useEffect(() => {
    setPickColor(pickMaterial.colors[0])
  }, [pickMaterial])

  // 实时单颗预览
  useEffect(() => {
    let mounted = true
    const animate = () => {
      if (!mounted) return
      const canvas = getH5Canvas('singlePreview')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const dpr = 2
        const size = 120
        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = size + 'px'
        canvas.style.height = size + 'px'
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, size, size)
        drawSingleHandDrawnBead(canvas, pickColor.hex, pickColor.gradient, 0)
      }
      previewRef.current = requestAnimationFrame(animate)
    }
    previewRef.current = requestAnimationFrame(animate)
    return () => { mounted = false; if (previewRef.current) cancelAnimationFrame(previewRef.current) }
  }, [pickMaterial, pickColor])

  const addCurrentBead = () => {
    addBead({ id: newId(), material: pickMaterial, color: pickColor, sizeMm: pickSize })
  }

  const editBead = (idx: number) => {
    const b = beads[idx]
    setPickMaterial(b.material)
    setPickColor(b.color)
    setPickSize(b.sizeMm)
    setEditingIndex(idx)
    setSelecting('material')
  }

  const saveEdit = () => {
    if (editingIndex === null) return
    updateBead(editingIndex, { id: beads[editingIndex].id, material: pickMaterial, color: pickColor, sizeMm: pickSize })
    setEditingIndex(null)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
  }

  const finishBracelet = () => {
    Taro.navigateTo({ url: '/pages/rope-charm/index' })
  }

  const recommended = recommendBeadCount(wristSizeCm, 8)

  return (
    <View className="min-h-screen bg-[#FFF5F5] px-6 pt-4 flex flex-col">
      {/* 单颗珠子实时预览 */}
      <View className="flex flex-col items-center mb-3">
        <Canvas id="singlePreview" type="2d" style={{ width: '120px', height: '120px' }} />
        <Text className="block text-xs text-[#8B6B6B] mt-2">{pickColor.name}{pickMaterial.name} · {pickSize}mm</Text>
      </View>

      {/* 已选珠子横条 */}
      <View className="mb-4">
        <Text className="block text-xs text-[#C4A0A0] mb-2">已选 {beads.length}/{recommended} 颗</Text>
        <ScrollView scrollX style={{ height: '60px' }}>
          <View className="flex flex-row gap-2 items-center px-1" style={{ height: '56px' }}>
            {beads.map((b, i) => (
              <View key={b.id} className="flex flex-col items-center gap-1" style={{ width: '48px' }}>
                <View
                  className="w-10 h-10 rounded-full border-2 interactive flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${b.color.gradient[1]}, ${b.color.hex})`,
                    borderColor: editingIndex === i ? '#FF6B6B' : '#FFE0E0',
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => editBead(i)}
                />
                <Text className="block text-[9px] text-[#C4A0A0]">{b.sizeMm}mm</Text>
              </View>
            ))}
            {beads.length > 0 && (
              <View
                className="w-10 h-10 rounded-full border-2 border-dashed border-[#FFE0E0] flex items-center justify-center interactive flex-shrink-0"
                onClick={() => { setEditingIndex(null); setPickMaterial(MATERIALS[0]); setPickColor(MATERIALS[0].colors[0]); setPickSize(8) }}
              >
                <Text className="text-lg text-[#C4A0A0]">+</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Tab 选择区 */}
      <View className="flex flex-row gap-1 mb-3">
        {(['material', 'color', 'size'] as const).map((tab) => (
          <View
            key={tab}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center interactive ${
              selecting === tab ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/30' : 'bg-[#FFFFFF] border border-[#FFE0E0]'
            }`}
            onClick={() => setSelecting(tab)}
          >
            <Text className={`block text-xs font-medium ${selecting === tab ? 'text-[#FF6B6B]' : 'text-[#C4A0A0]'}`}>
              {tab === 'material' ? '选材质' : tab === 'color' ? '选颜色' : '选大小'}
            </Text>
          </View>
        ))}
      </View>

      {/* 选项内容 */}
      <ScrollView className="flex-1" scrollY>
        {selecting === 'material' && (
          <View className="grid grid-cols-2 gap-3 pb-4">
            {MATERIALS.map((m) => (
              <View
                key={m.id}
                className={`rounded-xl border p-3 interactive ${
                  pickMaterial.id === m.id ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FFE0E0] bg-[#FFFFFF]'
                }`}
                onClick={() => setPickMaterial(m)}
              >
                <View className="flex flex-col items-center">
                  <View className="w-12 h-12 rounded-full mb-2" style={{
                    background: `radial-gradient(circle at 35% 30%, ${m.colors[0].gradient[1]}, ${m.colors[0].hex})`,
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
                  }} />
                  <Text className="block text-sm font-medium text-[#2D1B14]">{m.name}</Text>
                  <Text className="block text-[10px] text-[#C4A0A0]">{m.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {selecting === 'color' && (
          <View className="grid grid-cols-3 gap-3 pb-4">
            {pickMaterial.colors.map((c, i) => (
              <View
                key={i}
                className={`rounded-xl border p-3 flex flex-col items-center interactive ${
                  pickColor.hex === c.hex ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FFE0E0] bg-[#FFFFFF]'
                }`}
                onClick={() => setPickColor(c)}
              >
                <View className="w-10 h-10 rounded-full mb-1" style={{
                  background: `radial-gradient(circle at 35% 30%, ${c.gradient[1]}, ${c.hex})`,
                  boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
                }} />
                <Text className="block text-xs text-[#2D1B14]">{c.name}</Text>
              </View>
            ))}
          </View>
        )}

        {selecting === 'size' && (
          <View className="flex flex-col gap-3 pb-4">
            {BEAD_SIZES_MM.map((mm) => (
              <View
                key={mm}
                className={`rounded-xl border p-4 flex flex-row items-center gap-4 interactive ${
                  pickSize === mm ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FFE0E0] bg-[#FFFFFF]'
                }`}
                onClick={() => setPickSize(mm)}
              >
                <View className="rounded-full flex items-center justify-center" style={{ width: `${18 + mm}px`, height: `${18 + mm}px`, background: `radial-gradient(circle at 35% 30%, ${pickColor.gradient[1]}, ${pickColor.hex})`, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }} />
                <View className="flex-1">
                  <Text className="block text-base font-medium text-[#2D1B14]">{mm}mm</Text>
                  <Text className="block text-xs text-[#C4A0A0]">
                    {mm <= 6 ? '小巧精致' : mm <= 8 ? '标准尺寸' : mm <= 10 ? '大气醒目' : '个性突出'}
                  </Text>
                </View>
                <Text className="block text-xs text-[#C4A0A0]">{recommendBeadCount(wristSizeCm, mm)}颗</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View className="flex flex-col gap-2 pt-3 pb-6">
        {editingIndex !== null ? (
          <View className="flex flex-row gap-2">
            <View className="flex-1 py-4 rounded-xl flex items-center justify-center border border-[#FFE0E0] interactive" onClick={cancelEdit}>
              <Text className="block text-sm font-medium text-[#C4A0A0]">取消</Text>
            </View>
            <View className="flex-1 py-4 rounded-xl flex items-center justify-center interactive" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }} onClick={saveEdit}>
              <Text className="block text-base font-bold text-[#FFFFFF]">确认修改</Text>
            </View>
          </View>
        ) : (
          <View
            className="w-full py-4 rounded-xl flex items-center justify-center interactive"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF9A9E 100%)' }}
            onClick={addCurrentBead}
          >
            <Text className="block text-base font-bold text-[#FFFFFF]">+ 加入手串（{pickColor.name}{pickMaterial.name}）</Text>
          </View>
        )}
        <View
          className={`w-full py-3 rounded-xl flex items-center justify-center interactive ${beads.length >= 1 ? 'border border-[#FF6B6B]' : 'border border-[#FFE0E0]'}`}
          onClick={beads.length >= 1 ? finishBracelet : undefined}
        >
          <Text className={`block text-sm font-medium ${beads.length >= 1 ? 'text-[#FF6B6B]' : 'text-[#C4A0A0]'}`}>
            完成编串（{beads.length}颗）
          </Text>
        </View>
      </View>
    </View>
  )
}

export default BeadShopPage
