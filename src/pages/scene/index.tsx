import { lazy, Suspense, useCallback, useState } from 'react'
import Taro from '@tarojs/taro'
import { SCENES, GameEntry } from './configs'
import { theme } from '@/lib/theme'
import { playSound, playRareSound, resumeAudio } from '@/lib/sound'
import { addToBackpack } from '@/lib/backpack'
import { addBead } from '@/lib/inventory'
import MemoryMatch from './games/memory-match'
import MatchThree from './games/match-three'
import StackMatch from './games/stack-match'
import FallCatch from './games/fall-catch'
import TimingTap from './games/timing-tap'

const GAME_COMPONENTS: Record<string, any> = {
  memory: MemoryMatch,
  match3: MatchThree,
  stack: StackMatch,
  'fall-catch': FallCatch,
  'timing-tap': TimingTap,
}

const KF = `
@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes glow-pulse {0%,100%{box-shadow:0 0 10px var(--gc)}50%{box-shadow:0 0 30px var(--gc),0 0 50px var(--gc)}}
@keyframes card-reveal {0%{transform:rotateY(180deg) scale(1.3);opacity:0}40%{transform:rotateY(100deg) scale(1.1)}100%{transform:rotateY(0) scale(1);opacity:1}}
@keyframes star-burst {0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0.3);opacity:0}}
@keyframes title-glow {0%,100%{text-shadow:0 0 8px var(--tc)}50%{text-shadow:0 0 20px var(--tc),0 0 40px var(--tc)}}
@keyframes enter-down {0%{transform:translateY(-20px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes popup-enter {0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes btn-press {0%{transform:scale(1)}50%{transform:scale(0.95)}100%{transform:scale(1)}}
@keyframes fade-in {0%{opacity:0}100%{opacity:1}}
@keyframes slide-up {0%{transform:translateY(30px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes gem-glow {0%,100%{box-shadow:0 0 8px var(--gc)}50%{box-shadow:0 0 25px var(--gc),0 0 45px var(--gc)}}
@keyframes confetti-fall {0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(60px) rotate(180deg);opacity:0}}
`

type Phase = 'intro' | 'reveal' | 'game' | 'result'

export default function ScenePage() {
  const params = Taro.getCurrentInstance().router?.params as any
  const source = params?.source || 'crystal'
  const cfg = SCENES.find(s => s.id === source) || SCENES[0]

  const [phase, setPhase] = useState<Phase>('intro')
  const [currentGame, setCurrentGame] = useState<GameEntry | null>(null)
  const [stars, setStars] = useState<any[]>([])
  const [confetti, setConfetti] = useState<any[]>([])
  const [gameResult, setGameResult] = useState<{ win: boolean; score: number; gemId: string; gemName: string; gemType: 'gem' | 'scrap'; collected?: boolean } | null>(null)

  const drawCard = useCallback(() => {
    resumeAudio()
    playSound('chime1', 0.3)
    const games = cfg.games
    const picked = games[Math.floor(Math.random() * games.length)]

    const st = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i, sx: (Math.random() - 0.5) * 200, sy: (Math.random() - 0.5) * 200 - 50,
    }))
    setStars(st)
    setTimeout(() => setStars([]), 500)

    setTimeout(() => {
      setCurrentGame(picked)
      playRareSound()
      setPhase('reveal')
      setTimeout(() => { setPhase('game') }, 1300)
    }, 300)
  }, [cfg.games])

  const handleGameEnd = useCallback((score: number) => {
    if (!currentGame) return
    const { material, name } = currentGame.reward
    if (score < 40) {
      setGameResult({ win: false, score, gemId: 'scrap', gemName: '废料', gemType: 'scrap' })
      setPhase('result')
      playSound('click_error', 0.3)
      return
    }
    const isRare = score >= 80
    const gemId = isRare ? `${material}_rare` : material
    const gemName = isRare ? `优质${name}` : name
    setGameResult({ win: true, score, gemId, gemName, gemType: 'gem' })
    setPhase('result')
    // 撒花特效（稀有掉落）
    if (isRare || score >= 60) {
      const c = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: isRare ? ['#ffd54f', '#ff80ab', '#40c4ff', '#69f0ae', '#fff'][Math.floor(Math.random() * 5)] : cfg.accentColor,
        size: 4 + Math.random() * 4,
      }))
      setConfetti(c)
      setTimeout(() => setConfetti([]), 1500)
    }
    playSound('complete', 0.6)
    if (isRare) setTimeout(() => playSound('coin', 0.5), 200)
  }, [currentGame])

  const handleCollect = useCallback(() => {
    if (!gameResult) return
    addToBackpack(gameResult.gemId, gameResult.gemName, gameResult.gemType)
    // 同步加入珠子库存（免加工直接获得珠子）
    if (gameResult.gemType === 'gem') {
      const quality = gameResult.score >= 80 ? '稀有' : '普通'
      addBead(`${gameResult.gemName}珠`, gameResult.gemId, quality)
    }
    setGameResult(prev => prev ? { ...prev, collected: true } : null)
    playSound('coin', 0.5)
  }, [gameResult])

  const goHome = useCallback(() => Taro.navigateBack(), [])
  const goProcess = useCallback(() => {
    if (!currentGame || !gameResult) return
    Taro.navigateTo({ url: `/pages/processing/index?source=${source}&material=${gameResult.gemId}&name=${encodeURIComponent(gameResult.gemName)}` })
  }, [currentGame, gameResult, source])

  const playAgain = useCallback(() => {
    setPhase('intro')
    setCurrentGame(null)
    setGameResult(null)
  }, [])

  // 玩游戏
  if (phase === 'game' && currentGame) {
    const Comp = GAME_COMPONENTS[currentGame.id]
    if (Comp) {
      return <Comp source={source} onEnd={handleGameEnd} accentColor={cfg.accentColor} bgColor={cfg.bgColor} />
    }
    return (
      <div style={{ padding: 40, alignItems: 'center', background: '#1a1020', minHeight: '100vh' }}>
        <div style={{ fontSize: 13, color: '#999' }}>未知游戏</div>
      </div>
    )
  }

  // Result
  if (phase === 'result' && gameResult) {
    return (
      <div style={{ minHeight: '100vh', background: cfg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fade-in 0.3s ease', position: 'relative' }}>
        {/* 撒花 */}
        {confetti.map(c => (
          <div key={c.id} style={{
            position: 'absolute', top: '20%', left: `${c.left}%`,
            width: c.size, height: c.size, borderRadius: '50%',
            background: c.color,
            animation: `confetti-fall 1.2s ease-out ${c.delay}s forwards`,
            zIndex: 10,
          }} />
        ))}
        <div style={{
          background: theme.bgCard, borderRadius: 20, padding: '28px 30px',
          alignItems: 'center', gap: 12, display: 'flex', flexDirection: 'column',
          maxWidth: 300, width: '85vw', boxShadow: `0 4px 20px ${theme.shadow}`,
          animation: 'popup-enter 0.4s ease-out',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: gameResult.gemType === 'scrap' ? '#c8b8a8' : cfg.accentColor + '33',
            border: gameResult.gemType === 'scrap' ? 'none' : `2px solid ${cfg.accentColor}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: gameResult.gemType !== 'scrap' ? 'gem-glow 1.5s ease-in-out infinite' : 'none',
            '--gc': cfg.accentColor + '66',
          } as any}>
            <span style={{ fontSize: 28 }}>{gameResult.gemType === 'scrap' ? '💔' : '💎'}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
            {gameResult.gemType === 'scrap' ? '获得废料' : `获得${gameResult.gemName}`}
          </div>
          <div style={{ fontSize: 10, color: theme.textSecondary, textAlign: 'center' }}>
            {gameResult.gemType === 'scrap' ? '表现还可以更好哦' : '已放入背包'}
          </div>
          {gameResult.collected ? (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, justifyContent: 'center' }}>
              <div onClick={goProcess} style={{
                padding: '7px 14px', borderRadius: 18,
                background: `linear-gradient(135deg, ${theme.primary}, ${cfg.accentColor})`,
                cursor: 'pointer', touchAction: 'manipulation',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseDown={e => { (e.target as HTMLElement).style.transform = 'scale(0.94)' }}
                onMouseUp={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
                onTouchStart={e => { (e.target as HTMLElement).style.transform = 'scale(0.94)' }}
                onTouchEnd={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>去加工</span>
              </div>
              <div onClick={goHome} style={{
                padding: '7px 14px', borderRadius: 18, border: `1px solid ${theme.border}`,
                cursor: 'pointer', touchAction: 'manipulation',
              }}>
                <span style={{ fontSize: 12, color: theme.textPrimary }}>返回首页</span>
              </div>
              <div onClick={playAgain} style={{
                padding: '7px 14px', borderRadius: 18,
                background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}dd)`,
                cursor: 'pointer', touchAction: 'manipulation',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>再来一局</span>
              </div>
            </div>
          ) : (
            <div onClick={handleCollect} style={{
              marginTop: 8, padding: '10px 36px', borderRadius: 25,
              background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}cc)`,
              cursor: 'pointer', boxShadow: `0 3px 10px ${cfg.accentColor}44`, touchAction: 'manipulation',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>放入背包</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Intro + Reveal: 翻牌
  return (
    <div style={{ minHeight: '100vh', background: cfg.bgColor, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{KF}</style>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: `url(${cfg.sceneImage}) center/cover no-repeat`,
      }}>
        <div style={{
          flex: 1,
          background: 'linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.08)30%,rgba(0,0,0,0.35))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginBottom: 4 }}>
            {cfg.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
            抽一张卡 开始采集
          </div>

          {/* 卡背 */}
          {phase === 'intro' && (
            <div onClick={drawCard} style={{
              width: 160, height: 220, borderRadius: 16, cursor: 'pointer',
              background: 'linear-gradient(145deg,#6a5080,#3a2040)',
              border: '2px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 2.5s ease-in-out infinite, glow-pulse 2s ease-in-out infinite',
              '--gc': 'rgba(160,120,200,0.35)',
              marginBottom: 20, touchAction: 'manipulation',
            } as any}>
              <div style={{ alignItems: 'center', gap: 6, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 40, opacity: 0.6 }}>?</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>点击抽卡</span>
              </div>
            </div>
          )}

          {/* 翻卡 reveal */}
          {phase === 'reveal' && currentGame && (
            <div style={{ alignItems: 'center', gap: 14, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: 160, height: 220, borderRadius: 16,
                background: 'linear-gradient(145deg,#2a1a40,#1a1020)',
                border: `2px solid ${cfg.accentColor}55`,
                boxShadow: `0 0 30px ${cfg.accentColor}33`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                animation: 'card-reveal 0.5s ease-out',
              }}>
                <span style={{ fontSize: 52, marginBottom: 6 }}>{currentGame.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#f0e8d0', marginBottom: 2,
                  animation: 'title-glow 0.8s ease-in-out infinite',
                  '--tc': cfg.accentColor } as any}>{currentGame.name}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{currentGame.desc}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: 3, background: cfg.accentColor,
                    animation: 'enter-down 0.5s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* 星星粒子 */}
          {stars.map(s => (
            <div key={s.id} style={{
              position: 'absolute', left: '50%', top: '45%', width: 4, height: 4, borderRadius: 2,
              background: '#fff', animation: 'star-burst 0.4s ease-out forwards',
              '--sx': `${s.sx}px`, '--sy': `${s.sy}px`,
            } as any} />
          ))}
        </div>
      </div>
    </div>
  )
}
