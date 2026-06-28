import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { SCENES } from '@/pages/scene/configs'
import { playSound, playRareSound, preloadSounds, resumeAudio } from '@/lib/sound'
import { addToBackpack, getBackpack } from '@/lib/backpack'
import { addBead } from '@/lib/inventory'

const KF = `
@keyframes bar-shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes bar-pop {0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes bar-glow {0%,100%{opacity:.5}50%{opacity:1}}
`

// 加工步骤配置
const PROC: Record<string, { steps: string[]; widths: number[]; label: string }> = {
  crystal: { steps: ['切割', '抛光'], widths: [35, 30], label: '水晶' },
  jade: { steps: ['切刀', '雕刻'], widths: [32, 28], label: '玉石' },
  forest: { steps: ['去皮', '打磨', '上油'], widths: [38, 30, 25], label: '木料' },
  orchard: { steps: ['清洗', '取种', '晾干'], widths: [40, 30, 22], label: '果料' },
  beach: { steps: ['清洗', '钻孔'], widths: [42, 30], label: '贝壳' },
  workshop: { steps: ['揉土', '塑形', '烧制'], widths: [40, 30, 20], label: '人工料' },
}

// 原料颜色映射
const COLORS: Record<string, { c: string; g: string; n: string }> = {
  white: { c: '#e8f0ff', g: '#a0c4ff', n: '白水晶' },
  purple: { c: '#e8d0ff', g: '#b388ff', n: '紫晶' },
  pink: { c: '#ffd0e8', g: '#ff80ab', n: '粉晶' },
  gold: { c: '#fff0c0', g: '#ffd54f', n: '发晶' },
  green: { c: '#d0ffd0', g: '#69f0ae', n: '绿幽灵' },
  blue: { c: '#d0f0ff', g: '#40c4ff', n: '海蓝宝' },
  jade_green: { c: '#c8e0c8', g: '#90c890', n: '翡翠玉' },
  jade_white: { c: '#e8e0d0', g: '#d4c8a0', n: '白玉' },
  wood_root: { c: '#e8d8c0', g: '#b89870', n: '树根料' },
  bark: { c: '#d8c8a8', g: '#a08860', n: '树皮料' },
  fruit_seed: { c: '#f0e0c0', g: '#d4a070', n: '果种料' },
  fruit_pulp: { c: '#f0d0c0', g: '#d48860', n: '果肉料' },
  shell: { c: '#e0e8f0', g: '#a8c8e0', n: '贝壳料' },
  pebble: { c: '#d8d0c8', g: '#a09888', n: '卵石料' },
  artificial_clay: { c: '#e8e0d0', g: '#c0a888', n: '人工黏土' },
  artificial_resin: { c: '#f0e8d8', g: '#d4b898', n: '树脂料' },
  scrap: { c: '#d0c8b8', g: '#a09888', n: '废料' },
}

const BASE_URL = 'http://localhost:3000'
async function api(path: string, options?: RequestInit) {
  const token = Taro.getStorageSync('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers })
    return res.json()
  } catch { return null }
}

export default function ProcessingPage() {
  const p = Taro.getCurrentInstance().router?.params as any
  const source = p?.source || 'crystal'
  const material = p?.material || 'white'
  const rawName = p?.name ? decodeURIComponent(p.name) : '水晶'

  const cfg = SCENES.find(s => s.id === source) || SCENES[0]
  const proc = PROC[source] || PROC.crystal
  const mc = COLORS[material] || COLORS.white

  const [step, setStep] = useState(0)
  const [pos, setPos] = useState(0)
  const [results, setResults] = useState<string[]>([])
  const [phase, setPhase] = useState<'ready' | 'moving' | 'result' | 'done'>('ready')
  const [showBead, setShowBead] = useState(false)
  const [sparks, setSparks] = useState<any[]>([])
  const [saved, setSaved] = useState(false)
  const iv = useRef<any>()
  const dir = useRef(1)

  useEffect(() => { preloadSounds() }, [])
  const firstTap = useRef(true)
  const wakeAudio = useCallback(() => {
    if (firstTap.current) { firstTap.current = false; resumeAudio() }
  }, [])

  const startMove = useCallback(() => {
    wakeAudio()
    setPhase('moving'); dir.current = 1; setPos(0)
    playSound('whoosh', 0.3)
    iv.current = setInterval(() => {
      setPos(prev => { let n = prev + 2.5 * dir.current; if (n >= 100) { dir.current = -1; n = 100 } if (n <= 0) { dir.current = 1; n = 0 } return n })
    }, 30)
  }, [])

  const tapBar = useCallback(() => {
    if (phase !== 'moving') return
    clearInterval(iv.current)
    const dist = Math.abs(pos - 50)
    const gw = proc.widths[step] / 2
    let q: string
    if (dist <= gw) {
      q = 'perfect'; playSound('chime1', 0.5)
      const sp = Array.from({ length: 6 }, (_, i) => ({ id: Date.now() + i, dx: (Math.random() - .5) * 70, dy: -Math.random() * 60, color: mc.g }))
      setSparks(sp); setTimeout(() => setSparks([]), 400)
    } else if (dist <= gw + 15) { q = 'good'; playSound('coin', 0.4) }
    else { q = 'miss'; playSound('click_error', 0.3) }
    const nr = [...results, q]; setResults(nr); setPhase('result')
    setTimeout(() => {
      if (step + 1 < proc.steps.length) { setStep(s => s + 1); setPhase('ready') }
      else {
        setPhase('done')
        const pc = nr.filter(r => r === 'perfect').length
        if (pc >= 2) playRareSound(); else if (pc >= 1) playSound('complete', 0.6); else playSound('complete', 0.3)
        setTimeout(() => setShowBead(true), 500)
      }
    }, 800)
  }, [phase, step, pos, results, proc])

  // 加工完成：保存珠子 + 消耗原料
  useEffect(() => {
    if (phase === 'done' && showBead && !saved) {
      setSaved(true)
      const pc = results.filter(r => r === 'perfect').length
      const beadName = `${rawName}珠`
      const quality = pc >= 2 ? '稀有' : pc >= 1 ? '普通' : '粗糙'

      // 从背包消耗原料
      const bp = getBackpack()
      const idx = bp.findIndex(i => i.id === material)
      if (idx >= 0) {
        bp[idx].count--
        if (bp[idx].count <= 0) bp.splice(idx, 1)
        Taro.setStorageSync('lingzhu_backpack', JSON.stringify(bp))
      }

      // 保存到本地珠子库存
      addBead(beadName, material, quality)

      // 尝试调用后端 API 保存珠子
      api('/user/me/inventory/add', {
        method: 'POST',
        body: JSON.stringify({ materialType: material, productName: beadName, quality }),
      }).then(r => {
        if (r?.success) playSound('coin', 0.5)
      }).catch(() => {})
    }
  }, [phase, showBead, saved, material, rawName, results])

  const pc = results.filter(r => r === 'perfect').length

  return (
    <div style={{ minHeight: '100vh', background: cfg.bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px', gap: 20 }}>
      <style>{KF}</style>

      <span style={{ fontSize: 17, fontWeight: 700, color: theme.textPrimary }}>加工 {rawName}</span>
      <span style={{ fontSize: 10, color: theme.textSecondary }}>{proc.steps.join(' → ')}</span>

      {/* 原料展示 */}
      <div style={{
        width: 80, height: 80, borderRadius: 18,
        background: `radial-gradient(circle at 40% 35%,${mc.c},${mc.g})`,
        boxShadow: `0 0 24px ${mc.g}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: phase === 'moving' ? 'bar-shake 0.25s ease infinite' : 'bar-glow 1.5s ease infinite'
      }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          {rawName.charAt(0)}</span>
      </div>

      {/* 步骤指示 */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        {proc.steps.map((s, i) => (
          <div key={i} style={{
            padding: '3px 12px', borderRadius: 14,
            background: i < step ? mc.g + '66' : i === step ? mc.g : theme.borderLight,
            opacity: i === step ? 1 : .5
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? '#fff' : theme.textSecondary }}>{s}</span>
          </div>
        ))}
      </div>

      {/* 品质 */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {results.map((r, i) => <span key={i} style={{ fontSize: 16 }}>{r === 'perfect' ? '★' : r === 'good' ? '◎' : '×'}</span>)}
        </div>
      )}

      {/* 进度条 */}
      <div style={{ position: 'relative', width: '85%', height: 50, marginTop: 4 }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, borderRadius: 8, background: theme.borderLight, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: `${50 - proc.widths[step] / 2}%`, width: `${proc.widths[step]}%`, height: '100%',
            background: `linear-gradient(90deg,${mc.g}88,${mc.g},${mc.g}88)`, borderRadius: 3 }} />
          <div style={{ position: 'absolute', top: 0, left: `${50 - (proc.widths[step] / 2 + 15)}%`, width: `${proc.widths[step] + 30}%`, height: '100%',
            background: 'rgba(255,255,255,0.1)', borderLeft: '1px dashed rgba(255,255,255,0.2)', borderRight: '1px dashed rgba(255,255,255,0.2)' }} />
        </div>
        {phase === 'moving' && <div style={{ position: 'absolute', bottom: 20, left: `${pos}%`, transform: 'translateX(-50%)',
          width: 3, height: 24, borderRadius: 2, background: '#fff', boxShadow: `0 0 6px ${mc.g}`, transition: 'left .03s linear' }} />}
        <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)' }}>
          <span style={{ fontSize: 9, color: mc.g, fontWeight: 600 }}>
            {phase === 'ready' ? '点击开始' : phase === 'moving' ? '就是现在!' : ''}
          </span>
        </div>
      </div>

      {/* 按钮 */}
      {phase === 'ready' && <div onClick={startMove} onTouchEnd={startMove}
        onMouseDown={e => { (e.target as HTMLElement).style.transform = 'scale(0.94)' }}
        onMouseUp={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
        style={{ padding: '12px 36px', borderRadius: 25,
        background: `linear-gradient(135deg,${mc.g},${mc.c})`, cursor: 'pointer', boxShadow: `0 4px 14px ${mc.g}55`, touchAction: 'manipulation',
        transition: 'transform 0.15s' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>开始 {proc.steps[step]}</span>
      </div>}
      {phase === 'moving' && <div onClick={tapBar} onTouchEnd={tapBar}
        style={{ padding: '12px 36px', borderRadius: 25,
        background: `linear-gradient(135deg,${mc.g},${cfg.accentColor})`, cursor: 'pointer', boxShadow: `0 4px 14px ${mc.g}55`,
        animation: 'bar-glow 0.6s ease infinite', touchAction: 'manipulation' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>{proc.steps[step]}</span>
      </div>}
      {phase === 'result' && <span style={{ fontSize: 12, color: theme.textSecondary }}>评价中...</span>}

      {/* 火花 */}
      {sparks.map(s => <div key={s.id} style={{ position: 'absolute', left: '50%', top: '32%', width: 4, height: 4, borderRadius: '50%', background: s.color,
        animation: 'bar-pop 0.3s ease-out forwards', '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, zIndex: 5 } as any} />)}

      {/* 完成 */}
      {phase === 'done' && showBead && (
        <div style={{ alignItems: 'center', gap: 8, display: 'flex', flexDirection: 'column', animation: 'bar-pop 0.4s ease-out' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%,${mc.c},${mc.g})`,
            boxShadow: `0 0 20px ${mc.g},0 3px 10px rgba(0,0,0,0.12)`
          }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>{rawName}珠</span>
          <div style={{ padding: '2px 10px', borderRadius: 8, background: pc >= 2 ? `${mc.g}44` : theme.borderLight }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: pc >= 2 ? mc.g : theme.textSecondary }}>
              {pc >= 2 ? '稀有品质' : pc >= 1 ? '普通品质' : '粗糙品质'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <div onClick={() => Taro.navigateBack()} onTouchEnd={() => Taro.navigateBack()} style={{
              padding: '8px 20px', borderRadius: 20, border: `1px solid ${theme.border}`,
              cursor: 'pointer', touchAction: 'manipulation',
            }}>
              <span style={{ fontSize: 12, color: theme.textPrimary }}>返回采集</span>
            </div>
            <div onClick={() => Taro.switchTab({ url: '/pages/collection/index' })} onTouchEnd={() => Taro.switchTab({ url: '/pages/collection/index' })} style={{
              padding: '8px 20px', borderRadius: 20,
              background: `linear-gradient(135deg,${theme.primary},${cfg.accentColor})`,
              cursor: 'pointer', touchAction: 'manipulation',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>查看图鉴</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
