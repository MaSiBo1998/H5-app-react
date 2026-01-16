import type { ReactElement } from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Slider, Toast } from "antd-mobile"
import { CheckCircleFill, CheckCircleOutline, BillOutline } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './LoanUnconfirmed.module.css'
import { toSubmitOrder, toUploadAuthorDocument } from '@/services/api/order'
import { collectDeviceInfo } from '@/utils/device'
import { getStorage, StorageKeys } from '@/utils/storage'
import LoanDetailPopup from './LoanDetailPopup'
import { useLocation, useNavigate } from "react-router-dom"
import { useReduxRiskTracking } from '@/hooks/useReduxRiskTracking'

export default function LoanUnconfirmed({ data, onRefresh }: { data: StatusData, onRefresh?: () => void }): ReactElement {
    const location = useLocation()
    const navigate = useNavigate()
    console.log('LoanUnconfirmed', location)
    const isFirstLoan = !location.pathname.includes('/status')
    console.log(isFirstLoan, 'isFirstLoan')
    
    // 埋点 Hook
    const { toSetRiskInfo, toSubmitRiskPoint, getRiskValue } = useReduxRiskTracking()
    // 页面开始时间
    const pageStartTime = useRef(Date.now())
    const detailStartTime = useRef(0)

    // 页面停留埋点
    useEffect(() => {
        pageStartTime.current = Date.now()
        return () => {
            const duration = Date.now() - pageStartTime.current
            const eventCode = isFirstLoan ? '000016' : '000017'
            toSetRiskInfo(eventCode, '2', duration)
            toSubmitRiskPoint()
        }
    }, [isFirstLoan, toSetRiskInfo, toSubmitRiskPoint])

    // 数据提取逻辑
    const productDataList = useMemo(() => {
        return data?.atony?.[0]?.valour?.duodenal ?? data?.atony?.[0]?.duodenal ?? []
    }, [data])

    const [limitIndex, setLimitIndex] = useState(0)
    const productData = useMemo(() => productDataList[limitIndex] || {}, [productDataList, limitIndex])

    const min = productData.bindwood || 0
    const max = productData.shammash || 0
    const step = 5000
    const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

    const [amount, setAmount] = useState(isFirstLoan ? min : max)
    const [isAgree, setIsAgree] = useState(true)
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)

    useEffect(() => {
        setAmount(max)
    }, [max])

    // 计算值
    const repayAmount = useMemo(() => {
        const rate = productData.seacoast || 0
        const days = productData.fistic || 0
        return amount + (amount * rate * days)
    }, [amount, productData])

    const repayDate = useMemo(() => {
        if (!productData.fistic) return ''
        const date = new Date()
        // 单期产品当天算还款时间，所以还款时间应该少一天
        // 分期产品当天不算
        const isInstallment = (productData.fiefdom || 0) > 1
        const days = isInstallment ? productData.fistic : (productData.fistic - 1)

        date.setDate(date.getDate() + days)
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    }, [productData.fistic, productData.fiefdom])

    const handleSubmit = async () => {
        if (!isAgree || loading) return
        setLoading(true)
        try {
            // 收集设备信息
            let tokenKey = ''
            let deviceInfo: any = {}
            try {
                // @ts-ignore
                const client = new window.FingerPrint(
                    "https://us.mobilebene.com/w",
                    import.meta.env.VITE_APP_JG_KEY
                )
                // @ts-ignore
                tokenKey = await client.record("order")
                deviceInfo = getStorage(StorageKeys.DEVICE_INFO) || await collectDeviceInfo()
                if (deviceInfo && typeof deviceInfo === 'object') {
                    if (!deviceInfo.amidol) deviceInfo.amidol = {}
                    deviceInfo.amidol.nitrolic = tokenKey
                }
            } catch (e) {
                console.error('Device info error', e)
                setLoading(false)
            }

            // 参数构建
            const params = {
                appName: data.atony?.[0]?.lima || '',
                chooseAmount: amount,
                limitDay: productData.fistic || 0,
                fiefdom: productData.fiefdom || 0,
                golden: productData.golden || 0,
                gaucho: productData.gaucho || 0,
                neophron: productData.neophron || 0,
                deviceInfo: deviceInfo
            }

            await toSubmitOrder(params)

            // 提交成功埋点
            const eventCode = isFirstLoan ? '000016' : '000017'
            toSetRiskInfo(eventCode, '1', '1')
            try {
                await toUploadAuthorDocument({ deviceInfo })
            } catch (uploadError) {
                console.error('Upload author document failed', uploadError)
            }

            Toast.show({
                icon: 'success',
                content: 'Solicitud enviada',
            })

            // 刷新页面以显示新状态
            if (onRefresh) {
                onRefresh()
            } else {
                window.location.reload()
            }

        } catch (error: any) {
            console.error(error)
            // 提交失败埋点
            const eventCode = isFirstLoan ? '000016' : '000017'
            toSetRiskInfo(eventCode, '1', '2')
            toSetRiskInfo(eventCode, '3', error.message || error.msg || 'Error')
            Toast.show({
                content: error.message || 'Error al enviar solicitud',
            })
        } finally {
            setLoading(false)
        }
    }

    if (productDataList.length === 0) {
        return <div>Cargando...</div>
    }

    return (
        <div className={styles.container}>
            {/* 头部卡片 */}
            <div className={styles['header-card']}>
                <div className={styles['header-bg-pattern']}></div>
                <div className={styles['header-content']}>
                    <div className={styles['header-title']}>Confirmar Préstamo</div>
                </div>
            </div>

            {/* 主卡片 */}
            <div className={styles['main-card']}>

                {/* 金额选择区域 */}
                <div className={styles['section-label']}>Importe del préstamo($COP)</div>

                <div className={styles['amount-display-wrapper']}>
                    <span className={styles['currency-symbol']}>$</span>
                    <span className={styles['current-amount']}>{fmt(amount)}</span>
                </div>

                {min !== max && (
                    <div className={styles['slider-container']}>
                        <Slider
                            min={min}
                            max={max}
                            step={step}
                            value={amount}
                            onChange={(val) => {
                                setAmount(val as number)
                                const eventCode = isFirstLoan ? '000016' : '000017'
                                toSetRiskInfo(eventCode, '4', fmt(val as number))
                            }}
                        />
                        <div className={styles['slider-nums']}>
                            <span>${fmt(min)}</span>
                            <span>${fmt(max)}</span>
                        </div>
                    </div>
                )}

                {/* 期限选择区域 */}
                <div className={styles['section-label']} style={{ marginTop: 32 }}>Duración</div>
                <div className={styles['term-options']}>
                    {productDataList.map((item: any, index: number) => (
                        <div
                            key={index}
                            className={`${styles['term-card']} ${limitIndex === index ? styles['term-card-active'] : ''}`}
                            onClick={() => {
                                setLimitIndex(index)
                                // 埋点：用户最后提交的借款期限（每次点击都记录最新值，最终提交时以最后一次为准，或者这里记录点击行为）
                                // 需求描述：用户提交 用户最后提交的借款期限 最后选择的借款期限
                                // 这里先实时记录
                                const eventCode = isFirstLoan ? '000016' : '000017'
                                const termStr = `${item.fistic}天${item.fiefdom || 1}期`
                                toSetRiskInfo(eventCode, '5', termStr)
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                                <span className={styles['term-value']}>{item.fistic}</span>
                                <span className={styles['term-label']} style={{ marginLeft: 4 }}>días</span>
                            </div>
                            {(item.fiefdom || 0) && (
                                <div style={{ marginTop: 4, fontSize: 12, color: limitIndex === index ? '#00695c' : '#78909c' }}>
                                    {item.fiefdom} pagos
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 详情列表 */}
                <div className={styles['detail-list']}>
                    <div className={styles['detail-item']}>
                        <div className={styles['detail-label']}>Monto de Préstamo</div>
                        <div className={styles['detail-value']}>${fmt(amount)}</div>
                    </div>
                    <div className={styles['detail-item']}>
                        <div className={styles['detail-label']}>Monto a Pagar</div>
                        <div className={styles['detail-value']}>${fmt(repayAmount)}</div>
                    </div>
                    <div className={styles['detail-item']}>
                        <div className={styles['detail-label']}>
                            <BillOutline style={{ marginRight: 4 }} />
                            Fecha de pago
                        </div>
                        <div className={styles['detail-value']}>{repayDate}</div>
                    </div>

                    <div
                        className={styles['detail-item']}
                        style={{ marginTop: 16, justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => {
                            setDetailVisible(true)
                            detailStartTime.current = Date.now()
                            const eventCode = isFirstLoan ? '000016' : '000017'
                            const count = Number(getRiskValue(eventCode, '9') || 0) + 1
                            toSetRiskInfo(eventCode, '9', count,'overwrite')
                        }}
                    >
                        <div style={{ color: '#26a69a', fontSize: 14, fontWeight: 500 }}>
                            Ver plan de pagos &gt;
                        </div>
                    </div>
                </div>
            </div>

            <LoanDetailPopup
                visible={detailVisible}
                onClose={() => {
                    setDetailVisible(false)
                    if (detailStartTime.current > 0) {
                        const duration = Date.now() - detailStartTime.current
                        const eventCode = isFirstLoan ? '000016' : '000017'
                        // 分别记录每次时长，不进行累加
                        toSetRiskInfo(eventCode, '10', duration)
                        detailStartTime.current = 0
                    }
                }}
                productData={productData}
                amount={amount}
            />

            {/* 底部固定栏 */}
            <div className={`${styles['footer-fixed']} ${isFirstLoan ? styles['with-tabbar'] : ''}`}>
                <button
                    className={styles['submit-btn']}
                    disabled={!isAgree}
                    onClick={handleSubmit}
                >
                    Confirmar
                </button>

                <div className={styles.agreement}>
                    <div className={styles.checkbox} onClick={() => setIsAgree(!isAgree)}>
                        {isAgree ? <CheckCircleFill /> : <CheckCircleOutline style={{ color: '#ccc' }} />}
                    </div>
                    <span>
                        He leído y acepto los <span style={{ color: '#26a69a', marginLeft: 4 }} onClick={(e) => {
                            e.stopPropagation()
                            const eventCode = isFirstLoan ? '000016' : '000017'
                            // 使用 sum 模式累加，避免先读后写
                            toSetRiskInfo(eventCode, '6', 1, 'sum')
                            navigate('/loan-agreement', { state: { eventCode } })
                        }}>Acuerdo de préstamo</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
