import { useCallback, useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  return res.json()
}

type Step = 'source' | 'material' | 'process' | 'result'

const RARITY: Record<string, string> = { common: '#bbb9a9', uncommon: '#7db8d4', rare: theme.accent, legendary: theme.error }
const RLABEL: Record<string, string> = { common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说' }
const STEPS = ['source', 'material', 'process', 'result']
const SLABEL = ['选源', '选料', '加工', '完成']

const SRC_ICO: Record<string, string> = { crystal: 'CR', jade: 'JD', forest: 'FR', orchard: 'OR', beach: 'BC', workshop: 'WS' }

const ANIM = `
@keyframes cut-a {0%{transform:scale(1)}25%{transform:scale(.9)rotate(8deg)}50%{transform:scale(1.1)rotate(-5deg)}75%{transform:scale(.95)rotate(5deg)}100%{transform:scale(1)}}
@keyframes grind-a {0%{transform:rotate(0deg)}33%{transform:rotate(120deg)}66%{transform:rotate(240deg)}100%{transform:rotate(360deg)}}
@keyframes polish-a {0%{filter:brightness(1)}50%{filter:brightness(1.4)}100%{filter:brightness(1)}}
@keyframes fade-in {from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
`

export default function Workshop() {
  const [step, setStep] = useState<Step>('source')
  const [sources, setSources] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [src, setSrc] = useState<any>(null)
  const [mat, setMat] = useState<any>(null)
  const [inv, setInv] = useState<any[]>([])
  const [phase, setPhase] = useState<'idle'|'cut'|'grind'|'polish'>('idle')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    api('/raw-materials/sources').then((d: any[]) => {
      if (!Array.isArray(d)) return
      setSources(d)
      // 检查 URL 参数，预选采集源
      const params = Taro.getCurrentInstance().router?.params
      if (params?.source) {
        const found = d.find((s: any) => s.id === params.source)
        if (found) pickSrc(found)
      }
    })
    api('/user/raw-materials').then(d => Array.isArray(d) && setInv(d.filter((x: any) => x.count > 0)))
  }, [])

  const pickSrc = useCallback(async (s: any) => {
    setSrc(s); setStep('material')
    const d = await api(`/raw-materials?sourceId=${s.id}`)
    Array.isArray(d) && setMaterials(d)
  }, [])

  const pickMat = useCallback((m: any) => {
    setMat(m); setStep('process'); setPhase('cut')
    const dur = m.processMs || 7000, pd = dur / 3
    setTimeout(() => setPhase('grind'), pd)
    setTimeout(() => setPhase('polish'), pd * 2)
    setTimeout(() => run(m.id), dur)
  }, [])

  const run = async (id: string) => {
    const r = await api('/user/process', { method: 'POST', body: JSON.stringify({ materialTypeId: id }) })
    setResult(r); setStep('result')
    api('/user/raw-materials').then(d => Array.isArray(d) && setInv(d.filter((x: any) => x.count > 0)))
  }

  const reset = () => { setStep('source'); setSrc(null); setMat(null); setPhase('idle'); setResult(null) }
  const back = () => Taro.navigateBack()

  const Bar = () => (
    <View style={{ background: theme.textPrimary, padding: '14px 16px 10px' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, display: 'flex' }}>
        <Text onClick={back} style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginRight: 12, cursor: 'pointer' }}>←</Text>
        <Text style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>工作室</Text>
        <View style={{ flex: 1 }} />
        <Text onClick={reset} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>重置</Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        {SLABEL.map((l, i) => {
          const cur = STEPS.indexOf(step), active = i <= cur
          return (
            <View key={l} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
              <View style={{ width: '100%', height: 3, borderRadius: 2, background: active ? theme.primary : 'rgba(255,255,255,0.1)' }} />
              <Text style={{ fontSize: 10, color: active ? theme.primary : 'rgba(255,255,255,0.25)' }}>{l}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )

  return (
    <View style={{ minHeight: '100vh', background: theme.bgPage }}>
      <style>{ANIM}</style>
      <Bar />

      {/* Inventory */}
      {inv.length > 0 && (
        <View style={{ margin: '8px 12px', padding: '8px 12px', background: theme.bgCard, borderRadius: theme.radiusSmall, border: `1px solid ${theme.borderLight}`, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
          <Text style={{ fontSize: 10, color: theme.textSecondary, whiteSpace: 'nowrap' }}>库存</Text>
          {inv.map((i: any) => (
            <View key={i.materialTypeId} style={{ padding: '3px 8px', borderRadius: theme.radiusTag, background: theme.primaryLight, whiteSpace: 'nowrap' }}>
              <Text style={{ fontSize: 10, color: theme.primaryDark }}>{i.name} x{i.count}</Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView scrollY style={{ flex: 1, padding: '16px' }}>
        {/* Step 1: Sources */}
        {step === 'source' && (
          <View>
            <Text style={{ fontSize: 17, fontWeight: 700, color: theme.textPrimary, marginBottom: 16 }}>从哪里采集原料?</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {sources.map(s => (
                <View key={s.id} onClick={() => pickSrc(s)} style={{ width: 'calc(50% - 6px)', padding: '16px 14px', background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, cursor: 'pointer', boxShadow: `0 2px 8px ${theme.shadow}` }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: 800, color: theme.primaryDark, letterSpacing: 1 }}>{SRC_ICO[s.id] || '?'}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 4 }}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>{s.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Materials */}
        {step === 'material' && src && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, display: 'flex' }}>
              <Text onClick={() => setStep('source')} style={{ fontSize: 14, color: theme.textSecondary, cursor: 'pointer', marginRight: 10 }}>← 返回</Text>
              <Text style={{ fontSize: 17, fontWeight: 700, color: theme.textPrimary }}>{src.name}</Text>
            </View>
            {materials.map(m => (
              <View key={m.id} onClick={() => pickMat(m)} style={{ padding: '12px 14px', marginBottom: 10, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}`, display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', boxShadow: `0 1px 4px ${theme.shadow}` }}>
                <View style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12, background: theme.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {m.imageUrl ? <Image src={`/images/beads/${m.imageUrl}`} style={{ width: '100%', height: '100%' }} mode='aspectFit' /> : <Text style={{ fontSize: 10, color: theme.textDisabled }}>img</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{m.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 10, padding: '2px 7px', borderRadius: theme.radiusTag, color: '#fff', background: RARITY[m.rarity] || theme.textSecondary }}>{RLABEL[m.rarity] || m.rarity}</Text>
                    <Text style={{ fontSize: 10, color: theme.textDisabled, lineHeight: '18px' }}>{Math.round(m.processMs / 1000)}s</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 16, color: theme.border }}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 3: Process */}
        {step === 'process' && mat && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 24 }}>{phase === 'cut' ? '切割中' : phase === 'grind' ? '打磨中' : '抛光中'}</Text>
            <View style={{
              width: 110, height: 110, borderRadius: '50%', background: theme.bgCard, border: `4px solid ${theme.borderLight}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              boxShadow: `0 4px 20px ${theme.shadow}`,
              animation: phase === 'cut' ? 'cut-a .6s ease-in-out infinite' : phase === 'grind' ? 'grind-a .5s linear infinite' : phase === 'polish' ? 'polish-a .8s ease-in-out infinite' : 'none',
            }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 800, letterSpacing: 1 }}>{phase === 'cut' ? '切' : phase === 'grind' ? '磨' : '亮'}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, marginBottom: 8 }}>{mat.name}</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>三段加工: 切割 → 打磨 → 抛光</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
              {['cut', 'grind', 'polish'].map(p => {
                const idx = ['cut', 'grind', 'polish'], cur = phase === p, done = idx.indexOf(phase) >= idx.indexOf(p)
                return <View key={p} style={{ padding: '5px 14px', borderRadius: theme.radiusTag, background: cur ? theme.textPrimary : done ? theme.primary : theme.border }}>
                  <Text style={{ fontSize: 11, color: done ? '#fff' : theme.textDisabled, fontWeight: cur ? 600 : 400 }}>{p === 'cut' ? '切割' : p === 'grind' ? '打磨' : '抛光'}</Text>
                </View>
              })}
            </View>
          </View>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <View style={{ paddingTop: 32 }}>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 80, height: 80, borderRadius: '50%', background: result.success ? theme.primary : theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, animation: 'fade-in .5s ease-out', boxShadow: `0 4px 20px ${theme.shadow}` }}>
                <Text style={{ fontSize: 24, color: '#fff', fontWeight: 800 }}>{result.success ? 'OK' : '--'}</Text>
              </View>
              {result.success ? (
                <View style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, marginBottom: 6 }}>加工成功!</Text>
                  <Text style={{ fontSize: 14, color: theme.textBody }}>获得  {result.materialType}</Text>
                </View>
              ) : (
                <View style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textDisabled, marginBottom: 6 }}>加工失败</Text>
                  {result.step && <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>在{result.step === 'cut' ? '切割' : result.step === 'grind' ? '打磨' : '抛光'}阶段失败了</Text>}
                  <Text style={{ fontSize: 13, color: theme.error }}>获得废料</Text>
                </View>
              )}
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
              <View onClick={reset} style={{ background: theme.primary, borderRadius: theme.radiusBtn, padding: '14px 32px', cursor: 'pointer' }}>
                <Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>继续加工</Text>
              </View>
              <View onClick={back} style={{ padding: '14px 32px', borderRadius: theme.radiusBtn, background: theme.bgCard, border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                <Text style={{ fontSize: 14, color: theme.textBody }}>返回首页</Text>
              </View>
            </View>
            <View style={{ padding: 16, background: theme.bgCard, borderRadius: theme.radiusCard, border: `1px solid ${theme.borderLight}` }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>原料库存</Text>
              {inv.length === 0 ? (
                <Text style={{ fontSize: 12, color: theme.textDisabled, textAlign: 'center', padding: '16px 0' }}>还没有原料 去首页领每日盲盒</Text>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {inv.map((i: any) => (
                    <View key={i.materialTypeId} style={{ padding: '6px 10px', borderRadius: theme.radiusTag, background: theme.bgPage }}>
                      <Text style={{ fontSize: 11, color: theme.textPrimary }}>{i.name}  x{i.count}</Text>
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
