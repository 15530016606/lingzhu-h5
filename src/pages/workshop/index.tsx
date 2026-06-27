import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_BASE || ''

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  return res.json()
}

type Step = 'source' | 'material' | 'process' | 'result'

type Source = { id: string; name: string; icon: string; description: string }
type Material = { id: string; name: string; sourceId: string; rarity: string; processMs: number; imageUrl: string }

const RARITY_COLORS: Record<string, string> = {
  common: '#8e9eab',
  uncommon: '#5ba3e6',
  rare: '#c8a96e',
  legendary: '#e74c3c',
}
const RARITY_LABELS: Record<string, string> = {
  common: '普通', uncommon: '稀有', rare: '珍品', legendary: '传说',
}

const STEP_CONFIGS = [
  { key: 'source', label: '选择采集源' },
  { key: 'material', label: '选择原料' },
  { key: 'process', label: '加工中' },
  { key: 'result', label: '完成' },
]

/* ── 加工动画 keyframes 注入 ── */
const ANIM_KEYFRAMES = `
@keyframes anim-cut {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  25% { transform: scale(0.9) rotate(10deg); opacity: 0.9; }
  50% { transform: scale(1.1) rotate(-5deg); opacity: 1; }
  75% { transform: scale(0.95) rotate(5deg); opacity: 0.95; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes anim-grind {
  0% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(120deg) scale(0.8); }
  66% { transform: rotate(240deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes anim-polish {
  0% { filter: brightness(1); transform: scale(1); }
  50% { filter: brightness(1.5); transform: scale(1.05); }
  100% { filter: brightness(1); transform: scale(1); }
}
@keyframes anim-fade-in {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes anim-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
`

export default function Workshop() {
  const [currentStep, setCurrentStep] = useState<Step>('source')
  const [sources, setSources] = useState<Source[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [processPhase, setProcessPhase] = useState<'idle' | 'cut' | 'grind' | 'polish'>('idle')
  const [processResult, setProcessResult] = useState<any>(null)
  const [animDuration, setAnimDuration] = useState(2000)

  // Load sources + inventory on mount
  useEffect(() => {
    api('/raw-materials/sources').then((data) => {
      if (Array.isArray(data)) setSources(data)
    })
    api('/user/raw-materials').then((data) => {
      if (Array.isArray(data)) setInventory(data.filter((x: any) => x.count > 0))
    })
  }, [])

  // Source selection
  const selectSource = useCallback(async (source: Source) => {
    setSelectedSource(source)
    setCurrentStep('material')
    const data = await api(`/raw-materials?sourceId=${source.id}`)
    if (Array.isArray(data)) setMaterials(data)
  }, [])

  // Material selection → start processing
  const selectMaterial = useCallback((material: Material) => {
    setSelectedMaterial(material)
    setCurrentStep('process')
    setProcessPhase('cut')
    setAnimDuration(material.processMs || 7000)

    // Phase progression: cut → grind → polish
    const phaseDuration = (material.processMs || 7000) / 3
    setTimeout(() => setProcessPhase('grind'), phaseDuration)
    setTimeout(() => setProcessPhase('polish'), phaseDuration * 2)
    setTimeout(() => runProcess(material.id), material.processMs || 7000)
  }, [])

  const runProcess = async (materialTypeId: string) => {
    const result = await api('/user/process', {
      method: 'POST',
      body: JSON.stringify({ materialTypeId }),
    })
    setProcessResult(result)
    setCurrentStep('result')
    // Refresh inventory
    api('/user/raw-materials').then((data) => {
      if (Array.isArray(data)) setInventory(data.filter((x: any) => x.count > 0))
    })
  }

  const reset = () => {
    setCurrentStep('source')
    setSelectedSource(null)
    setSelectedMaterial(null)
    setProcessPhase('idle')
    setProcessResult(null)
  }

  const goToHome = () => Taro.navigateBack()

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <style>{ANIM_KEYFRAMES}</style>

      {/* 顶部导航 + 步骤指示器 */}
      <View style={{ backgroundColor: '#2c3e50', padding: '12px 16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text onClick={goToHome} style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginRight: 12, cursor: 'pointer' }}>←</Text>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>工作室</Text>
          <View style={{ flex: 1 }} />
          <Text onClick={reset} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>重置</Text>
        </View>
        {/* 步骤进度条 */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {STEP_CONFIGS.map((s, i) => {
            const stepOrder = ['source', 'material', 'process', 'result']
            const currentIdx = stepOrder.indexOf(currentStep)
            const isActive = i <= currentIdx
            return (
              <View key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <View style={{
                  width: '100%', height: 3, borderRadius: 2,
                  backgroundColor: isActive ? '#c8a96e' : 'rgba(255,255,255,0.15)',
                }} />
                <Text style={{ fontSize: 10, color: isActive ? '#c8a96e' : 'rgba(255,255,255,0.4)' }}>
                  {s.label}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* 库存栏 */}
      {inventory.length > 0 && (
        <View style={{
          margin: '8px 12px', padding: '6px 10px', backgroundColor: '#ffffff',
          borderRadius: 8, border: '1px solid #e8e8e8',
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, overflowX: 'auto',
        }}>
          <Text style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>库存:</Text>
          {inventory.map((item) => (
            <View key={item.materialTypeId} style={{
              padding: '2px 6px', borderRadius: 6,
              backgroundColor: '#f0f0f0', fontSize: 10,
              whiteSpace: 'nowrap',
            }}>
              {item.name} x{item.count}
            </View>
          ))}
        </View>
      )}

      {/* 主内容 */}
      <ScrollView scrollY style={{ flex: 1, padding: '12px 16px' }}>
        {/* Step 1: 选择采集源 */}
        {currentStep === 'source' && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#2c3e50', marginBottom: 12 }}>
              从哪里采集原料？
            </Text>
            {sources.map((source) => (
              <View
                key={source.id}
                onClick={() => selectSource(source)}
                style={{
                  padding: '14px 16px', marginBottom: 10,
                  backgroundColor: '#ffffff', borderRadius: 12,
                  border: '1px solid #e8e8e8', cursor: 'pointer',
                  display: 'flex', flexDirection: 'row', alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 14 }}>{source.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: 600, color: '#2c3e50' }}>{source.name}</Text>
                  <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{source.description}</Text>
                </View>
                <Text style={{ fontSize: 16, color: '#ccc' }}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 2: 选择原料 */}
        {currentStep === 'material' && selectedSource && (
          <View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text onClick={() => setCurrentStep('source')} style={{ fontSize: 14, color: '#999', cursor: 'pointer', marginRight: 6 }}>← 返回</Text>
              <Text style={{ fontSize: 16, fontWeight: 600, color: '#2c3e50' }}>
                {selectedSource.icon} {selectedSource.name}
              </Text>
            </View>
            {materials.map((mat) => (
              <View
                key={mat.id}
                onClick={() => selectMaterial(mat)}
                style={{
                  padding: '12px 14px', marginBottom: 8,
                  backgroundColor: '#ffffff', borderRadius: 10,
                  border: '1px solid #e8e8e8', cursor: 'pointer',
                  display: 'flex', flexDirection: 'row', alignItems: 'center',
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 8, marginRight: 12,
                  backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#999', overflow: 'hidden',
                }}>
                  {mat.imageUrl
                    ? <img src={`/images/beads/${mat.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📦'
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 500, color: '#2c3e50' }}>{mat.name}</Text>
                  <Text style={{
                    fontSize: 10, marginTop: 2,
                    color: RARITY_COLORS[mat.rarity] || '#999',
                  }}>
                    {RARITY_LABELS[mat.rarity] || mat.rarity}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: '#ccc' }}>{(mat.processMs / 1000).toFixed(0)}s</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 3: 加工动画 */}
        {currentStep === 'process' && selectedMaterial && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 14, color: '#999', marginBottom: 16 }}>
              {processPhase === 'cut' ? '切割中...' : processPhase === 'grind' ? '打磨中...' : '抛光中...'}
            </Text>

            {/* 加工动画容器 */}
            <View style={{
              width: 120, height: 120, borderRadius: '50%',
              backgroundColor: '#ffffff', border: '3px solid #e8e8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              animation: processPhase === 'cut' ? `anim-cut 0.6s ease-in-out infinite`
                : processPhase === 'grind' ? `anim-grind 0.5s linear infinite`
                : processPhase === 'polish' ? `anim-polish 0.8s ease-in-out infinite`
                : 'none',
            }}>
              <Text style={{ fontSize: 40 }}>
                {processPhase === 'cut' ? '✂️' : processPhase === 'grind' ? '💎' : '✨'}
              </Text>
            </View>

            {/* 加工信息 */}
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>
              {selectedMaterial.name}
            </Text>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 1.5, marginBottom: 16 }}>
              三段加工: 切割→打磨→抛光{'\n'}每步有失败概率，成功后获得珠子
            </Text>

            {/* 阶段指示 */}
            <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
              {['cut', 'grind', 'polish'].map((phase) => {
                const phaseOrder = ['cut', 'grind', 'polish']
                const isDone = phaseOrder.indexOf(processPhase) >= phaseOrder.indexOf(phase)
                const isCurrent = processPhase === phase
                return (
                  <View key={phase} style={{
                    padding: '4px 10px', borderRadius: 10,
                    backgroundColor: isCurrent ? '#2c3e50' : isDone ? '#c8a96e' : '#e8e8e8',
                  }}>
                    <Text style={{ fontSize: 10, color: isDone ? '#ffffff' : '#999' }}>
                      {phase === 'cut' ? '切割' : phase === 'grind' ? '打磨' : '抛光'}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Step 4: 加工结果 */}
        {currentStep === 'result' && processResult && (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
            {/* 结果图标 */}
            <View style={{
              width: 80, height: 80, borderRadius: '50%',
              backgroundColor: processResult.success ? '#c8a96e' : '#e8e8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              animation: 'anim-fade-in 0.5s ease-out',
            }}>
              <Text style={{ fontSize: 36 }}>
                {processResult.success ? '🎉' : '💔'}
              </Text>
            </View>

            {/* 结果文字 */}
            {processResult.success && (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>
                  加工成功!
                </Text>
                <Text style={{ fontSize: 13, color: '#666' }}>
                  获得: {processResult.materialType}
                </Text>
              </View>
            )}

            {!processResult.success && (
              <View style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 600, color: '#999', marginBottom: 4 }}>
                  加工失败
                </Text>
                {processResult.step && (
                  <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                    在「{processResult.step === 'cut' ? '切割' : processResult.step === 'grind' ? '打磨' : '抛光'}」阶段失败了
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: '#c8a96e' }}>
                  获得废料: {processResult.wasteType}
                </Text>
              </View>
            )}

            {/* 操作按钮 */}
            <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View
                onClick={reset}
                style={{
                  padding: '10px 24px', borderRadius: 20,
                  backgroundColor: '#2c3e50', cursor: 'pointer',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
                  继续加工
                </Text>
              </View>
              <View
                onClick={goToHome}
                style={{
                  padding: '10px 24px', borderRadius: 20,
                  backgroundColor: '#ffffff', border: '1px solid #e8e8e8', cursor: 'pointer',
                }}
              >
                <Text style={{ fontSize: 14, color: '#666' }}>
                  返回首页
                </Text>
              </View>
            </View>

            {/* 今日战绩 */}
            <View style={{
              marginTop: 24, width: '100%', padding: 14,
              backgroundColor: '#ffffff', borderRadius: 12,
              border: '1px solid #e8e8e8',
            }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#2c3e50', marginBottom: 8 }}>我的原料库存</Text>
              {inventory.length === 0 ? (
                <Text style={{ fontSize: 12, color: '#ccc', textAlign: 'center', padding: '16px 0' }}>
                  还没有原料，去首页领每日盲盒吧
                </Text>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {inventory.map((item) => (
                    <View key={item.materialTypeId} style={{
                      padding: '6px 10px', borderRadius: 8, backgroundColor: '#f5f5f5',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 11, color: '#2c3e50' }}>{item.name}</Text>
                      <Text style={{ fontSize: 10, color: '#999' }}>x{item.count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
