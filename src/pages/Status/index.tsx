import { useEffect, useState, type ReactElement } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getProductDetail } from '@/services/api/product'
import HeaderNav from '@/components/common/HeaderNav'
import { PullToRefresh } from 'antd-mobile'

// Import components
import LoanInProgress from '@/components/status/LoanInProgress/LoanInProgress'
import LoanFailed from '@/components/status/LoanFailed/LoanFailed'
import Payment from '@/components/status/Payment/Payment'
import LoanUnconfirmed from '@/components/status/LoanUnconfirmed/LoanUnconfirmed'
import NewLoanRisk from '@/components/status/NewLoanRisk/NewLoanRisk'
import AuditPending from '@/components/status/AuditPending/AuditPending'
import ExamineReject from '@/components/status/ExamineReject/ExamineReject'

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

  const fetchData = async () => {
    if (!appName) return
    try {
      // Initial load can show loading if needed, or rely on PullToRefresh spinner
      const res = await getProductDetail({ appName, loading: true }) as any
      setData(res)
      console.log('Product Detail:', res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appName])

  // Logic from index.vue
  const renderContent = () => {
    if (!data) return null
    
    // Most existing components expect StatusData with 'atony' array containing the product item.
    // Since getProductDetail returns the product item directly, we wrap it.
    const wrappedData = { atony: [data] } as any
    
    // appProductData.keyway == 300 (Repayment Period)
    if (data.keyway === 300) {
       // tailfan.keyway
       const subKey = data.tailfan?.keyway
       // 100: Loan In Progress (Disbursing?)
       if (subKey === 100) return <LoanInProgress data={wrappedData} />
       // 200: Loan Failed
       if (subKey === 200) return <LoanFailed data={data} /> 
       // 300: Repayment
       if (subKey === 300) return <Payment data={data} />
    } else {
       // valour
       const valour = data.valour || {}
       const keyway = valour.keyway
       const taungya = valour.taungya

       // 0 : Unconfirmed / Not Applied
       if (keyway === 0 && taungya === 0) return <LoanUnconfirmed data={wrappedData} />
       
       // Risk Control (taungya == 1)
       if (keyway === 0 && taungya === 1) return <NewLoanRisk data={data} />
       
       // 200, 300 : Audit Pending
       // AuditPending component expects 'data' to have 'valour' property at root (based on its implementation)
       if (keyway === 200 || keyway === 300) return <AuditPending data={data} />
       
       // 400 : Audit Rejected
       if (keyway === 400) return <ExamineReject data={wrappedData} />
       
       // 600 : Loan In Progress (Disbursing)
       if (keyway === 600) return <LoanInProgress data={wrappedData} />
    }
    
    // Fallback for unknown status
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        Status Unknown (Keyway: {data.keyway}, SubKey: {data.tailfan?.keyway || data.valour?.keyway})
      </div>
    )
  }

  return (
    <div style={{ background: '#f5f7fa', position: 'relative' }}>
       {/* Top Gradient Backdrop */}
       <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '280px', // Covers header + top part of cards
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

       <PullToRefresh onRefresh={fetchData}>
         <div style={{ minHeight: 'calc(100vh - 46px)', position: 'relative', zIndex: 1 }}>
            {renderContent()}
         </div>
       </PullToRefresh>
    </div>
  )
}
