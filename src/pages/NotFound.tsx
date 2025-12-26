import { Result, Button } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import '@/styles/notfound.css'

// 404 页面组件 / Página 404
export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="notfound-page">
      <Result 
        status="error" 
        title="Página no encontrada" 
        description="Lo sentimos, la página que buscas no existe o ha sido movida." 
      />
      <Button color="primary" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </div>
  )
}
