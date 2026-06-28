// 背包工具 — localStorage 持久化
const KEY = 'lingzhu_backpack'

export interface BackpackItem {
  id: string        // 原料ID (white, purple, scrap 等)
  name: string      // 显示名 (白水晶, 废料 等)
  type: 'gem' | 'scrap'
  count: number
}

export function getBackpack(): BackpackItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addToBackpack(id: string, name: string, type: 'gem' | 'scrap') {
  const bp = getBackpack()
  const exist = bp.find(i => i.id === id)
  if (exist) {
    exist.count++
  } else {
    bp.push({ id, name, type, count: 1 })
  }
  localStorage.setItem(KEY, JSON.stringify(bp))
  return bp
}

export function getGemCount(): number {
  return getBackpack().filter(i => i.type === 'gem').reduce((s, i) => s + i.count, 0)
}

export function getScrapCount(): number {
  return getBackpack().filter(i => i.type === 'scrap').reduce((s, i) => s + i.count, 0)
}

export function clearBackpack() {
  localStorage.removeItem(KEY)
}
