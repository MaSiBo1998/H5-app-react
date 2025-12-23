import type { ReactElement } from 'react'
import { useRef, useState } from 'react'
import { RightOutline, BillOutline, ExclamationCircleFill, CheckCircleFill } from 'antd-mobile-icons'
import styles from './Payment.module.css'
import type { StatusData, PaymentMethod, SpadoItem } from '../types'
import LoanDetailPopup from './LoanDetailPopup'
import { toPayMoney, type PayMoneyParams } from '../../../services/api/payment'
import BankListPopup from '@/pages/Apply/components/BankListPopup'
import type { BankItem } from '@/pages/Apply/components/BankListPopup'
import { useNavigate } from 'react-router-dom'
export default function Payment({ data }: { data?: any }): ReactElement {
  const navigate = useNavigate()
  const [detailVisible, setDetailVisible] = useState(false)

  // 安全地提取数据
  // 首贷: data.atony[0].tailfan
  // 复贷: data.tailfan
  const tailfan = data?.atony?.[0]?.tailfan || data?.tailfan
  const isOverdue = tailfan?.galabia === 1
  const days = tailfan?.fistic || 0
  const totalAmount = tailfan?.bengalee || 0
  // 选择银行弹框
  const [bankVisible, setBankVisible] = useState(false)
  // 银行code
  const bankCodeRef = useRef('')
  // 支付方式
  const [paymentMethod, setPaymentMethod] = useState<any>('')
  // 如果有第一期分期，计算服务费
  const firstItem = tailfan?.spado?.[0]
  const serviceFee = firstItem
    ? (firstItem.larder || 0) + (firstItem.masseuse || 0) + (firstItem.encash || 0)
    : 0
  // 选中银行
  const handleBankSelect = (bankItem: BankItem) => {
    console.log('Selected bank:', bankItem)

    setBankVisible(false)
    bankCodeRef.current = bankItem.code
    toPaymentSubmit()
  }
  const handlePaymentMethodClick = (item: PaymentMethod) => {
    // 处理支付方式选择
    console.log('Selected payment method:', item)
    setPaymentMethod(item.sermon)

    if (item.sermon === 'PAGSMILE_TRANSFIYA') {
      // TODO: 如果存在路由，跳转到帮助页面
      console.warn('Navigation to payment help not implemented')
      navigate('/help')
      return
    }

    if (item.sermon === 'PAGSMILE' && !bankCodeRef.current) {
      // TODO: 如果需要，跳转到银行列表
      setBankVisible(true)
      console.warn('Navigation to bank list not implemented')
      return
    }
    toPaymentSubmit()
  }
  const toPaymentSubmit = async () => {
    try {
      const appName = data?.atony?.[0]?.lima || data?.lima || ''
      // 查找 leonora === 300 的项 (待处理/填充)
      const targetItem = tailfan?.spado?.find((item: SpadoItem) => item.leonora === 300)
      const params: PayMoneyParams = {
        appName,
        payName: paymentMethod,
        money: Number(targetItem?.judaical || 0),
        bankCode: paymentMethod === 'PAGSMILE' ? bankCodeRef.current : null
      }

      console.log('Payment params:', params)
      const res = await toPayMoney(params)
      console.log('Payment response:', res)

      if (res && res.otology) {
        window.location.href = res.otology
      }
    } catch (error) {
      console.error('Payment failed:', error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles['content-card']}>
        {/* 头部卡片 */}
        <div className={styles['header-card']}>
          <div className={styles['date-money']}>
            <div className={styles.money}>
              <div className={styles['money-text']}>Monto a reembolsar</div>
              <div className={`${styles['money-value']} ${isOverdue ? styles['out-text-color'] : ''}`}>
                ${totalAmount}
              </div>
            </div>
            <div className={styles.date}>
              <div className={styles['date-text']}>
                {isOverdue ? 'Atrasado' : 'Días restantes'}
              </div>
              <div className={`${styles['date-value']} ${isOverdue ? styles['out-text-color'] : ''}`}>
                {isOverdue ? 'Atrasado' : `${days} días`}
              </div>
            </div>
          </div>

          <div className={styles['service-fee']}>
            <div className={styles['service-fee-text']}>Tarifa de servicio</div>
            <div className={styles['service-fee-value']}>${serviceFee.toFixed(2)}</div>
          </div>

          {/* 提示 */}
          <div className={styles.tips}>
            {isOverdue ? (
              <div className={`${styles['tips-box']} ${styles['out-text-color']}`}>
                <ExclamationCircleFill fontSize={20} />
                <span>Por favor, reembolse lo antes posible</span>
              </div>
            ) : (
              <div className={styles['tips-box']}>
                <CheckCircleFill fontSize={20} />
                <span>El reembolso a tiempo aumentará su límite</span>
              </div>
            )}
          </div>
        </div>

        {/* 支付计划 */}
        <div className={styles['payment-card']}>
          <div className={styles['payment-card-content']}>
            <div className={styles['payment-card-left']}>
              <BillOutline fontSize={24} color="#00897b" />
              <span className={styles['payment-title']}>Plan de pago</span>
            </div>
            <div className={styles['payment-card-right']} onClick={() => setDetailVisible(true)}>
              <span className={styles['payment-date']}>Detalles del pedido</span>
              <RightOutline fontSize={16} color="#00897b" />
            </div>
          </div>

          {(tailfan?.spado || []).map((item: SpadoItem, index: number) => {
            const isItemOverdue = item.galabia === 1
            const isItemPadding = item.leonora === 300

            let boxClass = styles['already-box']
            let colorClass = styles['already-color']
            let iconColor = '#78909c'

            if (isItemOverdue) {
              boxClass = styles['over-box']
              colorClass = styles['over-color']
              iconColor = '#c62828'
            } else if (isItemPadding) {
              boxClass = styles['padding-box']
              colorClass = styles['padding-color']
              iconColor = '#33691e'
            }

            return (
              <div key={index} className={`${styles['payment-intall-box']} ${boxClass}`}>
                <div className={`${styles['payment-intall-box-left']} ${colorClass}`}>
                  {isItemOverdue ? (
                    <ExclamationCircleFill color={iconColor} fontSize={20} />
                  ) : isItemPadding ? (
                    <CheckCircleFill color={iconColor} fontSize={20} />
                  ) : (
                    <CheckCircleFill color={iconColor} fontSize={20} />
                  )}
                  <span>{item.overdo} Ago</span>
                </div>
                <div className={`${styles['payment-intall-box-right']} ${colorClass}`}>
                  ${item.surfing}
                </div>
              </div>
            )
          })}
        </div>

        {/* 支付方式 */}
        <div>
          <div className={styles['general-title']}>Elegir un método de pago</div>
          <div className={styles['payment-list-card']}>
            {(tailfan?.berserk || []).map((item: PaymentMethod, index: number) => (
              <div
                key={index}
                className={styles['payment-method-item']}
                onClick={() => handlePaymentMethodClick(item)}
              >
                <div className={styles['method-left']}>
                  {item.airpost && <img src={item.airpost} alt="" className={styles['method-icon']} />}
                  <div className={styles['method-info']}>
                    <div className={styles['method-name']}>{item.affluent}</div>
                    <div className={styles['method-desc']}>{item.suit}</div>
                  </div>
                </div>
                <RightOutline color="#999999" fontSize={16} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <LoanDetailPopup
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        items={tailfan?.spado}
      />
      <BankListPopup
        visible={bankVisible}
        onClose={() => setBankVisible(false)}
        onSelect={handleBankSelect}
      />
    </div>
  )
}
