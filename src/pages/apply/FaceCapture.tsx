import type { ReactElement } from 'react'
import { Card, Space, Button } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markCompleted, getNextPath } from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'

export default function FaceCapture(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isProfileEntry = searchParams.get('entry') === 'profile'

  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  const handleNext = () => {
    markCompleted('face')
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate(getNextPath())
    }
  }

  return (
    <>
      <HeaderNav
        title="Selfie"
        backDirect={false}
        onBack={handleBack}
      />
      {!isProfileEntry && (
        <ApplySteps
          steps={[
            { key: 'work', label: 'Trabajo' },
            { key: 'contacts', label: 'Contactos' },
            { key: 'personal', label: 'Datos personales' },
            { key: 'id', label: 'Identificación' },
            { key: 'face', label: 'Selfie' },
          ]}
          current="face"
        />
      )}
      <Card>
        <Space direction="vertical" block>
          <Button color="primary" onClick={handleNext}>Continuar</Button>
        </Space>
      </Card>
    </>
  )
}
