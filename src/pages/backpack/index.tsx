import { useCallback, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { getBackpack, BackpackItem, getGemCount, getScrapCount } from '@/lib/backpack'
import { MATERIAL_TO_SOURCE, MATERIAL_INFO } from '@/lib/material-map'

export default function BackpackPage() {
  const [bp, setBp] = useState<BackpackItem[]>([])

  const refresh = useCallback(() => setBp(getBackpack()), [])

  useEffect(refresh, [])

  const gems = bp.filter(i => i.type === 'gem')
  const scraps = bp.filter(i => i.type === 'scrap')
  const gemTotal = gems.reduce((s, i) => s + i.count, 0)
  const scrapTotal = scraps.reduce((s, i) => s + i.count, 0)

  const goProcess = useCallback((item: BackpackItem) => {
    const source = MATERIAL_TO_SOURCE[item.id] || 'crystal'
    Taro.navigateTo({
      url: `/pages/processing/index?source=${source}&material=${item.id}&name=${encodeURIComponent(item.name)}`
    })
  }, [])

  const exchangeScrap = useCallback(() => {
    if (scrapTotal < 5) {
      Taro.showToast({ title: '至少5个废料才能兑换', icon: 'none' })
      return
    }
    // 简化：5废料 → 随机原料
    const bp2 = getBackpack()
    let remain = 5
    for (let i = bp2.length - 1; i >= 0 && remain > 0; i--) {
      if (bp2[i].type === 'scrap') {
        const take = Math.min(bp2[i].count, remain)
        bp2[i].count -= take
        remain -= take
        if (bp2[i].count <= 0) bp2.splice(i, 1)
      }
    }
    // 给随机原料
    const mats = Object.keys(MATERIAL_INFO)
    const randId = mats[Math.floor(Math.random() * mats.length)]
    const info = MATERIAL_INFO[randId]
    const exist = bp2.find(i => i.id === randId)
    if (exist) { exist.count++ } else {
      bp2.push({ id: randId, name: info.label, type: 'gem', count: 1 })
    }
    Taro.setStorageSync('lingzhu_backpack', JSON.stringify(bp2))
    refresh()
    Taro.showToast({ title: '兑换成功!', icon: 'success' })
  }, [scrapTotal, refresh])

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', background: theme.bgCard, borderBottom: `1px solid ${theme.borderLight}`,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
      }}>
        <span onClick={() => Taro.navigateBack()} style={{ fontSize: 16, color: theme.textSecondary, marginRight: 12, cursor: 'pointer', touchAction: 'manipulation' }}>‹</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>我的背包</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: theme.textSecondary }}>{gemTotal} 原料 · {scrapTotal} 废料</span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

        {/* 原料区域 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>原料</span>
            <span style={{ fontSize: 10, color: theme.textSecondary }}>{gemTotal} 个</span>
          </div>
          {gems.length === 0 ? (
            <div style={{
              padding: 30, alignItems: 'center', borderRadius: theme.radiusCard,
              background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            }}>
              <span style={{ fontSize: 12, color: theme.textDisabled, textAlign: 'center' }}>
                背包里还没有原料，去采集源玩游戏获取吧
              </span>
              <div onClick={() => Taro.navigateBack()} style={{
                marginTop: 10, padding: '8px 20px', borderRadius: 16,
                background: theme.primary, cursor: 'pointer', touchAction: 'manipulation',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>返回首页</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gems.map(item => {
                const info = MATERIAL_INFO[item.id] || { label: item.name, color: '#999', bg: '#eee' }
                return (
                  <div key={item.id} style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 12,
                    background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
                  }}>
                    {/* 颜色球 */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: `radial-gradient(circle at 35% 30%, ${info.bg}, ${info.color})`,
                      boxShadow: `0 2px 6px ${info.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                        {info.label.charAt(0)}
                      </span>
                    </div>
                    {/* 名称 + 数量 */}
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{info.label}</span>
                      <span style={{ fontSize: 11, color: theme.textSecondary, marginLeft: 6 }}>x{item.count}</span>
                    </div>
                    {/* 加工按钮 */}
                    <span
                      onClick={() => goProcess(item)}
                      onTouchEnd={() => goProcess(item)}
                      style={{
                        padding: '6px 14px', borderRadius: 14, cursor: 'pointer', touchAction: 'manipulation',
                        background: `linear-gradient(135deg, ${info.color}88, ${info.color})`,
                        fontSize: 11, fontWeight: 600, color: '#fff',
                      }}
                    >加工</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 废料区域 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#a09888' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>废料</span>
            <span style={{ fontSize: 10, color: theme.textSecondary }}>{scrapTotal} 个</span>
          </div>
          <div style={{
            padding: '12px', borderRadius: 12,
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: theme.textSecondary, flex: 1 }}>
              5个废料可以兑换1个随机原料
            </span>
            <span
              onClick={exchangeScrap}
              onTouchEnd={exchangeScrap}
              style={{
                padding: '6px 14px', borderRadius: 14, cursor: 'pointer', touchAction: 'manipulation',
                background: scrapTotal >= 5 ? '#a09888' : theme.borderLight,
                fontSize: 11, fontWeight: 600, color: scrapTotal >= 5 ? '#fff' : theme.textDisabled,
              }}
            >兑换原料</span>
          </div>
        </div>

        {/* 提示 */}
        <div style={{ padding: '12px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: theme.textDisabled, lineHeight: 1.8 }}>
            采集源游戏可获取更多原料
          </span>
        </div>
      </div>
    </div>
  )
}
