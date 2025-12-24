import { createContext, useContext, useEffect, useState, type ReactElement } from 'react'
import { PullToRefresh } from 'antd-mobile'
import { PhoneFill } from 'antd-mobile-icons'
import styles from '@/pages/Home/Home.module.css'
import { getHomeData } from '@/services/api/home'
import StatusView from '@/components/status/StatusView'
import type { StatusData } from '@/components/status/types'
// 上下文对象
export const HomeContext = createContext<{ homeData: StatusData, refresh: (showLoading?: boolean) => void } | null>(null)
// 封装自定义 Hook（简化子组件调用）
export function useHomeContext() {
  return useContext(HomeContext)
}

export default function Home(): ReactElement {
  // 首页状态数据
  const [homeData, setHomeData] = useState<StatusData | null>(null)
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false)

  // 获取数据函数
  const fetchHomeData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const res = await getHomeData({ loading: showLoading })
      setHomeData((res || {}) as StatusData)
      console.log('首页数据', res)
    } catch {
      void 0
    }
    if (showLoading) setLoading(false)
  }

  // 初始化获取数据
  useEffect(() => {
    fetchHomeData()
    return () => {
      console.log('销毁')
    }
  }, [])

  const handleContact = () => {
    window.location.href = 'tel:'
  }

  return (
    <>
      <HomeContext.Provider value={{ homeData: homeData || {}, refresh: fetchHomeData }}>
        <PullToRefresh
          onRefresh={async () => { await fetchHomeData(true) }}
          pullingText="Desliza para actualizar"
          canReleaseText="Suelta para actualizar"
          refreshingText="Cargando..."
          completeText="Actualizado"
        >
          <div className={styles['home-container']}>
            {/* 自定义顶部导航栏 */}
            <div className={styles['custom-header']}>
              <div className={styles['header-bg-pattern']}></div>

              <div className={styles['header-content']}>
                <div className={styles['brand-name']}>
                  CrediPrisa
                </div>

                <div onClick={handleContact} className={styles['contact-btn']}>
                  <PhoneFill fontSize={16} />
                  <span className={styles['contact-text']}>Ayuda</span>
                </div>
              </div>
            </div>

            <div className={styles['home-page']}>
              {/* 立即执行函数,符合条件再渲染页面,不符合返回null */}
              {(() => {
                const status = homeData ? (homeData.kaki ?? homeData.status) : undefined
                return !loading && typeof status === 'number' && homeData
                  ? <StatusView status={status} data={homeData} onRefresh={fetchHomeData} />
                  : null
              })()}
            </div>
          </div>
        </PullToRefresh>
      </HomeContext.Provider>
    </>
  )
}
