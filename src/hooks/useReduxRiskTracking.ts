import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addRiskEvent, appendRiskEvent, clearRiskEvents, selectRiskEvents } from '@/store/features/risk/riskSlice'
import { toUniversalPoint } from '@/services/api/user'

/**
 * 基于 Redux 的埋点统计 Hook
 * 替代旧的 useRiskTracking，支持跨页面数据持久化和统一上报
 */
export const useReduxRiskTracking = () => {
  const dispatch = useAppDispatch()
  const riskEvents = useAppSelector(selectRiskEvents)

  /**
   * 添加埋点数据 (覆盖模式)
   * 如果相同 http 和 key 已存在，则覆盖旧值
   * 适用于：点击次数计数器等唯一值场景
   * @param http 埋点ID (例如 '000005')
   * @param key 数据Key (例如 '1', '2')
   * @param value 数据Value
   */
  const toSetRiskInfo = useCallback((http: string, key: string, value: string | number) => {
    dispatch(addRiskEvent({ http, key, value }))
    console.log('Redux Risk Tracking Updated (Set):', { http, key, value })
  }, [dispatch])

  /**
   * 追加埋点数据 (追加模式)
   * 总是新增一条记录，即使相同 http 和 key 已存在
   * 适用于：页面停留时长、阅读状态等每次都需要记录的场景
   * @param http 埋点ID
   * @param key 数据Key
   * @param value 数据Value
   */
  const toAppendRiskInfo = useCallback((http: string, key: string, value: string | number) => {
    dispatch(appendRiskEvent({ http, key, value }))
    console.log('Redux Risk Tracking Appended:', { http, key, value })
  }, [dispatch])

  /**
   * 提交所有埋点数据
   */
  const toSubmitRiskPoint = useCallback(async () => {
    try {
      if (riskEvents.length > 0) {
        console.log('Submitting Redux Risk Events:', riskEvents)
        // 使用原有的 API 接口
        await toUniversalPoint({ innerInfoList: riskEvents })
        // 提交成功后清空 Redux store 和 sessionStorage
        dispatch(clearRiskEvents())
      }
    } catch (error) {
      console.error("Redux Risk point submit failed:", error)
      // 失败时不清除，等待下次尝试
    }
  }, [riskEvents, dispatch])

  /**
   * 获取当前埋点的值 (用于累加等操作)
   */
  const getRiskValue = useCallback((http: string, key: string): string | undefined => {
    const event = riskEvents.find(e => e.http === http)
    const item = event?.bended.find(i => i.despot === key)
    return item?.elbrus
  }, [riskEvents])

  return {
    toSetRiskInfo,
    toAppendRiskInfo,
    toSubmitRiskPoint,
    getRiskValue,
    riskEvents
  }
}
