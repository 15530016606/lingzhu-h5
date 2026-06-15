import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Material, MaterialColor, Accessory, BeadConfig, Fortune, DailyRecord, SignInRecord, getDailyFortune, DAILY_FREE_COUNT, BeadItem, RopeType, ROPE_TYPES, Charm, BEAD_SIZES_MM, recommendBeadCount } from './data'
import { BeadProduct, calcWristSize, calcTotalPrice } from '../data/bead-products'

type GameMode = 'free' | 'wish' | 'couple'

interface BeadStore {
  // 游戏模式
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void

  // V1 珠子配置（兼容首页预览等）
  beadConfig: BeadConfig
  setMaterial: (material: Material) => void
  setColor: (color: MaterialColor) => void
  setAccessories: (accessories: Array<{ accessory: Accessory; position: number }>) => void
  addAccessory: (accessory: Accessory) => void
  removeAccessory: (index: number) => void
  updateAccessoryPosition: (index: number, position: number) => void
  setBeadCount: (count: number) => void
  resetConfig: () => void

  // V2 自由编新模型
  beads: BeadItem[]
  wristSizeCm: number
  rope: RopeType
  charms: Charm[]
  addBead: (bead: BeadItem) => void
  removeBead: (index: number) => void
  updateBead: (index: number, bead: BeadItem) => void
  setWristSize: (cm: number) => void
  setRope: (rope: RopeType) => void
  addCharm: (charm: Charm) => void
  removeCharm: (index: number) => void
  resetBeads: () => void

  // V3 自由编 Designer（珠了个珠模式）
  currentDesign: BeadProduct[]
  ropeColor: string
  addToDesign: (product: BeadProduct) => void
  removeFromDesign: (index: number) => void
  reorderDesign: (fromIndex: number, toIndex: number) => void
  clearDesign: () => void
  setRopeColor: (color: string) => void

  // 运势
  fortune: Fortune | null
  generateFortune: () => void

  // 每日额度
  dailyRecord: DailyRecord
  updateDailyRecord: (record: DailyRecord) => void
  consumeChance: () => boolean

  // 签到记录
  signInRecords: SignInRecord[]
  setSignInRecords: (records: SignInRecord[]) => void
  signIn: () => void
  getStreakCount: () => number
}

const defaultConfig: BeadConfig = {
  material: null,
  color: null,
  accessories: [],
  beadCount: 14,
}

export const useBeadStore = create<BeadStore>()(
  persist(
    (set, get) => ({
      gameMode: 'free' as GameMode,
      setGameMode: (mode) => set({ gameMode: mode }),

      beadConfig: { ...defaultConfig },

      setMaterial: (material) =>
        set((state) => ({
          beadConfig: { ...state.beadConfig, material, color: null }
        })),

      setColor: (color) =>
        set((state) => ({
          beadConfig: { ...state.beadConfig, color }
        })),

      setAccessories: (accessories) =>
        set((state) => ({
          beadConfig: { ...state.beadConfig, accessories }
        })),

      addAccessory: (accessory) =>
        set((state) => ({
          beadConfig: {
            ...state.beadConfig,
            accessories: [...state.beadConfig.accessories, { accessory, position: state.beadConfig.accessories.length }]
          }
        })),

      removeAccessory: (index) =>
        set((state) => ({
          beadConfig: {
            ...state.beadConfig,
            accessories: state.beadConfig.accessories.filter((_, i) => i !== index)
          }
        })),

      updateAccessoryPosition: (index, position) =>
        set((state) => ({
          beadConfig: {
            ...state.beadConfig,
            accessories: state.beadConfig.accessories.map((item, i) =>
              i === index ? { ...item, position } : item
            )
          }
        })),

      setBeadCount: (count) =>
        set((state) => ({
          beadConfig: { ...state.beadConfig, beadCount: count }
        })),

      resetConfig: () =>
        set({ beadConfig: { ...defaultConfig }, fortune: null }),

      // V2 自由编
      beads: [],
      wristSizeCm: 16,
      rope: ROPE_TYPES[0],
      charms: [],

      addBead: (bead) =>
        set((state) => ({ beads: [...state.beads, bead] })),

      removeBead: (index) =>
        set((state) => ({ beads: state.beads.filter((_, i) => i !== index) })),

      updateBead: (index, bead) =>
        set((state) => ({
          beads: state.beads.map((b, i) => i === index ? bead : b)
        })),

      setWristSize: (cm) => set({ wristSizeCm: cm }),

      setRope: (rope) => set({ rope }),

      addCharm: (charm) =>
        set((state) => ({ charms: [...state.charms, charm] })),

      removeCharm: (index) =>
        set((state) => ({ charms: state.charms.filter((_, i) => i !== index) })),

      resetBeads: () => set({ beads: [], charms: [], rope: ROPE_TYPES[0] }),

      // V3 自由编 Designer
      currentDesign: [],
      ropeColor: 'rgba(180,180,180,0.6)',
      addToDesign: (product) =>
        set((state) => ({
          currentDesign: [...state.currentDesign, { ...product, _key: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]
        })),
      removeFromDesign: (index) =>
        set((state) => ({ currentDesign: state.currentDesign.filter((_, i) => i !== index) })),
      reorderDesign: (fromIndex, toIndex) =>
        set((state) => {
          const arr = [...state.currentDesign]
          const [item] = arr.splice(fromIndex, 1)
          arr.splice(toIndex, 0, item)
          return { currentDesign: arr }
        }),
      clearDesign: () => set({ currentDesign: [] }),
      setDesign: (products: BeadProduct[]) =>
        set({
          currentDesign: products.map((p) => ({
            ...p,
            _key: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          })),
        }),
      setRopeColor: (color) => set({ ropeColor: color }),

      fortune: null,
      generateFortune: () =>
        set({ fortune: getDailyFortune() }),

      dailyRecord: {
        date: new Date().toISOString().split('T')[0],
        count: 0,
        maxCount: DAILY_FREE_COUNT,
      },
      updateDailyRecord: (record) => set({ dailyRecord: record }),

      consumeChance: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        let record = state.dailyRecord

        if (record.date !== today) {
          record = { date: today, count: 0, maxCount: DAILY_FREE_COUNT }
        }

        if (record.count >= record.maxCount) return false

        record.count++
        set({ dailyRecord: { ...record } })
        return true
      },

      signInRecords: [],
      setSignInRecords: (records) => set({ signInRecords: records }),

      signIn: () => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => {
          const exists = state.signInRecords.some(r => r.date === today)
          if (exists) return state
          return {
            signInRecords: [...state.signInRecords, { date: today, signed: true }]
          }
        })
      },

      getStreakCount: () => {
        const records = get().signInRecords
        if (records.length === 0) return 0
        const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
        let streak = 0
        const today = new Date()
        for (let i = 0; i < sorted.length; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const dateStr = checkDate.toISOString().split('T')[0]
          if (sorted.some(r => r.date === dateStr && r.signed)) {
            streak++
          } else {
            break
          }
        }
        return streak
      },
    }),
    {
      name: 'lingzhu-bead-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dailyRecord: state.dailyRecord,
        signInRecords: state.signInRecords,
        gameMode: state.gameMode,
      }),
    }
  )
)
