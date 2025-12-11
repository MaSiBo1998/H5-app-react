import { request } from '@/services/http'

export interface HomeDataParams {
  loading?: boolean
}

// 获取首页数据
export const getHomeData = (data?: HomeDataParams) =>
  request(`/tsinghai/advanced/donnard/aliunde`, {
    method: 'POST',
    isLoading: data?.loading ?? true,
  })

// 获取配置信息
export const getConfigInfo = () => 
  request('/harmonic/elt/percent', { 
    method: 'GET' 
  })
