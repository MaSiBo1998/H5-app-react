import { useEffect, useState, type ReactElement } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getProductDetail } from '@/services/api/product'
import HeaderNav from '@/components/common/HeaderNav'
import { PullToRefresh } from 'antd-mobile'

// 导入组件
import LoanInProgress from '@/components/status/LoanInProgress/LoanInProgress'
import LoanFailed from '@/components/status/LoanFailed/LoanFailed'
import Payment from '@/components/status/Payment/Payment'
import LoanUnconfirmed from '@/components/status/LoanUnconfirmed/LoanUnconfirmed'
import NewLoanRisk from '@/components/status/NewLoanRisk/NewLoanRisk'
import AuditPending from '@/components/status/AuditPending/AuditPending'
import ExamineReject from '@/components/status/ExamineReject/ExamineReject'
import AuditCountdown from '@/components/status/AuditCountdown/AuditCountdown'

export default function StatusPage(): ReactElement {
  const [searchParams] = useSearchParams()
  const appName = searchParams.get('appName')
  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [navStyle, setNavStyle] = useState({
    background: 'transparent',
    color: '#ffffff',
    boxShadow: 'none'
  })

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop > 50) {
        setNavStyle({
          background: 'linear-gradient(135deg, #004d40 0%, #00695c 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        })
      } else {
        setNavStyle({
          background: 'transparent',
          color: '#ffffff',
          boxShadow: 'none'
        })
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchData = async (showLoading = true) => {
    console.log('showLoading', showLoading)
    if (!appName) return
    try {
      // Initial load can show loading if needed, or rely on PullToRefresh spinner
      const res = await getProductDetail({ appName, loading: showLoading }) as any
      setData(res)
      console.log('Product Detail:', res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(true)
  }, [appName])

  // 首页传递参数与 Status 页面传递参数的逻辑流程：
  // 1. 首页 (Home) 通过 getHomeData 获取聚合状态数据。
  // 2. 如果状态为 600 (展示 App 列表)，StatusView 会渲染 AppList 组件。
  // 3. 在 AppList 组件中，用户点击某个产品（申请或还款）时，通过 navigate(`/status?appName=${item.lima}`) 跳转到此 Status 页面，并将产品名称 (appName) 作为查询参数传递。
  // 4. Status 页面 (本页面) 初始化时，从 URL 中读取 appName 参数。
  // 5. 使用 appName 调用 getProductDetail 接口，获取该特定产品的详细订单/状态信息。
  // 6. 根据返回的数据结构 (keyway, tailfan, valour 等字段) 判断当前订单处于何种阶段 (如审核中、放款中、还款中等)，并渲染对应的子组件。

  const renderContent = () => {
    if (!data) return null

    // 大多数现有组件期望 StatusData 结构中包含 'atony' 数组，其中包含产品项。
    // 由于 getProductDetail 直接返回产品项对象，我们需要将其包装一下以适配现有组件。
    const wrappedData = { atony: [data] } as any

    // appProductData.keyway == 300 (还款期/逾期)
    if (data.keyway === 300) {
      // tailfan.keyway
      const subKey = data.tailfan?.keyway
      // 100: 放款中
      if (subKey === 100) return <LoanInProgress data={wrappedData} />
      // 200: 放款失败
      if (subKey === 200) return <LoanFailed data={data} />
      // 300: 还款中
      if (subKey === 300) return <Payment data={data} />
    } else {
      // valour
      const valour = data.valour || {}
      const keyway = valour.keyway
      const taungya = valour.taungya

      // 0 : 未确认 / 未申请
      if (keyway === 0 && taungya === 0) return <LoanUnconfirmed data={wrappedData} onRefresh={() => fetchData(true)} />

      // 风控拦截 (taungya == 1)
      if (keyway === 0 && taungya === 1) return <AuditCountdown data={data} onRefresh={() => fetchData()} />

      // 200, 300 : 审核中 (Audit Pending)
      // AuditPending 组件期望 'data' 在根节点有 'valour' 属性 (基于其实现)
      if (keyway === 200 || keyway === 300) return <AuditPending data={data} onRefresh={fetchData} />

      // 400 : 审核拒绝
      if (keyway === 400) return <ExamineReject data={wrappedData} />

      // 600 : 放款中 (Disbursing)
      if (keyway === 600) return <LoanInProgress data={wrappedData} />
    }

    // 未知状态兜底
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        Status Unknown (Keyway: {data.keyway}, SubKey: {data.tailfan?.keyway || data.valour?.keyway})
      </div>
    )
  }

  return (
    <div style={{ background: '#f5f7fa', position: 'relative' }}>
      {/* 顶部渐变背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '280px', // 覆盖头部和卡片顶部
        background: 'linear-gradient(135deg, #004d40 0%, #00695c 100%)',
        zIndex: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}></div>

      <HeaderNav
        title={data?.lima || 'Detalle'}
        background={navStyle.background}
        color={navStyle.color}
        style={{ zIndex: 10, boxShadow: navStyle.boxShadow, transition: 'all 0.3s ease' }}
      />

      <PullToRefresh onRefresh={() => fetchData(true)} pullingText="Desliza para actualizar"
        canReleaseText="Suelta para actualizar"
        refreshingText="Cargando..."
        completeText="Actualizado">
        <div style={{ minHeight: 'calc(100vh - 46px)', position: 'relative', zIndex: 1 }}>
          {renderContent()}
        </div>
      </PullToRefresh>
    </div>
  )
}
