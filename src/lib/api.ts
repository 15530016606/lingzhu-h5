// 前端 API 客户端
// Taro H5 dev server 已配置 proxy: /api → localhost:3000

const API_BASE = '/api'

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface ProductDTO {
  id: number
  name: string
  type: 'bead' | 'accessory'
  category: string
  materialType: string | null
  size: string | null
  price: number    // 分
  imageUrl: string
  stock: number
  isActive: boolean
}

export interface OreDTO {
  id: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  imageUrl: string
  polishMs: number
  outputs: string
}

export interface PaginatedResult {
  data: any[]
  total: number
  page: number
  limit: number
}

export const api = {
  getProducts(params?: { type?: string; category?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.category) q.set('category', params.category)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return fetchJSON(`/products?${q}`) as Promise<PaginatedResult>
  },

  getProduct(id: number) {
    return fetchJSON(`/products/${id}`) as Promise<ProductDTO>
  },

  getCategories() {
    return fetchJSON('/products/categories') as Promise<string[]>
  },

  getOres() {
    return fetchJSON('/ores') as Promise<OreDTO[]>
  },
}
