import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { SCENES } from '@/pages/scene/configs'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes g-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
@keyframes g-pop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
@keyframes g-splash { 0%{transform:scale(1);opacity:1} 100%{transform:translateY(40px) scale(1.5);opacity:0} }
@keyframes g-flow { 0%{transform:translateX(120%)} 100%{transform:translateX(-120%)} }
@keyframes g-spark { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
`

// 玉石种类配置（稀有度从低到高）
const JADE_TYPES = [
  { id: 'nephrite', name: '和田玉', color: '#e8e0d0', glow: '#d4c8a0', glowColor: 'rgba(212,200,160,0.6)', weight: 30, size: 32, speed: 70 },
  { id: 'jadeite', name: '翡翠', color: '#c8e0c8', glow: '#90c890', glowColor: 'rgba(144,200,144,0.6)', weight: 25, size: 30, speed: 75 },
  { id: 'agate', name: '玛瑙', color: '#e0c8b0', glow: '#c8a880', glowColor: 'rgba(200,168,128,0.6)', weight: 20, size: 28, speed: 80 },
  { id: 'bixie', name: '碧玉', color: '#b0d8b0', glow: '#70b870', glowColor: 'rgba(112,184,112,0.6)', weight: 15, size: 26, speed: 85 },
  { id: 'dushan', name: '独山玉', color: '#d0c8e0', glow: '#a898d0', glowColor: 'rgba(168,152,208,0.6)', weight: 7, size: 24, speed: 90 },
  { id: 'turquoise', name: '绿松石', color: '#80d0c0', glow: '#40b8a0', glowColor: 'rgba(64,184,160,0.6)', weight: 3, size: 22, speed: 95 },
]

// 假石头（非玉石，混淆用）
const FAKE_TYPES = [
  { color: '#c8c0b8', glow: 'rgba(180,176,168,0.3)', size: 28 },
  { color: '#b8b0a8', glow: 'rgba(160,152,144,0.3)', size: 30 },
  { color: '#d0c8c0', glow: 'rgba(192,184,176,0.3)', size: 32 },
]

function rollJade() {
  const total = JADE_TYPES.reduce((s, j) => s + j.weight, 0)
  let r = Math.random() * total
  for (const j of JADE_TYPES) { r -= j.weight; if (r <= 0) return j }
  return JADE_TYPES[0]
}

const STONE_ROWS = [
  { y: 20, label: '' },
  { y: 45, label: '' },
  { y: 70, label: '' },
]

export default function JadeValleyGame({ onComplete }: { onComplete: (material: string, name: string) => void }) {
  const params = Taro.getCurrentInstance().router?.params as any
  const source = params?.source || 'jade'
  const cfg = SCENES.find(s => s.id === source) || SCENES[0]

  const [stones, setStones] = useState<any[]>([])
  const [result, setResult] = useState<{ id: string, name: string } | null>(null)
  const [state, setState] = useState<'intro' | 'play' | 'checking' | 'result'>('intro')
  const [sparks, setSparks] = useState<any[]>([])
  const [shaking, setShaking] = useState(false)
  const [collected, setCollected] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const idRef = useRef(0)
  const gameOver = useRef(false)

  useEffect(() => { preloadSounds() }, [])

  const startGame = useCallback(() => {
    setState('play')
    gameOver.current = false
    idRef.current = 0

    // 每2秒生成一块石头
    timerRef.current = setInterval(() => {
      if (gameOver.current) return
      const isJade = Math.random() < 0.45
      const row = STONE_ROWS[Math.floor(Math.random() * STONE_ROWS.length)]
      const stone = isJade
        ? { ...rollJade(), isJade: true, id: idRef.current++, y: row.y }
        : { ...FAKE_TYPES[Math.floor(Math.random() * FAKE_TYPES.length)], isJade: false, id: idRef.current++, y: row.y, name: '碎石', speed: 65 + Math.random() * 20 }
      if (!stone.speed) stone.speed = 65 + Math.random() * 20
      stone.x = -10
      stone.animId = `s-${stone.id}`
      setStones(prev => [...prev.slice(-8), stone])
      playSound('water_ripples', 0.15)
    }, 1800)

    // 5 块后结束
    setTimeout(() => {
      gameOver.current = true
      clearInterval(timerRef.current)
      if (collected === 0) {
        setState('intro')
      }
    }, 10000)
  }, [collected])

  // 点击石头
  const tapStone = useCallback((stone: any) => {
    if (gameOver.current || state !== 'play') return
    gameOver.current = true
    clearInterval(timerRef.current)

    if (stone.isJade) {
      // 成功！
      playSound('Splash_Small', 0.4)
      setTimeout(() => {
        const rarityIdx = JADE_TYPES.findIndex(j => j.id === stone.id)
        if (rarityIdx >= 3) playRareSound()
        else playSound('coin', 0.5)
        setSparks(Array.from({ length: 8 }, (_, i) => ({ id: Date.now() + i, dx: (Math.random() - 0.5) * 100, dy: -Math.random() * 80, color: stone.glow })))
        setTimeout(() => setSparks([]), 500)
        setResult({ id: stone.id, name: stone.name })
        setState('result')
        setCollected(c => c + 1)
        setTimeout(() => onComplete(stone.id, stone.name), 1200)
      }, 400)
    } else {
      // 普通石头
      playSound('smack', 0.25)
      setShaking(true)
      setTimeout(() => { setShaking(false); gameOver.current = false; startGame() }, 500)
    }
  }, [state, onComplete, startGame])

  return (
    <View style={{ minHeight: '100vh', background: cfg.bgColor, overflow: 'hidden' }}>
      <style>{KF}</style>

      <View style={{
        position: 'relative', width: '100%', height: '100vh',
        animation: shaking ? 'g-shake 0.3s ease' : 'none',
      }}>
        {/* 水底背景 */}
        <View style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, ${cfg.bgColor}, #d4e8e8, ${cfg.bgColor})`,
        }} />

        {/* 场景信息 */}
        <View style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>{cfg.name}</Text>
          {state === 'intro' && (
            <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>点一下水里的石头，捞起来看看是不是玉</Text>
          )}
        </View>

        {/* 水面波纹 */}
        <View style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '70%', overflow: 'hidden' }}>
          {/* 波纹线条 */}
          {[0, 1, 2].map(i => (
            <View key={i} style={{
              position: 'absolute', top: `${20 + i * 25}%`, left: 0, right: 0,
              height: 1, background: 'rgba(255,255,255,0.3)',
              transform: `translateY(${Math.sin(Date.now() / 1000 + i) * 3}px)`,
            }} />
          ))}

          {/* 流动的石头 */}
          {state === 'play' && stones.map(s => (
            <View
              key={s.animId}
              onClick={() => tapStone(s)}
              style={{
                position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                width: s.size, height: s.size, borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${s.color}, ${s.color}dd)`,
                boxShadow: s.isJade ? `0 0 10px ${s.glow || s.glowColor}` : `0 0 4px ${s.glow}`,
                cursor: 'pointer', zIndex: 5,
                animation: `g-flow ${s.speed ? (100 - s.speed + 3) : 5}s linear forwards`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </View>

        {/* 粒子 */}
        {sparks.map(p => (
          <View key={p.id} style={{
            position: 'absolute', left: '50%', bottom: '40%',
            width: 5, height: 5, borderRadius: '50%', background: p.color,
            animation: `g-spark 0.4s ease-out forwards`,
            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, zIndex: 20,
          } as any} />
        ))}

        {/* 开始按钮 */}
        {state === 'intro' && (
          <View style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6 }}>
              石头从上游流下来{'\n'}手指点一下捞起来看看
            </Text>
            <View
              onClick={() => startGame()}
              style={{
                padding: '12px 36px', borderRadius: theme.radiusBtn,
                background: `linear-gradient(135deg, ${cfg.accentColor}, ${theme.primary})`,
                cursor: 'pointer', boxShadow: `0 4px 16px ${cfg.accentColor}55`,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>开始捡石</Text>
            </View>
          </View>
        )}

        {/* 结果 */}
        {state === 'result' && result && (
          <View style={{ position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', zIndex: 20, animation: 'g-pop 0.4s ease-out' }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, background: `radial-gradient(circle, ${JADE_TYPES.find(j => j.id === result.id)?.color || '#e8e0d0'}, ${JADE_TYPES.find(j => j.id === result.id)?.glow || '#d4c8a0'})`, boxShadow: `0 0 24px ${JADE_TYPES.find(j => j.id === result.id)?.glow || '#d4c8a0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: 900, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>{result.name.charAt(0)}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary }}>获得 {result.name} 原石</Text>
          </View>
        )}

        {/* 角色 */}
        <View style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.6)', background: '#fff' }}>
            <img src={cfg.characterGif} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </View>
          <Text style={{ fontSize: 11, color: theme.textSecondary }}>小熊</Text>
        </View>
      </View>
    </View>
  )
}
