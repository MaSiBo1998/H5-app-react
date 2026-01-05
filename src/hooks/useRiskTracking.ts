import { useRef, useCallback } from 'react'
import { toUniversalPoint } from '@/services/api/user'

/**
 * 埋点统计和上报 Hook
 * 用于收集用户行为数据并统一上报
 */
export const useRiskTracking = () => {
  // 存储埋点数据的队列
  // 结构: [{ http: "埋点ID", bended: [{ despot: "key", elbrus: "value" }] }]
  const innerInfoList = useRef<Array<{ http: string; bended: Array<{ despot: string; elbrus: string }> }>>([])

  /**
   * 添加埋点数据到队列
   * @param http 埋点ID (例如 '000005')
   * @param key 数据Key (例如 '1', '2')
   * @param value 数据Value
   */
  const toSetRiskInfo = useCallback((http: string, key: string, value: string | number) => {
    // 查找是否已存在该 http 类型的记录
    let eventItem = innerInfoList.current.find((item) => item.http === http)
    
    // 如果不存在，创建新的记录组
    if (!eventItem) {
      eventItem = {
        http: http,
        bended: [],
      }
      innerInfoList.current.push(eventItem)
    }

    // 添加具体的键值对
    eventItem.bended.push({
      despot: key.toString(),
      elbrus: value.toString(),
    })
  }, [])

  /**
   * 提交队列中的所有埋点数据
   * 提交成功后会清空队列
   */
  const toSubmitRiskPoint = useCallback(async () => {
    try {
      // 只有当队列中有数据时才提交
      if (innerInfoList.current.length > 0) {
        await toUniversalPoint({ innerInfoList: innerInfoList.current })
        // 提交成功后清空队列，防止重复提交
        innerInfoList.current = []
      }
    } catch (error) {
      console.error("Risk point submit failed:", error)
      // 注意：这里如果失败，数据仍然保留在 innerInfoList.current 中，
      // 下次调用 toSubmitRiskPoint 时会再次尝试提交（如果组件未卸载）
    }
  }, [])

  return {
    toSetRiskInfo,
    toSubmitRiskPoint,
    // 暴露 ref 以便某些特殊情况检查（通常不需要直接操作）
    innerInfoList
  }
}
