import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme, card, btnPrimary } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

type Step = 'source' | 'material' | 'process' | 'result'
type Source = { id: string; name: string; icon: string; description: string }
type Material = { id: string; name: string; sourceId: string; rarity: string; processMs: number; imageUrl: string }

const RARITY_COLORS: Record<string, string> = { common: '#c4b89e', uncommon: '#5ba3e6', rare: '#c8a96e', legendary: '#e05a5a' }
const RARITY_LABELS: Record<string, string> = { common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说' }
const STEP_KEYS = ['source', 'material', 'process', 'result']
const STEP_LABELS = ['选择采集源', '选择原料', '加工中', '完成']

const ANIM_KEYFRAMES = `
@keyframes anim-cut { 0%{transform:scale(1) rotate(0deg)} 25%{transform:scale(.9) rotate(10deg)} 50%{transform:scale(1.1) rotate(-5deg)} 75%{transform:scale(.95) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
@keyframes anim-grind { 0%{transform:rotate(0deg)scale(1)} 33%{transform:rotate(120deg)scale(.8)} 66%{transform:rotate(240deg)scale(1.1)} 100%{transform:rotate(360deg)scale(1)} }
@keyframes anim-polish { 0%{filter:brightness(1)} 50%{filter:brightness(1.5)} 100%{filter:brightness(1)} }
@keyframes anim-fade-in { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
`

export default function Workshop() {
  const [step, setStep] = useState<Step>('source')
  const [sources, setSources] = useState<Source[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [phase, setPhase] = useState<'idle' | 'cut' | 'grind' | 'polish'>('idle')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    api('/raw-materials/sources').then(d => { if (Array.isArray(d)) setSources(d) })
    api('/user/raw-materials').then(d => { if (Array.isArray(d)) setInventory(d.filter((x: any) => x.count > 0)) })
  }, [])

  const selectSource = useCallback(async (s: Source) => {
    setSelectedSource(s)
    setStep('material')
    const d = await api(`/raw-materials?sourceId=${s.id}`)
    if (Array.isArray(d)) setMaterials(d)
  }, [])

  const selectMaterial = useCallback((m: Material) => {
    setSelectedMaterial(m)
    setStep('process')
    setPhase('cut')
    const dur = m.processMs || 7000
    const pd = dur / 3
    setTimeout(() => setPhase('grind'), pd)
    setTimeout(() => setPhase('polish'), pd * 2)
    setTimeout(() => runProcess(m.id), dur)
  }, [])

  const runProcess = async (id: string) => {
    const r = await api('/user/process', { method: 'POST', body: JSON.stringify({ materialTypeId: id }) })
    setResult(r)
    setStep('result')
    api('/user/raw-materials').then(d => { if (Array.isArray(d)) setInventory(d.filter((x: any) => x.count > 0)) })
  }

  const reset = () => { setStep('source'); setSelectedSource(null); setSelectedMaterial(null); setPhase('idle'); setResult(null) }
  const goBack = () => Taro.navigateBack()

  return (
    <View style={{ minHeight: '100vh', backgroundColor: theme.bgPage }}>
      <style>{ANIM_KEYFRAMES}</style>

      {/* 头部 */}
      <View style={{ backgroundColor: theme.textPrimary, padding: '12px 16px' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, display: 'flex' }}>
          <Text onClick={goBack} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
          <Text style={{ fontSize: 16, fontWeight: 700, color: theme.bgCard }}>工作室</Text>
          <View style={{ flex: 1 }} />
          <Text onClick={reset} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>重置</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {STEP_LABELS.map((label, i) => {
            const cur = STEP_KEYS.indexOf(step)
            const active = i <= cur
            return (
              <View key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <View style={{ width: '100%', height: 3, borderRadius: 2, backgroundColor: active ? theme.primary : 'rgba(255,255,255,0.15)' }} />
                <Text style={{ fontSize: 10, color: active ? theme.primary : 'rgba(255,255,255,0.4)' }}>{label}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* 库存 */}
      {inventory.length > 0 && (
        <View style={{ margin: 8, padding: '6px 10px', ...card, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          <Text style={{ fontSize: 10, color: theme.textSecondary, whiteSpace: 'nowrap' }}>库存:</Text>
          {inventory.map((i: any) => (
            <View key={i.materialTypeId} style={{ padding: '2px 6px', borderRadius: theme.radiusSmall, backgroundColor: theme.bgCard, fontSize: 10, whiteSpace: 'nowrap' }}>
              {i.name} x{i.count}
            </View>
          ))}
        </View>
      )}

      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {/* Step 1: Sources */}
        {step === 'source' && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 12 }}>从哪里采集原料？</Text>
            {sources.map(s => (
              <View key={s.id} onClick={() => selectSource(s)} style={{ padding: '14px 16px', marginBottom: 10, ...card, display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
                <Text style={{ fontSize: 28, marginRight: 14 }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>{s.description}</Text>
                </View>
                <Text style={{ fontSize: 16, color: theme.textDisabled }}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 2: Materials */}
        {step === 'material' && selectedSource && (
          <View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text onClick={() => setStep('source')} style={{ fontSize: 14, color: theme.textSecondary, cursor: 'pointer', marginRight: 6 }}>← 返回</Text>
              <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>{selectedSource.icon} {selectedSource.name}</Text>
            </View>
            {materials.map(m => (
              <View key={m.id} onClick={() => selectMaterial(m)} style={{ padding: '12px 14px', marginBottom: 8, ...card, display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
                <View style={{ width: 44, height: 44, borderRadius: theme.radiusSmall, marginRight: 12, backgroundColor: theme.bgWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {m.imageUrl ? <img src={`/images/beads/${m.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{m.name}</Text>
                  <Text style={{ fontSize: 10, marginTop: 2, color: RARITY_COLORS[m.rarity] || theme.textSecondary }}>{RARITY_LABELS[m.rarity] || m.rarity}</Text>
                </View>
                <Text style={{ fontSize: 10, color: theme.textDisabled }}>{(m.processMs / 1000).toFixed(0)}s</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 3: Processing */}
        {step === 'process' && selectedMaterial && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>{phase === 'cut' ? '切割中...' : phase === 'grind' ? '打磨中...' : '抛光中...'}</Text>
            <View style={{
              width: 120, height: 120, borderRadius: '50%', backgroundColor: theme.bgCard, border: `3px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              animation: phase === 'cut' ? 'anim-cut .6s ease-in-out infinite' : phase === 'grind' ? 'anim-grind .5s linear infinite' : phase === 'polish' ? 'anim-polish .8s ease-in-out infinite' : 'none',
            }}>
              <Text style={{ fontSize: 40 }}>{phase === 'cut' ? '✂️' : phase === 'grind' ? '💎' : '✨'}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>{selectedMaterial.name}</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>三段加工: 切割→打磨→抛光{'\n'}每步有失败概率</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
              {['cut', 'grind', 'polish'].map(p => {
                const idx = ['cut', 'grind', 'polish']
                const done = idx.indexOf(phase) >= idx.indexOf(p)
                const cur = phase === p
                return <View key={p} style={{ padding: '4px 10px', borderRadius: theme.radiusPill, backgroundColor: cur ? theme.textPrimary : done ? theme.primary : theme.border }}>
                  <Text style={{ fontSize: 10, color: done ? theme.bgCard : theme.textDisabled }}>{p === 'cut' ? '切割' : p === 'grind' ? '打磨' : '抛光'}</Text>
                </View>
              })}
            </View>
          </View>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: result.success ? theme.primary : theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, animation: 'anim-fade-in .5s ease-out' }}>
              <Text style={{ fontSize: 36 }}>{result.success ? '🎉' : '💔'}</Text>
            </View>
            {result.success ? (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>加工成功!</Text>
                <Text style={{ fontSize: 13, color: theme.textBody }}>获得: {result.materialType}</Text>
              </View>
            ) : (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textDisabled, marginBottom: 4 }}>加工失败</Text>
                {result.step && <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>在「{result.step === 'cut' ? '切割' : result.step === 'grind' ? '打磨' : '抛光'}」阶段失败了</Text>}
                <Text style={{ fontSize: 12, color: theme.primary }}>获得废料: {result.wasteType}</Text>
              </View>
            )}
            <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View onClick={reset} style={{ ...btnPrimary, padding: '10px 24px' }}><Text style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary }}>继续加工</Text></View>
              <View onClick={goBack} style={{ padding: '10px 24px', borderRadius: theme.radiusPill, backgroundColor: theme.bgCard, border: `2px solid ${theme.border}`, cursor: 'pointer' }}><Text style={{ fontSize: 14, color: theme.textBody }}>返回首页</Text></View>
            </View>
            <View style={{ marginTop: 24, width: '100%', padding: 14, ...card }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, marginBottom: 8 }}>我的原料库存</Text>
              {inventory.length === 0 ? (
                <Text style={{ fontSize: 12, color: theme.textDisabled, textAlign: 'center', padding: '16px 0' }}>还没有原料，去首页领每日盲盒吧</Text>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {inventory.map((i: any) => (
                    <View key={i.materialTypeId} style={{ padding: '6px 10px', borderRadius: theme.radiusSmall, backgroundColor: theme.bgPage, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: theme.textPrimary }}>{i.name}</Text>
                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>x{i.count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
