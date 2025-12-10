import { Result, Button } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import '@/styles/notfound.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="notfound-page">
      <Result status="error" title="页面不存在" description="请检查访问的地址是否正确" />
      <Button color="primary" onClick={() => navigate('/')}>返回首页</Button>
    </div>
  )
}
