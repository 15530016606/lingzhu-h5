import { useCallback, useEffect, useRef, useState } from 'react'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes t-pulse {0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes t-flash {0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes t-pop {0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
`

// 各场景的节拍主题
const SCENE_ITEMS: Record<string, { openEmoji: string; closedEmoji: string; color: string; label: string }[]> = {
  beach: [
    { openEmoji: '🐚', closedEmoji: '🦪', color: '#ffccbc', label: '贝' },
    { openEmoji: '⭐', closedEmoji: '🌟', color: '#ffd54f', label: '星' },
    { openEmoji: '🪸', closedEmoji: '🪨', color: '#f48fb1', label: '珊' },
    { openEmoji: '🐟', closedEmoji: '🌊', color: '#64b5f6', label: '鱼' },
  ],
  workshop: [
    { openEmoji: '🔧', closedEmoji: '⚙️', color: '#8d6e63', label: '开' },
    { openEmoji: '🔨', closedEmoji: '🪚', color: '#795548', label: '锤' },
    { openEmoji: '💡', closedEmoji: '🔌', color: '#fff176', label: '灯' },
    { openEmoji: '🖌️', closedEmoji: '📏', color: '#90a4ae', label: '刷' },
  ],
}

const TOTAL_TIME = 30
const OPEN_DURATION = 800 // ms 开启后持续多久
const CLOSED_MIN = 600
const CLOSED_MAX = 2000

export default function TimingTap({ source, onEnd, accentColor, bgColor }: { source: string; onEnd: (s: number) => void; accentColor: string; bgColor: string }) {
  const items = SCENE_ITEMS[source] || SCENE_ITEMS.beach
  const currentItem = items[Math.floor(Math.random() * items.length)]

  const [phase, setPhase] = useState<'idle' | 'closed' | 'open' | 'result'>('idle')
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(TOTAL_TIME)
  const [streak, setStreak] = useState(0)
  const [started, setStarted] = useState(false)
  const [resultText, setResultText] = useState('')
  const tmCycle = useRef<any>()
  const tmTimer = useRef<any>()

  useEffect(() => { preloadSounds() }, [])

  const startCycle = useCallback(() => {
    if (tmCycle.current) clearTimeout(tmCycle.current)
    setPhase('closed')
    const closedTime = CLOSED_MIN + Math.random() * (CLOSED_MAX - CLOSED_MIN)
    tmCycle.current = setTimeout(() => {
      setPhase('open')
      playSound('chime1', 0.2)
      // 一段时间后自动关闭（miss）
      setTimeout(() => {
        if (phase === 'open') {
          setStreak(0)
          setResultText('慢了...')
          setTimeout(() => setResultText(''), 400)
          playSound('click_error', 0.2)
        }
        startCycle()
      }, OPEN_DURATION)
    }, closedTime)
  }, [phase])

  const startGame = useCallback(() => {
    if (started) return
    setStarted(true)
    setPhase('closed')
    playSound('chime1', 0.3)
    tmTimer.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(tmTimer.current)
          clearTimeout(tmCycle.current)
          setPhase('result')
          const totalScore = score * 20 + Math.floor(streak * 10)
          if (score >= 5) playRareSound()
          else playSound('complete', 0.5)
          setTimeout(() => onEnd(totalScore), 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    startCycle()
  }, [started, startCycle, score, streak, onEnd])

  const tapItem = useCallback(() => {
    if (phase === 'open') {
      // 正确的时机
      playSound('coin', 0.3)
      setScore(prev => prev + 1)
      setStreak(prev => prev + 1)
      setResultText('完美!')
      setTimeout(() => setResultText(''), 300)
      clearTimeout(tmCycle.current)
      startCycle()
    } else if (phase === 'closed' || phase === 'idle') {
      // 敲错了
      setStreak(0)
      setResultText('早了!')
      setTimeout(() => setResultText(''), 400)
      playSound('click_error', 0.2)
    }
  }, [phase, startCycle])

  const progress = (time / TOTAL_TIME) * 100

  return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{KF}</style>

      {/* 顶部 */}
      <div style={{
        padding: '12px 16px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', background: 'rgba(0,0,0,0.3)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {currentItem?.openEmoji} x{score}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: time <= 10 ? '#ff5252' : '#fff' }}>
          {started ? `${time}s` : ''}
        </span>
      </div>

      {/* 进度条 */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: accentColor, transition: 'width 1s linear' }} />
      </div>

      {/* 游戏区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* 主物体 */}
        {phase !== 'result' && (
          <div
            onClick={started ? tapItem : startGame}
            style={{
              width: 120, height: 120, borderRadius: 24,
              background: phase === 'open' ? accentColor + '33' : 'rgba(255,255,255,0.05)',
              border: `3px solid ${phase === 'open' ? accentColor + '88' : 'rgba(255,255,255,0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', touchAction: 'manipulation',
              animation: phase === 'open' ? 't-pulse 0.5s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: 52, animation: started ? 't-pop 0.3s ease-out' : 'none' }}>
              {phase === 'open' ? currentItem?.openEmoji : (currentItem?.closedEmoji || '?')}
            </span>
          </div>
        )}

        {/* 提示 */}
        {!started && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            等待开启的瞬间点击！
          </span>
        )}

        {/* 连击 */}
        {started && streak >= 3 && (
          <span style={{ fontSize: 11, color: accentColor, fontWeight: 600, animation: 't-flash 0.5s ease infinite' }}>
            连击 x{streak}
          </span>
        )}

        {/* 结果文字 */}
        {resultText && (
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: resultText === '完美!' ? accentColor : '#ff5252',
            animation: 't-pop 0.2s ease-out',
          }}>
            {resultText}
          </span>
        )}

        {/* 结束 */}
        {phase === 'result' && (
          <div style={{ alignItems: 'center', gap: 8, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 48 }}>{currentItem?.openEmoji}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>接住了 {score} 次！</span>
          </div>
        )}
      </div>
    </div>
  )
}
