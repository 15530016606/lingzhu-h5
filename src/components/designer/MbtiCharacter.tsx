import { View } from '@tarojs/components'

/* ── MBTI 可爱角色插画 ── */
interface CharStyle {
  bg: string       // 背景渐变
  sk: string       // 肤色
  hair: string     // 发色
  hairStyle: 'm' | 'f' | 'spiky' | 'long'  // 发型
  eyes: string
  brow: string
  mouth: string
  acc: string      // 配饰 emoji 替代
}

const MBTI_CHARS: Record<string, CharStyle> = {
  INTJ: { bg: 'linear-gradient(135deg,#1a1a2e,#16213e)', sk: '#f5e6d3', hair: '#1a1a2e', hairStyle: 'm', eyes: 'sharp', brow: 'sharp', mouth: 'calm', acc: 's' },
  INTP: { bg: 'linear-gradient(135deg,#2d1b69,#3b2a8a)', sk: '#f0e6d8', hair: '#3b2a8a', hairStyle: 'm', eyes: 'sparkle', brow: 'worried', mouth: 'wonder', acc: 'l' },
  ENTJ: { bg: 'linear-gradient(135deg,#8b0000,#c0392b)', sk: '#f0dcc8', hair: '#8b0000', hairStyle: 'spiky', eyes: 'sharp', brow: 'sharp', mouth: 'grin', acc: 'c' },
  ENTP: { bg: 'linear-gradient(135deg,#d4a017,#e8c84a)', sk: '#f5e6d0', hair: '#d4a017', hairStyle: 'spiky', eyes: 'sparkle', brow: 'soft', mouth: 'grin', acc: 'i' },
  INFJ: { bg: 'linear-gradient(135deg,#4a6fa5,#6b8fc9)', sk: '#f8efe5', hair: '#4a6fa5', hairStyle: 'long', eyes: 'big', brow: 'soft', mouth: 'smile', acc: 'f' },
  INFP: { bg: 'linear-gradient(135deg,#c084a8,#e0b0c8)', sk: '#f8efe8', hair: '#c084a8', hairStyle: 'long', eyes: 'big', brow: 'soft', mouth: 'smile', acc: 'h' },
  ENFJ: { bg: 'linear-gradient(135deg,#2e7d5e,#4a9e7a)', sk: '#f0e6d8', hair: '#2e7d5e', hairStyle: 'f', eyes: 'big', brow: 'soft', mouth: 'grin', acc: 't' },
  ENFP: { bg: 'linear-gradient(135deg,#e8a040,#f0c860)', sk: '#f8efe0', hair: '#e8a040', hairStyle: 'f', eyes: 'sparkle', brow: 'soft', mouth: 'grin', acc: 's' },
  ISTJ: { bg: 'linear-gradient(135deg,#4a5568,#718096)', sk: '#f0e8dc', hair: '#4a5568', hairStyle: 'm', eyes: 'small', brow: 'sharp', mouth: 'calm', acc: 'g' },
  ISFJ: { bg: 'linear-gradient(135deg,#7d8a4e,#9aad68)', sk: '#f5ede0', hair: '#7d8a4e', hairStyle: 'f', eyes: 'small', brow: 'soft', mouth: 'smile', acc: 'h' },
  ESTJ: { bg: 'linear-gradient(135deg,#2c3e50,#4a6276)', sk: '#f0dcc8', hair: '#2c3e50', hairStyle: 'spiky', eyes: 'small', brow: 'sharp', mouth: 'grin', acc: 'c' },
  ESFJ: { bg: 'linear-gradient(135deg,#c0785a,#d49878)', sk: '#f5efe5', hair: '#c0785a', hairStyle: 'f', eyes: 'big', brow: 'soft', mouth: 'grin', acc: 'h' },
  ISTP: { bg: 'linear-gradient(135deg,#5a6b5a,#788878)', sk: '#f0e6d8', hair: '#5a6b5a', hairStyle: 'm', eyes: 'small', brow: 'sharp', mouth: 'calm', acc: 'w' },
  ISFP: { bg: 'linear-gradient(135deg,#b080b0,#c8a0c8)', sk: '#f8efe8', hair: '#b080b0', hairStyle: 'long', eyes: 'big', brow: 'soft', mouth: 'smile', acc: 'a' },
  ESTP: { bg: 'linear-gradient(135deg,#c06030,#d88050)', sk: '#f0dcc0', hair: '#c06030', hairStyle: 'spiky', eyes: 'small', brow: 'sharp', mouth: 'grin', acc: 'f' },
  ESFP: { bg: 'linear-gradient(135deg,#e06080,#f080a0)', sk: '#f8efe0', hair: '#e06080', hairStyle: 'f', eyes: 'sparkle', brow: 'soft', mouth: 'grin', acc: 's' },
}

/* SVG 角色绘图 */
export default function MbtiCharacter({ mbti }: { mbti: string }) {
  const c = MBTI_CHARS[mbti] || MBTI_CHARS['ENFP']
  const faceCx = 60
  const faceCy = 68
  const faceR = 30

  const renderEyes = () => {
    if (c.eyes === 'small') {
      return `<circle cx="48" cy="63" r="3" fill="#333"/><circle cx="72" cy="63" r="3" fill="#333"/>`
    }
    if (c.eyes === 'sharp') {
      return `<ellipse cx="48" cy="63" rx="5" ry="3.5" fill="#333"/><ellipse cx="72" cy="63" rx="5" ry="3.5" fill="#333"/><circle cx="48" cy="63" r="1.8" fill="white"/><circle cx="72" cy="63" r="1.8" fill="white"/>`
    }
    if (c.eyes === 'sparkle') {
      return `<ellipse cx="48" cy="63" rx="6" ry="7" fill="#333"/><ellipse cx="72" cy="63" rx="6" ry="7" fill="#333"/><circle cx="46" cy="61" r="2.5" fill="white"/><circle cx="70" cy="61" r="2.5" fill="white"/><circle cx="48" cy="65" r="1" fill="white" opacity="0.6"/><circle cx="72" cy="65" r="1" fill="white" opacity="0.6"/>`
    }
    // big eyes
    return `<ellipse cx="48" cy="63" rx="6" ry="6" fill="#333"/><ellipse cx="72" cy="63" rx="6" ry="6" fill="#333"/><circle cx="46" cy="61" r="2.5" fill="white"/><circle cx="70" cy="61" r="2.5" fill="white"/>`
  }

  const renderBrow = () => {
    if (c.brow === 'sharp') {
      return `<path d="M39 52 Q48 48 57 52" stroke="#333" stroke-width="1.8" fill="none"/><path d="M63 52 Q72 48 81 52" stroke="#333" stroke-width="1.8" fill="none"/>`
    }
    if (c.brow === 'worried') {
      return `<path d="M39 50 Q48 55 57 50" stroke="#333" stroke-width="1.5" fill="none"/><path d="M63 50 Q72 55 81 50" stroke="#333" stroke-width="1.5" fill="none"/>`
    }
    // soft
    return `<path d="M39 52 Q48 49 57 52" stroke="#333" stroke-width="1.5" fill="none"/><path d="M63 52 Q72 49 81 52" stroke="#333" stroke-width="1.5" fill="none"/>`
  }

  const renderMouth = () => {
    if (c.mouth === 'smile') return `<path d="M50 80 Q60 88 70 80" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
    if (c.mouth === 'grin') return `<path d="M46 78 Q60 90 74 78" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M52 82 Q60 87 68 82" fill="#e06060"/>`
    if (c.mouth === 'wonder') return `<circle cx="60" cy="82" r="3.5" fill="#333"/>`
    return `<path d="M52 80 Q60 84 68 80" stroke="#333" stroke-width="1.3" fill="none"/>`
  }

  const renderHair = () => {
    const hc = c.hair
    if (c.hairStyle === 'm') {
      return `<path d="M30 60 Q30 30 60 28 Q90 30 90 60 Q90 35 60 32 Q30 35 30 60Z" fill="${hc}"/><path d="M30 60 Q20 55 22 48 Q18 40 28 38" fill="${hc}"/><path d="M90 60 Q100 55 98 48 Q102 40 92 38" fill="${hc}"/>`
    }
    if (c.hairStyle === 'f') {
      return `<path d="M30 60 Q30 25 60 22 Q90 25 90 60 Q90 20 60 17 Q30 20 30 60Z" fill="${hc}"/><path d="M32 30 Q18 32 16 60" fill="${hc}" opacity="0.8"/>`
    }
    if (c.hairStyle === 'spiky') {
      return `<polygon points="40,55 45,18 52,45" fill="${hc}"/><polygon points="55,50 62,10 68,48" fill="${hc}"/><polygon points="70,52 78,22 82,55" fill="${hc}"/>`
    }
    // long
    return `<path d="M30 60 Q28 20 60 18 Q92 20 90 60 Q90 15 60 12 Q30 15 30 60Z" fill="${hc}"/><path d="M28 50 Q12 60 14 90 Q16 100 22 95" fill="${hc}" opacity="0.85"/><path d="M92 50 Q108 60 106 90 Q104 100 98 95" fill="${hc}" opacity="0.85"/>`
  }

  const renderAcc = () => {
    // accessories: simple shapes
    if (c.acc === 's') return `<circle cx="34" cy="54" r="4" fill="none" stroke="#c8a96e" stroke-width="1.5"/>`
    if (c.acc === 'l') return `<circle cx="86" cy="54" r="4.5" fill="#60a5fa" opacity="0.6"/>`
    if (c.acc === 'c') return `<rect x="78" y="48" width="6" height="6" rx="1" fill="#c8a96e" transform="rotate(15 81 51)"/>`
    if (c.acc === 'i') return `<circle cx="28" cy="52" r="3" fill="#f0c860"/>`
    if (c.acc === 'f') return `<path d="M28 55 Q28 48 35 48 Q38 48 38 55" fill="none" stroke="#e8a0a0" stroke-width="1.5"/>`
    if (c.acc === 'h') return `<circle cx="28" cy="54" r="3.5" fill="#f0a0b0" opacity="0.7"/>`
    if (c.acc === 't') return `<circle cx="88" cy="54" r="3" fill="#c8a96e"/>`
    if (c.acc === 'g') return `<rect x="78" y="50" width="5" height="5" rx="2.5" fill="#888"/>`
    if (c.acc === 'w') return `<path d="M28 50 L28 58 M32 52 L32 56" stroke="#666" stroke-width="1.2"/>`
    if (c.acc === 'a') return `<circle cx="86" cy="52" r="3" fill="#e8a0c0"/>`
    return ''
  }

  const svg = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c.bg.split(',')[0].replace('linear-gradient(135deg,','')}"/><stop offset="100%" style="stop-color:${c.bg.split(',')[1].replace(')','')}"/></linearGradient></defs>
    <rect width="120" height="120" rx="20" fill="url(#bg)"/>
    <!-- 身体 -->
    <ellipse cx="60" cy="105" rx="22" ry="10" fill="${c.sk}" opacity="0.5"/>
    <!-- 头发 -->
    ${renderHair()}
    <!-- 脸 -->
    <circle cx="${faceCx}" cy="${faceCy}" r="${faceR}" fill="${c.sk}"/>
    <!-- 腮红 -->
    <circle cx="38" cy="73" r="6" fill="#f0b0b0" opacity="0.35"/>
    <circle cx="82" cy="73" r="6" fill="#f0b0b0" opacity="0.35"/>
    <!-- 眉毛 -->
    ${renderBrow()}
    <!-- 眼睛 -->
    ${renderEyes()}
    <!-- 嘴巴 -->
    ${renderMouth()}
    <!-- 配饰 -->
    ${renderAcc()}
    <text x="60" y="114" text-anchor="middle" font-size="10" fill="white" font-weight="600" font-family="sans-serif">${mbti}</text>
  </svg>`

  return (
    <View
      style={{
        width: 90,
        height: 90,
        flexShrink: 0,
        borderRadius: 14,
        overflow: 'hidden',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}