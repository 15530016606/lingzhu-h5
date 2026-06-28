// 音效工具 — fetch + Web Audio API
// BGM 使用 HTML5 Audio（原生 loop 支持，低开销）

const SOUNDS = ['coin','chime1','click_error','complete','HAMMER','Splash_Small','windowBreak','whoosh','plus_sfx','ding_ding','water_ripples','victory_confetti','smack'] as const
type SoundName = typeof SOUNDS[number]
const cache = new Map<string, AudioBuffer>()
let ctx: AudioContext | null = null
let ready = false
let bgmAudio: HTMLAudioElement | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return ctx
}

/** 唤醒 AudioContext（必须在用户手势中调用） */
export function resumeAudio() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  ready = true
}

export async function preloadSounds() {
  const c = getCtx()
  const results = await Promise.allSettled(SOUNDS.map(async (name) => {
    if (cache.has(name)) return
    const ext = ['coin','HAMMER','Splash_Small','whoosh','windowBreak'].includes(name) ? '.wav' : '.mp3'
    const res = await fetch(`/sounds/${name}${ext}`)
    if (!res.ok) throw new Error(`404: ${name}${ext}`)
    const buf = await res.arrayBuffer()
    const audio = await c.decodeAudioData(buf)
    cache.set(name, audio)
  }))
  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length > 0) console.warn('Sound load failed:', failed.length, 'files')
}

export function playSound(name: SoundName, volume = 0.5) {
  try {
    if (!ready) resumeAudio()
    const c = getCtx()
    const buf = cache.get(name)
    if (!buf) return
    const src = c.createBufferSource()
    src.buffer = buf
    const gain = c.createGain()
    gain.gain.value = volume
    src.connect(gain).connect(c.destination)
    src.start()
  } catch {}
}

export function playRareSound() {
  playSound('ding_ding', 0.6)
  setTimeout(() => playSound('coin', 0.5), 200)
}

/** 启动背景音乐（自动循环，低音量） */
export function startBGM(volume = 0.15) {
  stopBGM()
  try {
    const audio = new Audio('/sounds/bgm.mp3')
    audio.loop = true
    audio.volume = volume
    audio.play().catch(() => {
      // 浏览器自动播放策略拦截，等 resumeAudio 调用后重试
      const tryPlay = () => {
        if (ready) {
          audio.play().catch(() => {})
        } else {
          setTimeout(tryPlay, 300)
        }
      }
      tryPlay()
    })
    bgmAudio = audio
  } catch {}
}

/** 停止背景音乐 */
export function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause()
    bgmAudio.src = ''
    bgmAudio = null
  }
}
