import { BeadConfig, Material, MaterialColor } from './data'

/**
 * 使用 Canvas 2D 绘制3D质感手串
 */

interface RenderOptions {
  canvas: HTMLCanvasElement
  config: BeadConfig
  width: number
  height: number
  rotation?: number // 0-360 旋转角度
  showHalo?: boolean // 是否显示光晕效果
}

// 材质种子随机（固定种子，每次绘制纹理位置不变）
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

// 颜色加深/变亮工具
function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.max(0, r - r * amount)},${Math.max(0, g - g * amount)},${Math.max(0, b - b * amount)})`
}
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, r + (255 - r) * amount)},${Math.min(255, g + (255 - g) * amount)},${Math.min(255, b + (255 - b) * amount)})`
}

// 绘制单颗珠子
export function drawBead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  gradient: string[],
  roughness: number,
  metalness: number,
  transparency: number,
  glossType: string = 'glossy',
  seed: number = 0
) {
  ctx.save()

  // 透明度
  if (transparency > 0) {
    ctx.globalAlpha = 1 - transparency * 0.3
  }

  // === 1. 投影（浮空感） ===
  ctx.beginPath()
  ctx.ellipse(cx, cy + radius * 0.85, radius * 0.8, radius * 0.15, 0, 0, Math.PI * 2)
  const shadowGrad = ctx.createRadialGradient(cx, cy + radius * 0.85, 0, cx, cy + radius * 0.85, radius * 0.8)
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.15)')
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadowGrad
  ctx.fill()

  // === 2. 主球体 ===
  const lightX = cx - radius * 0.3
  const lightY = cy - radius * 0.35
  const radGrad = ctx.createRadialGradient(lightX, lightY, 0, cx, cy, radius)
  radGrad.addColorStop(0, gradient[1] || color)
  radGrad.addColorStop(0.4, color)
  radGrad.addColorStop(0.85, gradient[0] || color)
  radGrad.addColorStop(1, darkenColor(gradient[0] || color, 0.3))
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = radGrad
  ctx.fill()

  // === 3. 材质纹理 ===
  if (glossType === 'matte') {
    // 木纹/哑光 — 弧形生长纹
    ctx.globalAlpha = 0.15
    for (let i = 0; i < 6; i++) {
      const angle = seededRandom(seed + i) * Math.PI * 2
      const dist = seededRandom(seed + i + 10) * radius * 0.6
      const tx = cx + Math.cos(angle) * dist
      const ty = cy + Math.sin(angle) * dist
      ctx.beginPath()
      ctx.arc(tx, ty, radius * (0.3 + seededRandom(seed + i + 20) * 0.2), 0, Math.PI * 2)
      ctx.fillStyle = darkenColor(color, 0.15)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  if (glossType === 'glossy' || glossType === 'shiny') {
    // 石纹 — 细微冰裂纹
    ctx.globalAlpha = 0.08
    for (let i = 0; i < 4; i++) {
      const angle = seededRandom(seed + i + 30) * Math.PI * 2
      const dist = seededRandom(seed + i + 40) * radius * 0.5
      const tx = cx + Math.cos(angle) * dist
      const ty = cy + Math.sin(angle) * dist
      ctx.beginPath()
      ctx.moveTo(tx - 2, ty - 2)
      ctx.quadraticCurveTo(tx + seededRandom(seed + i + 50) * 4, ty - seededRandom(seed + i + 60) * 4, tx + 3, ty + 3)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  if (glossType === 'clear') {
    // 水晶/通透 — 内部闪光
    const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.7)
    innerGlow.addColorStop(0, `rgba(255,255,255,${0.2 + transparency * 0.3})`)
    innerGlow.addColorStop(0.5, `rgba(255,255,255,${transparency * 0.1})`)
    innerGlow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = innerGlow
    ctx.fill()

    // 小闪光点
    ctx.globalAlpha = 0.4
    for (let i = 0; i < 3; i++) {
      const sa = seededRandom(seed + i + 70) * Math.PI * 2
      const sd = seededRandom(seed + i + 80) * radius * 0.4
      ctx.beginPath()
      ctx.arc(cx + Math.cos(sa) * sd, cy + Math.sin(sa) * sd, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  if (glossType === 'soft') {
    // 玉石/温润 — 内透暖光（次表面散射效果）
    const sss = ctx.createRadialGradient(cx - radius * 0.15, cy - radius * 0.15, 0, cx, cy, radius * 0.8)
    sss.addColorStop(0, lightenColor(color, 0.3))
    sss.addColorStop(0.5, lightenColor(color, 0.1))
    sss.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = sss
    ctx.fill()
  }

  // === 4. 环境反射 — 底部暗光 ===
  const envGrad = ctx.createRadialGradient(cx, cy + radius * 0.3, 0, cx, cy, radius)
  envGrad.addColorStop(0, `rgba(0,0,0,0)`)
  envGrad.addColorStop(0.6, `rgba(0,0,0,${0.05 + metalness * 0.1})`)
  envGrad.addColorStop(1, `rgba(0,0,0,${0.1 + metalness * 0.15})`)
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = envGrad
  ctx.fill()

  // === 5. 边缘透光 ===
  if (transparency > 0.1) {
    const edgeGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius)
    edgeGrad.addColorStop(0, 'rgba(255,255,255,0)')
    edgeGrad.addColorStop(1, `rgba(255,255,255,${transparency * 0.25})`)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = edgeGrad
    ctx.fill()
  }

  // === 6. 主高光（可爱感——大而圆的闪光） ===
  const hlX = cx - radius * 0.2
  const hlY = cy - radius * 0.3
  const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, radius * 0.55)
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.7)')
  hlGrad.addColorStop(0.25, 'rgba(255,255,255,0.25)')
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = hlGrad
  ctx.fill()

  // 可爱小高光点（二次光斑）
  const dotX = cx - radius * 0.35
  const dotY = cy - radius * 0.45
  const dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, radius * 0.18)
  dotGrad.addColorStop(0, 'rgba(255,255,255,0.85)')
  dotGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = dotGrad
  ctx.fill()

  // === 7. 金属拉丝 ===
  if (metalness > 0.3) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()
    const metalGrad = ctx.createLinearGradient(cx - radius, cy - radius * 0.5, cx + radius, cy + radius * 0.5)
    metalGrad.addColorStop(0, `rgba(255,255,255,${metalness * 0.35})`)
    metalGrad.addColorStop(0.4, `rgba(255,255,255,0)`)
    metalGrad.addColorStop(0.6, `rgba(255,255,255,0)`)
    metalGrad.addColorStop(1, `rgba(255,255,255,${metalness * 0.15})`)
    ctx.fillStyle = metalGrad
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.restore()
  }

  // === 8. 边缘描边（让珠子轮廓清晰） ===
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(255,255,255,${0.1 + roughness * 0.05})`
  ctx.lineWidth = 0.8
  ctx.stroke()

  ctx.restore()
}

// 绘制配珠（隔片、吊坠等）
function drawAccessory(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  type: string,
  radius: number
) {
  ctx.save()
  switch (type) {
    case 'spacer_gold':
      // 金色小圆片
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2)
      const goldGrad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, radius * 0.5)
      goldGrad.addColorStop(0, '#FFD700')
      goldGrad.addColorStop(0.5, '#DAA520')
      goldGrad.addColorStop(1, '#B8860B')
      ctx.fillStyle = goldGrad
      ctx.fill()
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 0.5
      ctx.stroke()
      break

    case 'spacer_silver':
      // 银色小圆片
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2)
      const silverGrad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, radius * 0.5)
      silverGrad.addColorStop(0, '#FFFFFF')
      silverGrad.addColorStop(0.5, '#C0C0C0')
      silverGrad.addColorStop(1, '#808080')
      ctx.fillStyle = silverGrad
      ctx.fill()
      ctx.strokeStyle = '#E8E8E8'
      ctx.lineWidth = 0.5
      ctx.stroke()
      break

    case 'tassel':
      // 流苏 - 下方飘带
      ctx.beginPath()
      for (let i = -3; i <= 3; i++) {
        ctx.moveTo(cx + i * 2, cy)
        ctx.lineTo(cx + i * 4, cy + radius * 1.5 + Math.sin(i * 0.8) * 5)
      }
      ctx.strokeStyle = '#D4A84B'
      ctx.lineWidth = 1.5
      ctx.stroke()
      // 流苏顶部小环
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#D4A84B'
      ctx.fill()
      break

    case 'pendant':
      // 水滴形吊坠
      ctx.beginPath()
      ctx.moveTo(cx, cy - radius * 0.8)
      ctx.quadraticCurveTo(cx + radius * 0.5, cy, cx, cy + radius * 0.6)
      ctx.quadraticCurveTo(cx - radius * 0.5, cy, cx, cy - radius * 0.8)
      const pendantGrad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, radius * 0.6)
      pendantGrad.addColorStop(0, '#E8D0FF')
      pendantGrad.addColorStop(0.5, '#C080D0')
      pendantGrad.addColorStop(1, '#A060B0')
      ctx.fillStyle = pendantGrad
      ctx.fill()
      ctx.strokeStyle = '#D4A84B'
      ctx.lineWidth = 1
      ctx.stroke()
      break
  }
  ctx.restore()
}

// 绘制整串手串
export function renderBeadBracelet(options: RenderOptions) {
  const { canvas, config, width, height, rotation = 0, showHalo = true } = options
  if (!canvas || !config.material || !config.color) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 高清屏适配
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 2
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.scale(dpr, dpr)

  // 清空
  ctx.clearRect(0, 0, width, height)

  // 绘制背景光晕
  if (showHalo) {
    const haloGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2)
    haloGrad.addColorStop(0, 'rgba(255, 107, 107, 0.08)')
    haloGrad.addColorStop(0.5, 'rgba(255, 107, 107, 0.03)')
    haloGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = haloGrad
    ctx.fillRect(0, 0, width, height)
  }

  const { material, color, accessories, beadCount } = config
  const beadRadius = Math.min(width, height) / (beadCount + 4)
  const radius = Math.min(beadRadius, 18)

  // 椭圆轨道参数（制造3D环绕效果）
  const centerX = width / 2
  const centerY = height / 2
  const radiusX = Math.min(centerX - radius - 10, (width / 2) - radius - 10)
  const radiusY = radiusX * 0.55

  // 根据旋转角度偏移
  const rotationRad = (rotation * Math.PI) / 180

  // 绘制穿绳
  ctx.save()
  ctx.beginPath()
  const steps = 128
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 + rotationRad
    const x = centerX + Math.cos(angle) * radiusX
    const y = centerY + Math.sin(angle) * radiusY
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(100, 80, 60, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 计算每个珠子的位置
  const beadPositions: Array<{ x: number; y: number; z: number }> = []
  for (let i = 0; i < beadCount; i++) {
    const angle = (i / beadCount) * Math.PI * 2 + rotationRad
    const x = centerX + Math.cos(angle) * radiusX
    const y = centerY + Math.sin(angle) * radiusY
    // z 轴用于深度排序 (sin为正 = 前面)
    const z = Math.sin(angle)
    beadPositions.push({ x, y, z })
  }

  // 按z排序（先画后面的）
  const sortedIndices = beadPositions
    .map((_, i) => i)
    .sort((a, b) => beadPositions[a].z - beadPositions[b].z)

  // 绘制每颗珠子 + 配珠
  for (const idx of sortedIndices) {
    const pos = beadPositions[idx]
    const zScale = 0.7 + (pos.z + 1) * 0.15 // 前后缩放

    // 画珠子
    drawBead(
      ctx,
      pos.x, pos.y,
      radius * zScale,
      color.hex,
      color.gradient,
      material.roughness,
      material.metalness,
      material.transparency,
      material.glossType,
      idx
    )

    // 检查此位置是否有配珠
    const accAtPos = accessories.find(a => a.position === idx % (beadCount || 1))
    if (accAtPos) {
      drawAccessory(ctx, pos.x, pos.y - radius * zScale * 0.8, accAtPos.accessory.type, radius * zScale)
    }
  }

  // 绘制装饰性金粉（固定种子，不闪烁）
  if (showHalo) {
    for (let i = 0; i < 50; i++) {
      const seed = (i * 137.508) % 360
      const dist = ((i * 73.7 + 31) % 100) / 100 * Math.max(width, height) * 0.4 + 20
      const angle = seed
      const x = centerX + Math.cos(angle) * dist
      const y = centerY + Math.sin(angle) * dist * 0.55
      const size = ((i * 47.3 + 13) % 20) / 20 * 2 + 0.5
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 215, 0, ${((i * 137.5 + 7) % 30) / 100 + 0.1})`
      ctx.fill()
    }
  }
}

/**
 * 生成结果卡（3:4 竖版）
 */
export function renderResultCard(
  canvas: HTMLCanvasElement,
  config: BeadConfig,
  poem: string,
  title: string,
  advice: string,
  date: string
) {
  const W = 600
  const H = 800 // 3:4
  const dpr = 2
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(dpr, dpr)

  // 1. 深色渐变背景
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0D0D1A')
  bgGrad.addColorStop(0.5, '#1A1030')
  bgGrad.addColorStop(1, '#2A1A3E')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // 2. 金粉散落装饰
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const size = Math.random() * 2.5 + 1
    const alpha = Math.random() * 0.25 + 0.05
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(212, 160, 90, ${alpha})`
    ctx.fill()
  }

  // 3. 装饰性边框
  ctx.save()
  ctx.strokeStyle = 'rgba(212,160,90,0.3)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(20, 20, W - 40, H - 40)
  ctx.strokeStyle = 'rgba(212,160,90,0.15)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(30, 30, W - 60, H - 60)
  ctx.restore()

  // 4. 绘制标题
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.font = 'bold 28px sans-serif'
  ctx.fillStyle = '#D4A05A'
  ctx.fillText('灵珠手作', W / 2, 55)

  ctx.font = 'bold 24px sans-serif'
  ctx.fillStyle = '#F7F0E6'
  ctx.fillText(title, W / 2, 95)

  // 5. 绘制手串（缩小版）
  const braceletCanvas = document.createElement('canvas')
  braceletCanvas.width = 400
  braceletCanvas.height = 200
  renderBeadBracelet({
    canvas: braceletCanvas,
    config,
    width: 400,
    height: 200,
    rotation: 0,
    showHalo: false
  })
  ctx.drawImage(braceletCanvas, W / 2 - 180, 140, 360, 180)

  // 6. 绘制签诗
  ctx.font = '16px sans-serif'
  ctx.fillStyle = '#B8A89A'
  ctx.textBaseline = 'top'
  const poemLines = poem.split('\n')
  let poemY = 345
  for (let i = 0; i < poemLines.length; i++) {
    ctx.fillText(poemLines[i], W / 2, poemY)
    poemY += 26
  }

  // 7. 绘制建议
  ctx.font = '13px sans-serif'
  ctx.fillStyle = '#6A5E52'
  ctx.textBaseline = 'top'
  const maxWidth = W - 80
  const wrapText = (text: string, x: number, y: number, maxW: number, lineH: number) => {
    let line = ''
    let ly = y
    for (let i = 0; i < text.length; i++) {
      const testLine = line + text[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxW && i > 0) {
        ctx.fillText(line, x, ly)
        line = text[i]
        ly += lineH
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, ly)
    return ly + lineH
  }
  wrapText(advice, W / 2 - (maxWidth / 2), poemY + 15, maxWidth, 20)

  // 8. 底部日期
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#6A5E52'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`灵珠手作 · ${date}`, W / 2, H - 45)

  ctx.restore()
}

// === 根据 BeadItem[] 数组逐颗渲染 ===
export function renderBeadBraceletItems(
  canvas: HTMLCanvasElement,
  beads: Array<{ material: Material; color: MaterialColor }>,
  width: number,
  height: number,
  rotation: number = 0,
  showHalo: boolean = true
) {
  if (!canvas || beads.length === 0) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = 2
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  if (showHalo) {
    const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2)
    halo.addColorStop(0, 'rgba(255, 107, 107, 0.08)')
    halo.addColorStop(0.5, 'rgba(255, 107, 107, 0.03)')
    halo.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, width, height)
  }

  const centerX = width / 2
  const centerY = height / 2
  const beadCount = beads.length
  const beadRadius = Math.min(width, height) / (beadCount + 4)
  const radius = Math.min(beadRadius, 22)
  const radiusX = Math.min(centerX - radius - 10, (width / 2) - radius - 10)
  const radiusY = radiusX * 0.55
  const rotRad = (rotation * Math.PI) / 180

  // 穿绳
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2 + rotRad
    const x = centerX + Math.cos(a) * radiusX
    const y = centerY + Math.sin(a) * radiusY
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(100, 80, 60, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 珠子位置
  const positions = Array.from({ length: beadCount }, (_, i) => {
    const a = (i / beadCount) * Math.PI * 2 + rotRad
    return { x: centerX + Math.cos(a) * radiusX, y: centerY + Math.sin(a) * radiusY, z: Math.sin(a) }
  })

  const sorted = positions.map((_, i) => i).sort((a, b) => positions[a].z - positions[b].z)

  for (const idx of sorted) {
    const pos = positions[idx]
    const zScale = 0.7 + (pos.z + 1) * 0.15
    const bead = beads[idx % beads.length]
    drawBead(ctx, pos.x, pos.y, radius * zScale, bead.color.hex, bead.color.gradient, bead.material.roughness, bead.material.metalness, bead.material.transparency, bead.material.glossType, idx)
  }
}

// === 手绘动画风珠子 ===
function drawBeadHandDrawn(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, hex: string, grad: string[], seed: number) {
  // 不规则形状（水彩笔触——明显的手绘不规则感）
  const wobbleA = ((seed * 7.3 + 3) % 10) / 50 + 0.04    // 0.04-0.24
  const wobbleB = ((seed * 11.7 + 7) % 10) / 50 + 0.02   // 0.02-0.22
  const rx = r * (1 + wobbleA)
  const ry = r * (1 + wobbleB)
  const rot = (seed * 23.7 + 13) % 360

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot * Math.PI / 180)

  // 第一层：大面积水彩晕染底色（溢出的边缘，手绘感）
  for (let layer = 0; layer < 3; layer++) {
    const spread = 1 + layer * 0.12
    ctx.beginPath()
    ctx.ellipse(0, 0, rx * spread, ry * spread, 0, 0, Math.PI * 2)
    ctx.fillStyle = hex + ['0C', '10', '08'][layer]
    ctx.fill()
  }

  // 第二层：主体——斑驳水彩叠加（用两个偏移椭圆制造不均匀着色）
  const offX = ((seed * 3.7 + 1) % 10) / 100 * r
  const offY = ((seed * 5.3 + 2) % 10) / 100 * r
  ctx.beginPath()
  ctx.ellipse(offX, offY, rx * 0.85, ry * 0.85, 0, 0, Math.PI * 2)
  ctx.fillStyle = hex + '25'
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, 0, rx * 0.9, ry * 0.9, 0, 0, Math.PI * 2)
  const mainGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, 0, 0, 0, r * 0.9)
  mainGrad.addColorStop(0, grad[1] || hex)
  mainGrad.addColorStop(0.5, hex)
  mainGrad.addColorStop(1, grad[0] || hex)
  ctx.fillStyle = mainGrad
  ctx.fill()

  // 第三层：水印般的边缘渗色（水彩边缘堆积效果，用珠子自身颜色，无黑边）
  ctx.beginPath()
  ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2)
  ctx.strokeStyle = hex + '15'
  ctx.lineWidth = 5
  ctx.stroke()

  // 高光：手绘留白感（哑光白斑，不是尖锐反光）
  ctx.beginPath()
  ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.22, r * 0.16, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.08, r * 0.06, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()

  ctx.restore()
}

export function renderHandDrawnBracelet(canvas: HTMLCanvasElement, beads: Array<{ material: { colors: Array<{ hex: string; gradient: string[] }>; glossType: string }; color: { hex: string; gradient: string[] } }>, width: number, height: number, rotation: number = 0) {
  if (!canvas || beads.length === 0) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = 2
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const cx = width / 2, cy = height / 2
  const count = beads.length
  const beadR = Math.min(Math.min(width, height) / (count + 4), 22)
  const rx = Math.min(cx - beadR - 10, width / 2 - beadR - 10)
  const ry = rx * 0.55
  const rotRad = rotation * Math.PI / 180

  // 穿绳（虚线手绘风格）
  ctx.save()
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2 + rotRad
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(200,150,150,0.3)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // 珠子位置
  const positions = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + rotRad
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, z: Math.sin(a) }
  })
  const sorted = positions.map((_, i) => i).sort((a, b) => positions[a].z - positions[b].z)

  for (const idx of sorted) {
    const pos = positions[idx]
    const zScale = 0.7 + (pos.z + 1) * 0.15
    const bead = beads[idx % beads.length]
    drawBeadHandDrawn(ctx, pos.x, pos.y, beadR * zScale, bead.color.hex, bead.color.gradient, idx)
  }
}

export function drawSingleHandDrawnBead(canvas: HTMLCanvasElement, hex: string, gradient: string[], seed: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = 2
  canvas.width = 120 * dpr
  canvas.height = 120 * dpr
  canvas.style.width = '120px'
  canvas.style.height = '120px'
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, 120, 120)
  drawBeadHandDrawn(ctx, 60, 60, 42, hex, gradient, seed)
}