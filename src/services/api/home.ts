import { request } from '@/services/http'

export interface HomeDataParams {
  loading?: boolean
}

export const getHomeData = (data?: HomeDataParams) =>
  request(`/tsinghai/advanced/donnard/aliunde`, {
    method: 'POST',
    isLoading: data?.loading ?? true,
  })

export const getConfigInfo = () => 
  request('/harmonic/elt/percent', { 
    method: 'GET' 
  })
