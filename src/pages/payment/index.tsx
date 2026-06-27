import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeadStore } from '@/lib/store'

const PAYMENT_NAMES: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
}

export default function PaymentPage() {
  const { clearDesign } = useBeadStore()
  const [step, setStep] = useState<'confirm' | 'paying' | 'done'>('confirm')
  const params = Taro.getCurrentInstance().router?.params || {}
  const orderId = params.orderId || ''
  const total = parseFloat(params.total as string) || 0
const method = (params.method as string) || 'wechat'

  useEffect(() => {
    if (step === 'paying') {
      // 模拟支付流程：2 秒后支付成功
      const timer = setTimeout(() => {
        // 更新订单状态
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        const updated = orders.map((o: any) =>
          o.id === orderId ? { ...o, status: 'paid' } : o
        )
        localStorage.setItem('orders', JSON.stringify(updated))
        setStep('done')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [step, orderId])

  const handlePay = () => {
    setStep('paying')
  }

  const handleDone = () => {
    clearDesign()
    Taro.navigateBack({ delta: 2 }) // 返回首页
  }

  const methodName = PAYMENT_NAMES[method] || '在线支付'

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <Text style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
          {step === 'done' ? '支付成功' : '确认支付'}
        </Text>
      </View>

      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        {/* 支付动画 */}
        <View style={{
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: step === 'done' ? '#27ae60' : step === 'paying' ? '#2c3e50' : '#e8e8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          transition: 'background-color 0.3s',
        }}>
          <Text style={{ fontSize: 32, color: step === 'done' || step === 'paying' ? '#ffffff' : '#999' }}>
            {step === 'done' ? '✓' : step === 'paying' ? '○' : '¥'}
          </Text>
        </View>

        {/* 金额 */}
        <Text style={{ fontSize: 36, fontWeight: 700, color: '#c0392b', marginBottom: 8 }}>
          ¥{total.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
          订单号：{orderId}
        </Text>

        {/* 支付方式 */}
        <View style={{
          width: '100%', maxWidth: 300,
          borderRadius: 12, border: '1px solid #e8e8e8',
          padding: 14, backgroundColor: '#ffffff',
          marginBottom: 24,
        }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>支付方式</Text>
            <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{methodName}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666' }}>订单状态</Text>
            <Text style={{ fontSize: 13, color: step === 'done' ? '#27ae60' : '#2c3e50' }}>
              {step === 'done' ? '已支付' : step === 'paying' ? '支付中...' : '待支付'}
            </Text>
          </View>
        </View>

        {/* 支付提示 */}
        {step === 'paying' && (
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            正在处理支付...
          </Text>
        )}

        {step === 'done' && (
          <Text style={{ fontSize: 12, color: '#27ae60', textAlign: 'center', marginBottom: 16 }}>
            支付成功，我们将尽快为您发货
          </Text>
        )}

        {/* 按钮 */}
        {step === 'confirm' && (
          <View
            onClick={handlePay}
            style={{
              width: '100%', maxWidth: 300,
              padding: '14px 0', borderRadius: 12,
              backgroundColor: '#2c3e50', cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
              确认支付 ¥{total.toFixed(2)}
            </Text>
          </View>
        )}

        {step === 'done' && (
          <View
            onClick={handleDone}
            style={{
              width: '100%', maxWidth: 300,
              padding: '14px 0', borderRadius: 12,
              backgroundColor: '#2c3e50', cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
              返回首页
            </Text>
          </View>
        )}
      </View>

      {/* 底部提示 */}
      <View style={{ padding: '16px 24px 32px', textAlign: 'center' }}>
        <Text style={{ fontSize: 11, color: '#ccc' }}>
          {step === 'done' ? '' : '此为演示支付页面，不会产生实际扣款'}
        </Text>
      </View>
    </View>
  )
}
