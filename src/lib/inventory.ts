// 珠子库存 — localStorage 持久化（兼容后端 API）
const KEY = 'lingzhu_inventory'

export interface BeadItem {
  id: string        // 唯一 ID
  name: string      // 显示名（如'白水晶珠'）
  material: string  // 原料类型（如'white'）
  quality: string   // 品质（稀有/普通/粗糙）
  count: number
}

export function getInventory(): BeadItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addBead(name: string, material: string, quality: string) {
  const inv = getInventory()
  const id = `${material}_${name}`
  const exist = inv.find(i => i.id === id)
  if (exist) {
    exist.count++
  } else {
    inv.push({ id, name, material, quality, count: 1 })
  }
  localStorage.setItem(KEY, JSON.stringify(inv))
  return inv
}

export function consumeBead(id: string) {
  const inv = getInventory()
  const idx = inv.findIndex(i => i.id === id)
  if (idx >= 0) {
    inv[idx].count--
    if (inv[idx].count <= 0) inv.splice(idx, 1)
    localStorage.setItem(KEY, JSON.stringify(inv))
  }
  return inv
}
