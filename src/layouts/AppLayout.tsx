import { TabBar } from 'antd-mobile'
import type { ReactNode, ReactElement } from 'react'
import { AppOutline, UserOutline } from 'antd-mobile-icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const tabs: { key: string; title: string; icon: ReactNode }[] = [
  { key: '/', title: 'Inicio', icon: <AppOutline /> },
  { key: '/profile', title: 'Perfil', icon: <UserOutline /> },
]

export default function AppLayout(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const activeKey = location.pathname === '/' ? '/' : location.pathname
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ height: 'calc(100vh - 50px)', overflow: 'auto' }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={activeKey}
        onChange={(key) => navigate(key)}
        style={{
          borderTop: '1px solid #eceff1',
          background: '#ffffff',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          '--adm-color-primary': '#00897b',
          '--height': '50px',
        } as React.CSSProperties & { '--adm-color-primary': string; '--height': string }}
      >
        {tabs.map((item) => (
          <TabBar.Item key={item.key} title={item.title} icon={item.icon} />
        ))}
      </TabBar>
    </div>
  )
}
