import { createContext, useContext, useEffect, useState, type ReactElement } from 'react'
import '@/pages/Home/Home.module.css'
import { getHomeData } from '@/services/api/home'
import StatusView from '@/components/status/StatusView'
import type { StatusData } from '@/components/status/types'
const HomeContext = createContext<{ homeData: any, loading: boolean }>({ homeData: {}, loading: false })
// 封装自定义 Hook（简化子组件调用）
export function useHomeContext() {
  return useContext(HomeContext)
}

export default function Home(): ReactElement {
  const [homeData, setHomeData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    ; (async () => {
      setLoading(true)
      try {
        const res = await getHomeData({ loading: true })
        setHomeData((res || {}) as StatusData)
        console.log('首页数据', res)
      } catch {
        void 0
      }
      setLoading(false)
    })()
    return () => {
      console.log('销毁')
    }
  }, [])

  
  return (
    <>
      <HomeContext.Provider value={{ homeData, loading }}>
        <div className="home-page">
          {/* 立即执行函数,符合条件再渲染页面,不符合返回null */}
          {(() => {
            const status = homeData ? (homeData.kaki ?? homeData.status) : undefined
            return !loading && typeof status === 'number' && homeData
              ? <StatusView status={status} data={homeData} />
              : null
          })()}
        </div>
      </HomeContext.Provider>
    </>
  )
}
