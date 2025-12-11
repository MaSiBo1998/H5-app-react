import type { ReactElement } from 'react'
import { Card, Space, Button } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markCompleted } from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'

export default function BankInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 是否从个人中心进入
  const isProfileEntry = searchParams.get('entry') === 'profile'

  // 返回处理
  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  // 完成处理
  const handleComplete = () => {
    markCompleted('bank')
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <HeaderNav 
        title="Información bancaria" 
        backDirect={false}
        onBack={handleBack}
      />
      <Card>
        <Space direction="vertical" block>
          <div style={{ height: 68 }}></div>
        </Space>
      </Card>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '8px 12px', background: '#ffffff', borderTop: '1px solid #eceff1', zIndex: 1000 }}>
        <Button onClick={handleComplete} block>Completar y volver al inicio</Button>
      </div>
    </>
  )
}
