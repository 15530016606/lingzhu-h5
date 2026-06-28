import { lazy, Suspense, useCallback, useState } from 'react'
import Taro from '@tarojs/taro'
import { SCENES, GameEntry } from './configs'
import { theme } from '@/lib/theme'
import GameFrame from '@/components/GameFrame'
import { playSound, resumeAudio } from '@/lib/sound'
import { addToBackpack } from '@/lib/backpack'

// 懒加载场地已有的 React 小游戏组件
const CrystalMine = lazy(() => import('./games/crystal-mine'))
const JadeValley = lazy(() => import('./games/jade-valley'))

const REACT_GAMES: Record<string, any> = {
  'crystal-mine-react': CrystalMine,
}

export default function ScenePage() {
  const params = Taro.getCurrentInstance().router?.params as any
  const source = params?.source || 'crystal'
  const cfg = SCENES.find(s => s.id === source) || SCENES[0]

  // phase: 'select' | 'playing' | 'result'
  const [phase, setPhase] = useState<'select' | 'playing' | 'result'>('select')
  const [currentGame, setCurrentGame] = useState<GameEntry | null>(null)
  const [gameResult, setGameResult] = useState<{ win: boolean; score: number; gemId: string; gemName: string; gemType: 'gem' | 'scrap' } | null>(null)

  const onComplete = (material: string, name: string) => {
    Taro.navigateTo({ url: `/pages/processing/index?source=${source}&material=${material}&name=${name}` })
  }

  const startGame = useCallback((game: GameEntry) => {
    resumeAudio()
    setCurrentGame(game)
    setPhase('playing')
  }, [])

  const handleIframeWin = useCallback((score: number) => {
    if (!currentGame) return
    const { material, name } = currentGame.reward
    // score > 0 就得宝石；得分高得稀有
    const isRare = score >= 80
    const gemId = isRare ? `${material}_rare` : material
    const gemName = isRare ? `优质${name}` : name
    setGameResult({ win: true, score, gemId, gemName, gemType: 'gem' })
    setPhase('result')
    playSound('complete', 0.6)
    if (isRare) setTimeout(() => playSound('coin', 0.5), 200)
  }, [currentGame])

  const handleIframeLose = useCallback(() => {
    const { material, name } = currentGame!.reward
    setGameResult({ win: false, score: 0, gemId: 'scrap', gemName: '废料', gemType: 'scrap' })
    setPhase('result')
    playSound('click_error', 0.3)
  }, [currentGame])

  const handleCollect = useCallback(() => {
    if (!gameResult) return
    addToBackpack(gameResult.gemId, gameResult.gemName, gameResult.gemType)
    setGameResult(prev => prev ? { ...prev, collected: true } as any : null)
    playSound('coin', 0.5)
  }, [gameResult])

  const goHome = useCallback(() => Taro.navigateBack(), [])
  const goProcess = useCallback(() => {
    if (!currentGame || !gameResult) return
    Taro.navigateTo({ url: `/pages/processing/index?source=${source}&material=${gameResult.gemId}&name=${encodeURIComponent(gameResult.gemName)}` })
  }, [currentGame, gameResult, source])
  const playAgain = useCallback(() => {
    setPhase('select')
    setCurrentGame(null)
    setGameResult(null)
  }, [])

  // 如果是 React 游戏，直接渲染
  if (currentGame?.type === 'react') {
    const GameComponent = REACT_GAMES[currentGame.id]
    if (GameComponent) {
      return (
        <Suspense fallback={<View style={{ padding: 40, alignItems: 'center', background: '#1a1020', minHeight: '100vh' }}>
          <Text style={{ fontSize: 13, color: '#999' }}>加载中...</Text>
        </View>}>
          <GameComponent source={source} onComplete={onComplete} />
        </Suspense>
      )
    }
  }

  // 游戏选择界面
  if (phase === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: cfg.bgColor, overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 0' }}>
          {/* 场景头部 */}
          <div style={{
            height: 140, borderRadius: 16, overflow: 'hidden', marginBottom: 16,
            background: `url(${cfg.sceneImage}) center/cover no-repeat`,
            display: 'flex', alignItems: 'flex-end', padding: 16,
            position: 'relative',
          }}>
            <div style={{
              background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
              position: 'absolute', inset: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)' }}>
                <img src={cfg.characterGif} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{cfg.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{cfg.subtitle}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, marginBottom: 12 }}>选择游戏开始采集</div>

          {/* 游戏卡片列表 */}
          {cfg.games.map((game) => (
            <div key={game.id}
              onClick={() => startGame(game)}
              style={{
                marginBottom: 10, padding: '14px 16px', borderRadius: theme.radiusCard,
                background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
                boxShadow: `0 2px 8px ${theme.shadow}`,
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: cfg.accentColor + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 22 }}>{game.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{game.name}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 6, fontSize: 8, color: '#fff',
                    background: game.type === 'react' ? '#7c4dff' : cfg.accentColor,
                  }}>{game.type === 'react' ? '经典' : '新'}</span>
                </div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>{game.desc}</div>
              </div>
              <span style={{ fontSize: 16, color: theme.border }}>›</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 游戏中
  if (phase === 'playing' && currentGame?.type === 'iframe') {
    return (
      <View style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部栏 */}
        <View style={{
          padding: '8px 14px', display: 'flex', flexDirection: 'row', alignItems: 'center',
          background: '#111', borderBottom: '1px solid #222',
        }}>
          <Text onClick={() => setPhase('select')} onTouchEnd={() => setPhase('select')} style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}>‹ 返回</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#ccc', fontWeight: 600 }}>{currentGame.name}</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* 游戏 iframe */}
        <View style={{ flex: 1 }}>
          <GameFrame
            src={`/games/${currentGame.id}/index.html`}
            scene={source}
            onWin={handleIframeWin}
            onLose={handleIframeLose}
          />
        </View>
      </View>
    )
  }

  // 结果弹窗
  if (phase === 'result' && gameResult) {
    return (
      <View style={{ minHeight: '100vh', background: cfg.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          background: theme.bgCard, borderRadius: 20, padding: '28px 30px',
          alignItems: 'center', gap: 12, display: 'flex', flexDirection: 'column',
          maxWidth: 280, boxShadow: `0 4px 20px ${theme.shadow}`,
        }}>
          <View style={{
            width: 56, height: 56, borderRadius: 14,
            background: gameResult.gemType === 'scrap' ? '#c8b8a8' : cfg.accentColor + '33',
            border: gameResult.gemType === 'scrap' ? 'none' : `2px solid ${cfg.accentColor}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 28 }}>{gameResult.gemType === 'scrap' ? '💔' : '💎'}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
            {gameResult.gemType === 'scrap' ? '获得废料' : `获得${gameResult.gemName}`}
          </Text>
          <Text style={{ fontSize: 10, color: theme.textSecondary, textAlign: 'center' }}>
            {gameResult.gemType === 'scrap' ? '表现还可以更好哦' : '已放入背包'}
          </Text>
          {(gameResult as any).collected ? (
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <View onClick={goProcess} onTouchEnd={goProcess} style={{
                padding: '8px 20px', borderRadius: 20,
                background: `linear-gradient(135deg, ${theme.primary}, ${cfg.accentColor})`,
                cursor: 'pointer',
              }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>去加工</Text>
              </View>
              <View onClick={goHome} onTouchEnd={goHome} style={{
                padding: '8px 20px', borderRadius: 20, border: `1px solid ${theme.border}`,
                cursor: 'pointer',
              }}>
                <Text style={{ fontSize: 12, color: theme.textPrimary }}>返回首页</Text>
              </View>
              <View onClick={playAgain} onTouchEnd={playAgain} style={{
                padding: '8px 20px', borderRadius: 20,
                background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}dd)`,
                cursor: 'pointer',
              }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>再来一局</Text>
              </View>
            </View>
          ) : (
            <View onClick={handleCollect} onTouchEnd={handleCollect} style={{
              marginTop: 8, padding: '10px 36px', borderRadius: 25,
              background: `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentColor}cc)`,
              cursor: 'pointer', boxShadow: `0 3px 10px ${cfg.accentColor}44`,
            }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>放入背包</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return null
}
