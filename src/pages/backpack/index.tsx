import { useCallback, useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { theme } from '@/lib/theme'
import { getBackpack, BackpackItem } from '@/lib/backpack'
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
    const mats = Object.keys(MATERIAL_INFO)
    const randId = mats[Math.floor(Math.random() * mats.length)]
    const info = MATERIAL_INFO[randId]
    const exist = bp2.find(i => i.id === randId)
    if (exist) { exist.count++ } else {
      bp2.push({ id: randId, name: info.label, type: 'gem', count: 1 })
    }
    Taro.setStorageSync('lingzhu_backpack', JSON.stringify(bp2))
    refresh()
    Taro.showToast({ title: '兑换成功! 获得' + info.label, icon: 'success' })
  }, [scrapTotal, refresh])

  return (
    <div style={{ minHeight: '100vh', background: theme.bgPage }}>
      {/* 顶栏 */}
      <div style={{
        padding: '14px 16px', background: theme.bgCard,
        borderBottom: `1px solid ${theme.borderLight}`,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}>
        <span onClick={() => Taro.navigateBack()} style={{
          fontSize: 16, color: theme.textSecondary, marginRight: 12,
          cursor: 'pointer', touchAction: 'manipulation',
          padding: '2px 6px',
        }}>‹</span>
        <div style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginRight: 8,
          background: 'linear-gradient(135deg, #e0d0b0, #d4c8a0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>背</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>背包</span>
        <div style={{ flex: 1 }} />
        <div style={{
          padding: '3px 10px', borderRadius: 10,
          background: gemTotal > 0 ? `${theme.accent}22` : theme.borderLight,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: gemTotal > 0 ? theme.accent : theme.textDisabled }}>
            {gemTotal} 原料 · {scrapTotal} 废料
          </span>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

        {/* 原料区域 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 8,
              background: 'linear-gradient(135deg, #a0c4ff, #69f0ae)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>原</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>原料</span>
            <span style={{ fontSize: 10, color: theme.textSecondary }}>{gemTotal} 个</span>
            <div style={{ flex: 1 }} />
            {gems.length > 0 && (
              <span style={{ fontSize: 9, color: theme.textSecondary }}>点击"加工"制成珠子</span>
            )}
          </div>
          {gems.length === 0 ? (
            <div style={{
              padding: 40, borderRadius: 16, textAlign: 'center',
              background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            }}>
              <div style={{ fontSize: 32, opacity: 0.12, marginBottom: 8 }}>🎒</div>
              <div style={{ fontSize: 12, color: theme.textDisabled, marginBottom: 12 }}>
                背包空空的，去采集源玩游戏获取原料吧
              </div>
              <div onClick={() => Taro.navigateBack()} style={{
                padding: '8px 24px', borderRadius: 16, cursor: 'pointer', touchAction: 'manipulation',
                background: `linear-gradient(135deg, ${theme.primary}, #c4956a)`,
                display: 'inline-block',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>返回首页</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gems.map(item => {
                const info = MATERIAL_INFO[item.id] || { label: item.name, color: '#999', bg: '#eee' }
                return (
                  <div key={item.id} style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 14,
                    background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
                    boxShadow: `0 2px 6px ${theme.shadow}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `radial-gradient(circle at 35% 30%, ${info.bg}, ${info.color})`,
                      boxShadow: `0 2px 8px ${info.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{info.label.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1, marginLeft: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{info.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: info.color }}>x{item.count}</span>
                      </div>
                      <span style={{ fontSize: 9, color: theme.textSecondary }}>点击加工成珠子</span>
                    </div>
                    <span
                      onClick={() => goProcess(item)}
                      onTouchEnd={() => goProcess(item)}
                      style={{
                        padding: '7px 16px', borderRadius: 16, cursor: 'pointer', touchAction: 'manipulation',
                        background: `linear-gradient(135deg, ${info.color}88, ${info.color})`,
                        fontSize: 11, fontWeight: 600, color: '#fff',
                        boxShadow: `0 2px 6px ${info.color}44`,
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
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 8,
              background: 'linear-gradient(135deg, #a09888, #c0b8a8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>废</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>废料</span>
            <span style={{ fontSize: 10, color: theme.textSecondary }}>{scrapTotal} 个</span>
          </div>
          <div style={{
            padding: '14px 16px', borderRadius: 14,
            background: theme.bgCard, border: `1px solid ${theme.borderLight}`,
            boxShadow: `0 2px 6px ${theme.shadow}`,
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary }}>废料兑换</span>
              <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>
                5个废料兑换1个随机原料
              </div>
            </div>
            <span
              onClick={exchangeScrap}
              onTouchEnd={exchangeScrap}
              style={{
                padding: '8px 18px', borderRadius: 16, cursor: 'pointer', touchAction: 'manipulation',
                background: scrapTotal >= 5 ? 'linear-gradient(135deg, #a09888, #b8b0a0)' : theme.borderLight,
                fontSize: 12, fontWeight: 600,
                color: scrapTotal >= 5 ? '#fff' : theme.textDisabled,
              }}
            >兑换</span>
          </div>
        </div>

        {/* 提示 */}
        <div style={{ padding: '12px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: theme.textDisabled, lineHeight: 1.8 }}>
            采集源游戏可获取更多原料 · 加工后的珠子在图鉴中查看
          </span>
        </div>
      </div>
    </div>
  )
}
