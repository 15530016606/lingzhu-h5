// 珠子库存 — localStorage 缓存 + 后端 API 同步
const KEY = 'lingzhu_inventory'

export interface BeadItem {
  id: string        // 唯一 ID
  name: string      // 显示名（如'白水晶珠'）
  material: string  // 原料类型（如'white'）
  quality: string   // 品质（稀有/普通/粗糙）
  count: number
}

// 从 localStorage 读取（本地缓存）
export function getInventory(): BeadItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveInventory(inv: BeadItem[]) {
  localStorage.setItem(KEY, JSON.stringify(inv))
}

// 从后端 API 同步到本地缓存（登录后调用）
export async function syncInventoryFromAPI(apiData: any[]) {
  const inv: BeadItem[] = apiData.map((d: any) => ({
    id: `${d.materialType}_${d.name}_${d.quality}`,
    name: d.name,
    material: d.materialType,
    quality: d.quality || '普通',
    count: d.count || 0,
  }))
  saveInventory(inv)
  return inv
}

// 添加珠子（本地+后端）
export async function addBead(name: string, material: string, quality: string) {
  const inv = getInventory()
  const id = `${material}_${name}_${quality}`
  const exist = inv.find(i => i.id === id)
  if (exist) { exist.count++ } else { inv.push({ id, name, material, quality, count: 1 }) }
  saveInventory(inv)
  // 后端同步（非阻塞）
  try {
    const { addBeadToAPI } = await import('./api')
    addBeadToAPI(name, material, quality)
  } catch {}
  return inv
}

// 消耗珠子（本地+后端）
export async function consumeBead(id: string, materialType?: string, quality?: string) {
  const inv = getInventory()
  const idx = inv.findIndex(i => i.id === id)
  if (idx >= 0) {
    inv[idx].count--
    if (inv[idx].count <= 0) inv.splice(idx, 1)
    saveInventory(inv)
  }
  return inv
}

// 清空本地缓存（切换用户时调用）
export function clearInventory() {
  localStorage.removeItem(KEY)
}
