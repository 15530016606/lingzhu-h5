// 统一 API 客户端 — 自动携带 JWT token
const BASE_URL = ''

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request(path: string, options?: RequestInit): Promise<any> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers || {}) as Record<string, string> },
    })
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

// ===== 用户 API =====
export async function login(phone: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
}

export async function register(phone: string, password: string) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
}

export async function getMe() {
  return request('/auth/me')
}

// ===== 每日盲盒 =====
export async function claimDaily() {
  return request('/user/claim-daily', { method: 'POST' })
}

// ===== 原料背包 API =====
export async function getMaterialsFromAPI(): Promise<any[]> {
  return request('/user/materials') || []
}

export async function addMaterialToAPI(materialType: string, count = 1) {
  return request('/user/materials/add', {
    method: 'POST',
    body: JSON.stringify({ materialType, count }),
  })
}

export async function consumeMaterialFromAPI(materialType: string) {
  return request('/user/materials/consume', {
    method: 'POST',
    body: JSON.stringify({ materialType }),
  })
}

// ===== 珠子库存 API =====
export async function getBeadsFromAPI(): Promise<any[]> {
  return request('/user/beads') || []
}

export async function addBeadToAPI(name: string, materialType: string, quality: string) {
  return request('/user/beads/add', {
    method: 'POST',
    body: JSON.stringify({ name, materialType, quality }),
  })
}
