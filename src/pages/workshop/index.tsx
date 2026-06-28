import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

type Step = 'source' | 'material' | 'process' | 'result'
type Source = { id: string; name: string; icon: string; description: string }
type Material = { id: string; name: string; sourceId: string; rarity: string; processMs: number; imageUrl: string }

const RARITY_COLORS: Record<string, string> = { common: theme.border, uncommon: '#7db8d4', rare: theme.accent, legendary: theme.error }
const RARITY_LABELS: Record<string, string> = { common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说' }
const STEP_KEYS = ['source', 'material', 'process', 'result']
const STEP_LABELS = ['选源', '选料', '加工', '完成']

const SOURCE_ICONS: Record<string, string> = {
  crystal: 'cr', jade: 'jd', forest: 'fr', orchard: 'or', beach: 'bc', workshop: 'ws',
}

const ANIM = `
@keyframes cut-a { 0%{transform:scale(1)} 25%{transform:scale(.9) rotate(8deg)} 50%{transform:scale(1.1)rotate(-5deg)} 75%{transform:scale(.95)rotate(5deg)} 100%{transform:scale(1)} }
@keyframes grind-a { 0%{transform:rotate(0deg)} 33%{transform:rotate(120deg)} 66%{transform:rotate(240deg)} 100%{transform:rotate(360deg)} }
@keyframes polish-a { 0%{filter:brightness(1)} 50%{filter:brightness(1.4)} 100%{filter:brightness(1)} }
@keyframes fade-in { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
`

const btn = { background: theme.primary, borderRadius: theme.radiusBtn, padding: '12px 24px', display: 'flex' as any, alignItems: 'center' as any, justifyContent: 'center' as any, cursor: 'pointer' }

export default function Workshop() {
  const [step, setStep] = useState<Step>('source')
  const [sources, setSources] = useState<Source[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selSource, setSelSource] = useState<Source | null>(null)
  const [selMat, setSelMat] = useState<Material | null>(null)
  const [inv, setInv] = useState<any[]>([])
  const [phase, setPhase] = useState<'idle' | 'cut' | 'grind' | 'polish'>('idle')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    api('/raw-materials/sources').then(d => { if (Array.isArray(d)) setSources(d) })
    api('/user/raw-materials').then(d => { if (Array.isArray(d)) setInv(d.filter((x: any) => x.count > 0)) })
  }, [])

  const pickSource = useCallback(async (s: Source) => {
    setSelSource(s); setStep('material')
    const d = await api(`/raw-materials?sourceId=${s.id}`)
    if (Array.isArray(d)) setMaterials(d)
  }, [])

  const pickMat = useCallback((m: Material) => {
    setSelMat(m); setStep('process'); setPhase('cut')
    const dur = m.processMs || 7000, pd = dur / 3
    setTimeout(() => setPhase('grind'), pd)
    setTimeout(() => setPhase('polish'), pd * 2)
    setTimeout(() => runProcess(m.id), dur)
  }, [])

  const runProcess = async (id: string) => {
    const r = await api('/user/process', { method: 'POST', body: JSON.stringify({ materialTypeId: id }) })
    setResult(r); setStep('result')
    api('/user/raw-materials').then(d => { if (Array.isArray(d)) setInv(d.filter((x: any) => x.count > 0)) })
  }

  const reset = () => { setStep('source'); setSelSource(null); setSelMat(null); setPhase('idle'); setResult(null) }
  const goBack = () => Taro.navigateBack()

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }}>
      <style>{ANIM}</style>

      {/* Header */}
      <View style={{ background: theme.textPrimary, padding: '12px 16px' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, display: 'flex' }}>
          <Text onClick={goBack} style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginRight: 12, cursor: 'pointer' }}>←</Text>
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>工作室</Text>
          <View style={{ flex: 1 }} />
          <Text onClick={reset} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>重置</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {STEP_LABELS.map((l, i) => {
            const cur = STEP_KEYS.indexOf(step), active = i <= cur
            return (
              <View key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <View style={{ width: '100%', height: 2, borderRadius: 1, background: active ? theme.primary : 'rgba(255,255,255,0.12)' }} />
                <Text style={{ fontSize: 9, color: active ? theme.primary : 'rgba(255,255,255,0.3)' }}>{l}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Inventory bar */}
      {inv.length > 0 && (
        <View style={{ margin: 8, padding: '6px 10px', background: theme.bgCard, borderRadius: theme.radiusSmall, border: `1px solid ${theme.borderLight}`, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          <Text style={{ fontSize: 9, color: theme.textSecondary, whiteSpace: 'nowrap' }}>库存:</Text>
          {inv.map((i: any) => (
            <View key={i.materialTypeId} style={{ padding: '2px 6px', borderRadius: theme.radiusTag, background: theme.primaryLight, fontSize: 9, whiteSpace: 'nowrap' }}>{i.name} x{i.count}</View>
          ))}
        </View>
      )}

      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {/* Step 1: Sources */}
        {step === 'source' && (
          <View>
            <Text style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>从哪里采集原料?</Text>
            {/* 2x3 grid */}
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {sources.map(s => (
                <View key={s.id} onClick={() => pickSource(s)} style={{ width: 'calc(50% - 5px)', padding: '14px 12px', background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, cursor: 'pointer', boxShadow: `0 2px 6px ${theme.shadow}` }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: theme.primaryDark }}>{SOURCE_ICONS[s.id] || '?'}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 2 }}>{s.name}</Text>
                  <Text style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.4 }} numberOfLines={2}>{s.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Materials */}
        {step === 'material' && selSource && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, display: 'flex' }}>
              <Text onClick={() => setStep('source')} style={{ fontSize: 13, color: theme.textSecondary, cursor: 'pointer', marginRight: 8 }}>← 返回</Text>
              <Text style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{selSource.name}</Text>
            </View>
            {materials.map(m => (
              <View key={m.id} onClick={() => pickMat(m)} style={{ padding: '10px 12px', marginBottom: 8, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
                <View style={{ width: 40, height: 40, borderRadius: theme.radiusSmall, marginRight: 10, background: theme.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {m.imageUrl ? <Image src={`/images/beads/${m.imageUrl}`} style={{ width: '100%', height: '100%' }} mode='aspectFit' /> : <Text style={{ fontSize: 9, color: theme.textDisabled }}>img</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: theme.textPrimary }}>{m.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 9, padding: '1px 5px', borderRadius: theme.radiusTag, color: '#fff', background: RARITY_COLORS[m.rarity] || theme.textSecondary }}>{RARITY_LABELS[m.rarity] || m.rarity}</Text>
                    <Text style={{ fontSize: 9, color: theme.textDisabled }}>{(m.processMs / 1000).toFixed(0)}s</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: theme.border }}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 3: Processing */}
        {step === 'process' && selMat && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>{phase === 'cut' ? '切割中' : phase === 'grind' ? '打磨中' : '抛光中'}</Text>
            <View style={{
              width: 100, height: 100, borderRadius: '50%', background: theme.bgCard, border: `3px solid ${theme.borderLight}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              animation: phase === 'cut' ? 'cut-a .6s ease-in-out infinite' : phase === 'grind' ? 'grind-a .5s linear infinite' : phase === 'polish' ? 'polish-a .8s ease-in-out infinite' : 'none',
            }}>
              <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 700 }}>{phase === 'cut' ? '切' : phase === 'grind' ? '磨' : '光'}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 4 }}>{selMat.name}</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.5, marginBottom: 16 }}>三段加工 切割 / 打磨 / 抛光</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
              {['cut', 'grind', 'polish'].map(p => {
                const idx = ['cut', 'grind', 'polish'], cur = phase === p, done = idx.indexOf(phase) >= idx.indexOf(p)
                return <View key={p} style={{ padding: '3px 10px', borderRadius: theme.radiusTag, background: cur ? theme.textPrimary : done ? theme.primary : theme.border }}>
                  <Text style={{ fontSize: 9, color: done ? '#fff' : theme.textDisabled }}>{p === 'cut' ? '切割' : p === 'grind' ? '打磨' : '抛光'}</Text>
                </View>
              })}
            </View>
          </View>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
            <View style={{ width: 72, height: 72, borderRadius: '50%', background: result.success ? theme.primary : theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, animation: 'fade-in .5s ease-out' }}>
              <Text style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>{result.success ? 'OK' : '--'}</Text>
            </View>
            {result.success ? (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>加工成功!</Text>
                <Text style={{ fontSize: 12, color: theme.textBody }}>获得: {result.materialType}</Text>
              </View>
            ) : (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textDisabled, marginBottom: 4 }}>加工失败</Text>
                {result.step && <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>在{result.step === 'cut' ? '切割' : result.step === 'grind' ? '打磨' : '抛光'}阶段失败了</Text>}
                <Text style={{ fontSize: 11, color: theme.error }}>获得废料</Text>
              </View>
            )}
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <View onClick={reset} style={btn}><Text style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>继续加工</Text></View>
              <View onClick={goBack} style={{ padding: '12px 24px', borderRadius: theme.radiusBtn, background: theme.bgCard, border: `1px solid ${theme.border}`, cursor: 'pointer' }}><Text style={{ fontSize: 13, color: theme.textBody }}>返回首页</Text></View>
            </View>
            <View style={{ marginTop: 20, width: '100%', padding: 14, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}` }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>原料库存</Text>
              {inv.length === 0 ? (
                <Text style={{ fontSize: 11, color: theme.textDisabled, textAlign: 'center', padding: '12px 0' }}>还没有原料 去首页领每日盲盒</Text>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {inv.map((i: any) => (
                    <View key={i.materialTypeId} style={{ padding: '4px 8px', borderRadius: theme.radiusTag, background: theme.bgPage }}>
                      <Text style={{ fontSize: 10, color: theme.textPrimary }}>{i.name}</Text>
                      <Text style={{ fontSize: 9, color: theme.textSecondary }}>x{i.count}</Text>
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
