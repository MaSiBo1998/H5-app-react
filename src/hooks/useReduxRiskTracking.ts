import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addRiskEvent, overwriteRiskEvent, sumRiskEvent, selectRiskEvents, submitRiskData } from '@/store/features/risk/riskSlice'

/**
 * 基于 Redux 的埋点统计 Hook
 * 替代旧的 useRiskTracking，支持跨页面数据持久化和统一上报
 */
export const useReduxRiskTracking = () => {
  const dispatch = useAppDispatch()
  const riskEvents = useAppSelector(selectRiskEvents)

  /**
   * 添加埋点数据
   * @param http 埋点ID
   * @param key 数据Key
   * @param value 数据Value
   * @param mode 更新模式: 'overwrite'(覆盖), 'append'(追加, 默认), 'sum'(累加)
   */
  const toSetRiskInfo = useCallback((http: string, key: string, value: string | number, mode: 'overwrite' | 'append' | 'sum' = 'append') => {
    if (mode === 'overwrite') {
      dispatch(overwriteRiskEvent({ http, key, value }))
    } else if (mode === 'sum') {
      dispatch(sumRiskEvent({ http, key, value }))
    } else {
      dispatch(addRiskEvent({ http, key, value }))
    }
    console.log(`Redux Risk Tracking Updated (${mode}):`, { http, key, value })
  }, [dispatch])

  /**
   * 合并埋点数据 (累加模式)
   * 专门用于合并相同 http 和 key 的数据 (例如点击次数累加)
   * @param http 埋点ID
   * @param key 数据Key
   * @param value 需要累加的值 (例如 1)
   */
  const toSumRiskInfo = useCallback((http: string, key: string, value: string | number) => {
    dispatch(sumRiskEvent({ http, key, value }))
    console.log('Redux Risk Tracking Summed:', { http, key, value })
  }, [dispatch])

  /**
   * 追加埋点数据 (强制追加)
   * @deprecated 建议使用 toSetRiskInfo(..., 'append')
   */
  const toAppendRiskInfo = useCallback((http: string, key: string, value: string | number) => {
    dispatch(addRiskEvent({ http, key, value }))
    console.log('Redux Risk Tracking Appended:', { http, key, value })
  }, [dispatch])

  /**
   * 提交埋点数据
   * 提交 Redux Store 中的所有埋点数据并清空
   * 使用 Thunk 直接从 Store 获取最新状态，避免闭包问题
   */
  const toSubmitRiskPoint = useCallback(async () => {
    dispatch(submitRiskData())
  }, [dispatch])

  /**
   * 获取当前埋点值
   * 注意：这只能获取到 Store 中的值，不一定是最新的（如果刚刚 dispatch 过）
   */
  const getRiskValue = useCallback((http: string, key: string) => {
    const event = riskEvents.find(e => e.http === http)
    if (!event) return null
    
    // 如果有多个相同 key (append 模式)，返回最后一个
    const items = event.bended.filter(item => item.despot === key.toString())
    if (items.length === 0) return null
    return items[items.length - 1].elbrus
  }, [riskEvents])

  return {
    toSetRiskInfo,
    toAppendRiskInfo,
    toSumRiskInfo,
    toSubmitRiskPoint,
    getRiskValue,
    riskEvents
  }
}
