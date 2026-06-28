import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes f-fall {0%{transform:translateY(-60px);opacity:1}100%{transform:translateY(calc(100vh - 100px));opacity:1}}
@keyframes f-pop {0%{transform:scale(1);opacity:1}40%{transform:scale(1.5)}100%{transform:scale(0);opacity:0}}
@keyframes f-shake {0%,100%{opacity:1}50%{opacity:0.3}}
`

// 各场景掉落物
const SCENE_ITEMS: Record<string, { emoji: string; color: string; label: string }[]> = {
  forest: [
    { emoji: '🍃', color: '#8bc34a', label: '叶' },
    { emoji: '🌿', color: '#6abf40', label: '草' },
    { emoji: '🌰', color: '#8d6e63', label: '果' },
    { emoji: '🍄', color: '#ff8a65', label: '菇' },
    { emoji: '🌸', color: '#f48fb1', label: '花' },
    { emoji: '🍂', color: '#ffa726', label: '秋' },
  ],
  orchard: [
    { emoji: '🍎', color: '#e53935', label: '苹' },
    { emoji: '🍊', color: '#ff9800', label: '橙' },
    { emoji: '🍇', color: '#7b1fa2', label: '葡' },
    { emoji: '🍓', color: '#e91e63', label: '莓' },
    { emoji: '🍑', color: '#ff8a80', label: '桃' },
    { emoji: '🍒', color: '#c62828', label: '樱' },
  ],
  beach: [
    { emoji: '🐚', color: '#ffccbc', label: '贝' },
    { emoji: '⭐', color: '#ffd54f', label: '星' },
    { emoji: '💧', color: '#4fc3f7', label: '水' },
    { emoji: '🪸', color: '#f48fb1', label: '珊' },
    { emoji: '🐟', color: '#64b5f6', label: '鱼' },
    { emoji: '🦪', color: '#ce93d8', label: '蚌' },
  ],
}

const TOTAL_TIME = 30
const SPAWN_INTERVAL = 800 // ms

interface FallingItem {
  id: number
  emoji: string
  color: string
  x: number // 0-100%
  speed: number // seconds to fall
  caught: boolean
}

export default function FallCatch({ source, onEnd, accentColor, bgColor }: { source: string; onEnd: (s: number) => void; accentColor: string; bgColor: string }) {
  const items = SCENE_ITEMS[source] || SCENE_ITEMS.forest
  const [falling, setFalling] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(TOTAL_TIME)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const idCounter = useRef(0)
  const tmSpawn = useRef<any>()
  const tmTimer = useRef<any>()
  const [missFlash, setMissFlash] = useState(false)

  useEffect(() => { preloadSounds() }, [])

  const spawn = useCallback(() => {
    const item = items[Math.floor(Math.random() * items.length)]
    const newItem: FallingItem = {
      id: ++idCounter.current,
      emoji: item.emoji,
      color: item.color,
      x: 10 + Math.random() * 80,
      speed: 2 + Math.random() * 2, // 2-4 seconds
      caught: false,
    }
    setFalling(prev => [...prev, newItem])
    // 自动移除（掉出屏幕）
    setTimeout(() => {
      setFalling(prev => prev.filter(f => f.id !== newItem.id))
    }, newItem.speed * 1000 + 200)
  }, [items])

  const startGame = useCallback(() => {
    if (started) return
    setStarted(true)
    playSound('chime1', 0.3)
    tmTimer.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(tmTimer.current)
          clearInterval(tmSpawn.current)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    tmSpawn.current = setInterval(spawn, SPAWN_INTERVAL)
    // 立即生成第一批
    spawn()
    setTimeout(spawn, 300)
    setTimeout(spawn, 600)
  }, [started, spawn])

  const catchItem = useCallback((item: FallingItem) => {
    if (item.caught || gameOver) return
    item.caught = true
    playSound('coin', 0.3)
    const ns = score + 1
    setScore(ns)
    setFalling(prev => prev.map(f => f.id === item.id ? { ...f, caught: true } : f))
    // 弹出动画后移除
    setTimeout(() => {
      setFalling(prev => prev.filter(f => f.id !== item.id))
    }, 300)
  }, [score, gameOver])

  // 空点（miss）
  const handleMiss = useCallback(() => {
    if (gameOver) return
    setMissFlash(true)
    setTimeout(() => setMissFlash(false), 200)
    playSound('click_error', 0.15)
  }, [gameOver])

  // 游戏结束
  useEffect(() => {
    if (gameOver) {
      const totalScore = score * 15 + Math.floor(time * 2)
      if (score >= 5) playRareSound()
      else playSound('complete', 0.5)
      setTimeout(() => onEnd(totalScore), 600)
    }
  }, [gameOver, score, time, onEnd])

  const progress = (time / TOTAL_TIME) * 100

  return (
    <View style={{ minHeight: '100vh', background: bgColor, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{KF}</style>

      {/* 顶部信息 */}
      <View style={{
        padding: '12px 16px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', background: 'rgba(0,0,0,0.3)',
      }}>
        <Text style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {items[0]?.emoji} 收集 {score}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: 700, color: time <= 10 ? '#ff5252' : '#fff' }}>
          {started ? `${time}s` : ''}
        </Text>
      </View>

      {/* 进度条 */}
      <View style={{ height: 3, background: 'rgba(255,255,255,0.1)' }}>
        <View style={{ width: `${progress}%`, height: '100%', background: accentColor, transition: 'width 1s linear' }} />
      </View>

      {/* 游戏区 */}
      <View
        onClick={started ? handleMiss : startGame}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: missFlash ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'background 0.1s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* 掉落物 */}
        {falling.map(item => (
          <View key={item.id}
            onClick={(e) => { e.stopPropagation(); catchItem(item) }}
            style={{
              position: 'absolute', left: `${item.x}%`, top: '-10px',
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: item.caught ? 'f-pop 0.3s ease-out forwards' : `f-fall ${item.speed}s linear`,
              opacity: item.caught ? 0 : 1,
              zIndex: 10, cursor: 'pointer',
            }}
          >
            <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
          </View>
        ))}

        {/* 未开始提示 */}
        {!started && !gameOver && (
          <View style={{ alignItems: 'center', gap: 8, display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontSize: 48, opacity: 0.4 }}>{items[Math.floor(Math.random() * items.length)].emoji}</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>点击开始收集</Text>
          </View>
        )}

        {/* 结束 */}
        {gameOver && (
          <View style={{ alignItems: 'center', gap: 8, display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontSize: 42 }}>{items[Math.floor(Math.random() * items.length)].emoji}</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>收集了 {score} 个！</Text>
          </View>
        )}
      </View>
    </View>
  )
}
