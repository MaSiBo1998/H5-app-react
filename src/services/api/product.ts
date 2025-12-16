import { request } from '@/services/http'

export interface ProductDetailParams {
  loading?: boolean
  appName: string
}

// 获取产品详情 (对应 Vue getOrderDetail)
export const getProductDetail = (data: ProductDetailParams) =>
  request('/salol/been/innately/cres', {
    method: 'POST',
    isLoading: data.loading ?? true,
    body: {
      enfant: data.appName // 映射 appName 到 lima
    }
  })
