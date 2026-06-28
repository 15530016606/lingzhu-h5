import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes flip {0%{transform:rotateY(0)}50%{transform:rotateY(90deg)}100%{transform:rotateY(180deg)}}
@keyframes match-pop {0%{transform:scale(1);opacity:1}40%{transform:scale(1.3)}100%{transform:scale(0);opacity:0}}
@keyframes shake {0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes bounce-in {0%{transform:scale(0);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
`

// 每个场景的翻牌主题
const SCENE_CARDS: Record<string, { id: string; emoji: string; color: string; label: string }[]> = {
  crystal: [
    { id: 'white', emoji: '💎', color: '#a0c4ff', label: '晶' },
    { id: 'purple', emoji: '🔮', color: '#b388ff', label: '紫' },
    { id: 'pink', emoji: '💗', color: '#ff80ab', label: '粉' },
    { id: 'gold', emoji: '⭐', color: '#ffd54f', label: '金' },
    { id: 'green', emoji: '🍀', color: '#69f0ae', label: '绿' },
    { id: 'blue', emoji: '💠', color: '#40c4ff', label: '蓝' },
    { id: 'crystal', emoji: '✨', color: '#e8f0ff', label: '晶' },
    { id: 'sparkle', emoji: '🌟', color: '#fff', label: '光' },
  ],
  jade: [
    { id: 'jade1', emoji: '💚', color: '#90c890', label: '翠' },
    { id: 'jade2', emoji: '🟢', color: '#7db87d', label: '碧' },
    { id: 'jade3', emoji: '🗿', color: '#b8a888', label: '玉' },
    { id: 'jade4', emoji: '🪨', color: '#a09888', label: '石' },
    { id: 'jade5', emoji: '💎', color: '#c8d8c0', label: '翡' },
    { id: 'jade6', emoji: '🟩', color: '#5a9a5a', label: '绿' },
    { id: 'jade7', emoji: '📿', color: '#d4c8a0', label: '串' },
    { id: 'jade8', emoji: '⭐', color: '#e8e0c0', label: '光' },
  ],
  forest: [
    { id: 'wood1', emoji: '🌿', color: '#6abf40', label: '草' },
    { id: 'wood2', emoji: '🍃', color: '#8bc34a', label: '叶' },
    { id: 'wood3', emoji: '🌱', color: '#4caf50', label: '芽' },
    { id: 'wood4', emoji: '🪵', color: '#8d6e63', label: '木' },
    { id: 'wood5', emoji: '🍄', color: '#ff8a65', label: '菇' },
    { id: 'wood6', emoji: '🌲', color: '#388e3c', label: '松' },
    { id: 'wood7', emoji: '🍂', color: '#ffa726', label: '秋' },
    { id: 'wood8', emoji: '🌸', color: '#f48fb1', label: '花' },
  ],
  orchard: [
    { id: 'fruit1', emoji: '🍎', color: '#e53935', label: '苹' },
    { id: 'fruit2', emoji: '🍊', color: '#ff9800', label: '橙' },
    { id: 'fruit3', emoji: '🍋', color: '#ffee58', label: '柠' },
    { id: 'fruit4', emoji: '🍇', color: '#7b1fa2', label: '葡' },
    { id: 'fruit5', emoji: '🍓', color: '#e91e63', label: '莓' },
    { id: 'fruit6', emoji: '🍑', color: '#ff8a80', label: '桃' },
    { id: 'fruit7', emoji: '🍒', color: '#c62828', label: '樱' },
    { id: 'fruit8', emoji: '🥝', color: '#66bb6a', label: '猕' },
  ],
  beach: [
    { id: 'shell1', emoji: '🐚', color: '#ffccbc', label: '贝' },
    { id: 'shell2', emoji: '🦪', color: '#ce93d8', label: '蚌' },
    { id: 'shell3', emoji: '💧', color: '#4fc3f7', label: '水' },
    { id: 'shell4', emoji: '🪨', color: '#8d9aa8', label: '石' },
    { id: 'shell5', emoji: '🐟', color: '#64b5f6', label: '鱼' },
    { id: 'shell6', emoji: '🪸', color: '#f48fb1', label: '珊' },
    { id: 'shell7', emoji: '⭐', color: '#ffd54f', label: '星' },
    { id: 'shell8', emoji: '🔮', color: '#81d4fa', label: '珠' },
  ],
  workshop: [
    { id: 'tool1', emoji: '🔧', color: '#8d6e63', label: '扳' },
    { id: 'tool2', emoji: '⚒️', color: '#6d4c41', label: '锤' },
    { id: 'tool3', emoji: '🔨', color: '#795548', label: '钉' },
    { id: 'tool4', emoji: '⚙️', color: '#607d8b', label: '齿' },
    { id: 'tool5', emoji: '🪡', color: '#bcaaa4', label: '针' },
    { id: 'tool6', emoji: '🖌️', color: '#90a4ae', label: '刷' },
    { id: 'tool7', emoji: '📏', color: '#b0bec5', label: '尺' },
    { id: 'tool8', emoji: '💡', color: '#fff176', label: '灯' },
  ],
}

function shuffle(arr: any[]) {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

const TOTAL_TIME = 40

export default function MemoryMatch({ source, onEnd, accentColor, bgColor }: { source: string; onEnd: (s: number) => void; accentColor: string; bgColor: string }) {
  const cardsData = SCENE_CARDS[source] || SCENE_CARDS.crystal
  const [cards, setCards] = useState<any[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(TOTAL_TIME)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<{ score: number; isNew: boolean } | null>(null)
  const tm = useRef<any>()
  const lock = useRef(false)

  useEffect(() => { preloadSounds() }, [])

  const init = useCallback(() => {
    const pairs = shuffle(cardsData).slice(0, 6)
    const doubled = shuffle([...pairs, ...pairs])
    setCards(doubled)
    setFlipped([])
    setMatched([])
    setScore(0)
    setTime(TOTAL_TIME)
    setStarted(false)
    setGameOver(false)
    setResult(null)
  }, [])

  useEffect(() => { init() }, [init])

  const startTimer = useCallback(() => {
    if (tm.current) clearInterval(tm.current)
    setStarted(true)
    tm.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(tm.current)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleTap = useCallback((idx: number) => {
    if (lock.current || gameOver || matched.includes(idx) || flipped.includes(idx)) return
    if (!started) startTimer()
    playSound('chime1', 0.25)
    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)
    if (newFlipped.length === 2) {
      lock.current = true
      const [a, b] = newFlipped
      if (cards[a].id === cards[b].id) {
        lock.current = false
        setMatched(prev => [...prev, a, b])
        setFlipped([])
        playSound('coin', 0.3)
        const ns = score + 1
        setScore(ns)
        if (ns >= 6) {
          const totalScore = 100 + Math.floor(time * 2)
          clearInterval(tm.current)
          setGameOver(true)
          setResult({ score: totalScore, isNew: true })
          playRareSound()
          setTimeout(() => onEnd(totalScore), 500)
        }
      } else {
        playSound('click_error', 0.2)
        setTimeout(() => {
          setFlipped([])
          lock.current = false
        }, 700)
      }
    }
  }, [flipped, matched, cards, score, time, started, startTimer, gameOver, onEnd])

  // 时间到
  useEffect(() => {
    if (gameOver && !result) {
      const totalScore = Math.floor(score * 15)
      setResult({ score: totalScore, isNew: false })
      setTimeout(() => onEnd(totalScore), 800)
    }
  }, [gameOver, result, score, onEnd])

  const progress = (time / TOTAL_TIME) * 100

  return (
    <View style={{ minHeight: '100vh', background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 12px' }}>
      <style>{KF}</style>
      {/* 顶部信息 */}
      <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, display: 'flex' }}>
          <Text style={{ fontSize: 17 }}>{cardsData[0]?.emoji || '💎'}</Text>
          <Text style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>配对比分</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{score}/6</Text>
      </View>
      {/* 进度条 */}
      <View style={{ width: '100%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>
        <View style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: accentColor, transition: 'width 1s linear' }} />
      </View>
      {/* 卡牌网格：响应式 4x3 */}
      <View style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i)
          const isMatched = matched.includes(i)
          return (
            <View key={i} onClick={() => handleTap(i)}
              style={{
                width: 'calc(25% - 6px)', aspectRatio: '1', borderRadius: 10,
                cursor: 'pointer', position: 'relative', perspective: 600,
                opacity: isMatched ? 0 : 1,
                transition: 'opacity 0.3s',
                animation: isMatched ? 'match-pop 0.4s ease-out forwards' : undefined,
              }}
            >
              <View style={{
                width: '100%', height: '100%', borderRadius: 10,
                background: isFlipped ? card.color + '33' : accentColor + '44',
                border: `2px solid ${isFlipped ? card.color + '88' : 'rgba(255,255,255,0.1)'}`,
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
                animation: isFlipped ? 'flip 0.3s ease-out' : undefined,
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}>
                {isFlipped ? (
                  <Text style={{ fontSize: 28, animation: 'bounce-in 0.3s ease-out' }}>{card.emoji}</Text>
                ) : (
                  <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }}>?</Text>
                )}
              </View>
            </View>
          )
        })}
      </View>
      {/* 计时 */}
      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
        {started ? `${time}秒` : '点击卡片开始'}
      </Text>
    </View>
  )
}
