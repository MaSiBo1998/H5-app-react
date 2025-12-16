import { request } from '@/services/http'

export interface MyOrderListParams {
  loading?: boolean,
  gamin: number
}
export interface MyOrderDetailParams {
  loading?: boolean,
  lima: string,
  gain: string
}
// 获取订单列表
export const getMyOrderList = (data?: MyOrderListParams) =>
  request(`/tty/factor/aldolase/rushy`, {
    method: 'POST',
    isLoading: data?.loading ?? true,
    body: data
  })

// 订单详情
export const getMyOrderDetail = (data?: MyOrderDetailParams) => 
  request('/aluminum/korea/heeled', { 
    method: 'POST',
    isLoading: data?.loading ?? true,
    body: data
  })
