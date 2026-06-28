import { useEffect, useRef } from 'react'
import { View } from '@tarojs/components'

interface GameFrameProps {
  src: string
  onWin?: (score: number) => void
  onLose?: () => void
  onReady?: () => void
  style?: React.CSSProperties
}

/**
 * iframe 桥接组件 —— 嵌入独立 HTML 小游戏，通过 postMessage 通信
 * 
 * 游戏侧需在结束时调用：
 *   window.parent.postMessage({ type: 'gameWin', score: N }, '*')
 *   window.parent.postMessage({ type: 'gameLose' }, '*')
 */
export default function GameFrame({ src, onWin, onLose, onReady, style }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data
      if (!msg || !msg.type) return
      switch (msg.type) {
        case 'gameWin':
          onWin?.(msg.score ?? 0)
          break
        case 'gameLose':
          onLose?.()
          break
        case 'gameReady':
          onReady?.()
          break
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onWin, onLose, onReady])

  return (
    <View style={{
      width: '100%',
      flex: 1,
      overflow: 'hidden',
      borderRadius: 12,
      ...style,
    }}>
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
        title='mini-game'
        allow='autoplay'
      />
    </View>
  )
}
