// 背包工具 — localStorage 缓存 + 后端 API 同步
const KEY = 'lingzhu_backpack'

export interface BackpackItem {
  id: string        // 原料ID (white, purple, scrap 等)
  name: string      // 显示名 (白水晶, 废料 等)
  type: 'gem' | 'scrap'
  count: number
}

// 从 localStorage 读取（本地缓存）
export function getBackpack(): BackpackItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// 保存到 localStorage
function saveBackpack(bp: BackpackItem[]) {
  localStorage.setItem(KEY, JSON.stringify(bp))
}

// 从后端 API 同步到本地缓存（登录后调用）
export async function syncBackpackFromAPI(apiData: any[]) {
  const bp: BackpackItem[] = apiData.map((d: any) => ({
    id: d.materialType || d.id,
    name: d.name || d.materialType,
    type: 'gem' as const,
    count: d.count || 0,
  }))
  saveBackpack(bp)
  return bp
}

// 添加原料（本地+后端）
export async function addToBackpack(id: string, name: string, type: 'gem' | 'scrap', apiType?: string) {
  // 本地
  const bp = getBackpack()
  const exist = bp.find(i => i.id === id)
  if (exist) { exist.count++ } else { bp.push({ id, name, type, count: 1 }) }
  saveBackpack(bp)
  // 后端（非阻塞）
  try {
    const { addMaterialToAPI } = await import('./api')
    addMaterialToAPI(apiType || id)
  } catch {}
  return bp
}

// 消耗原料（本地+后端）
export async function consumeBackpackItem(id: string, apiType?: string) {
  const bp = getBackpack()
  const idx = bp.findIndex(i => i.id === id)
  if (idx >= 0) {
    bp[idx].count--
    if (bp[idx].count <= 0) bp.splice(idx, 1)
    saveBackpack(bp)
  }
  try {
    const { consumeMaterialFromAPI } = await import('./api')
    consumeMaterialFromAPI(apiType || id)
  } catch {}
  return bp
}

// 清空本地缓存（切换用户时调用）
export function clearBackpack() {
  localStorage.removeItem(KEY)
}

export function getGemCount(): number {
  return getBackpack().filter(i => i.type === 'gem').reduce((s, i) => s + i.count, 0)
}

export function getScrapCount(): number {
  return getBackpack().filter(i => i.type === 'scrap').reduce((s, i) => s + i.count, 0)
}
