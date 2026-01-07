import { useState, type ReactElement, type ReactNode } from 'react'
import { NavBar } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import RetentionModal from '@/pages/Apply/components/RetentionModal'

type HeaderNavProps = {
  // 导航栏标题
  title?: string
  // 是否显示返回按钮，默认显示
  back?: boolean
  // 是否直接返回上一页，默认为是
  backDirect?: boolean
  // 自定义返回事件
  onBack?: () => void
  // 导航栏右侧内容
  right?: ReactNode
  // 自定义样式
  style?: React.CSSProperties
  // 导航栏背景色
  background?: string
  // 文字颜色
  color?: string
}

export default function HeaderNav({ title, back = true, backDirect = true, onBack, right, style, background, color }: HeaderNavProps): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [showRetention, setShowRetention] = useState(false)

  // 申请流程页面路径
  const applyPaths = ['/work', '/contacts', '/personal', '/id', '/face-capture', '/bank']

  // 处理返回点击事件
  const handleBack = () => {
    // 检查是否在申请流程中且是从首页进入（entry 参数为空或不存在）
    const isApplyPage = applyPaths.includes(location.pathname)
    const entryParam = searchParams.get('entry')
    const isHomeEntry = !entryParam

    if (isApplyPage && isHomeEntry) {
      setShowRetention(true)
      return
    }

    // 如果配置为直接返回上一页
    if (backDirect) {
      navigate(-1)
      return
    }
    // 否则执行自定义返回回调
    if (onBack) onBack()
  }

  const containerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: background || '#ffffff',
    color: color,
    ...style
  }

  return (
    <div style={containerStyle}>
      <NavBar 
        backArrow={back ? <LeftOutline color={color} /> : null} 
        onBack={back ? handleBack : undefined} 
        right={right}
        style={{ '--nav-bar-height': '46px', color: color } as any}
      >
        {title}
      </NavBar>
      <RetentionModal
        visible={showRetention}
        onConfirm={() => {
          setShowRetention(false)
          navigate('/')
        }}
        onCancel={() => setShowRetention(false)}
      />
    </div>
  )
}
