import { createSlice,type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '@/store'

// 埋点数据项的结构 (对应 bended 数组中的项)
export interface RiskEventItem {
  despot: string // key
  elbrus: string // value
}

// 埋点事件的结构 (对应 innerInfoList 数组中的项)
export interface RiskEvent {
  http: string // 埋点ID (例如 '000005')
  bended: RiskEventItem[] // 具体的键值对
}

// State 结构
export interface RiskState {
  events: RiskEvent[]
}

// 从 sessionStorage 恢复状态 (简单的持久化，防止页面刷新丢失数据)
const loadState = (): RiskState => {
  try {
    const serialized = sessionStorage.getItem('risk_events')
    if (serialized) {
      return { events: JSON.parse(serialized) }
    }
  } catch (err) {
    console.warn('Failed to load risk state from sessionStorage', err)
  }
  return { events: [] }
}

const initialState: RiskState = loadState()

export const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    // 添加单个埋点事件 (如果 Key 已存在则覆盖 Value)
    addRiskEvent: (state, action: PayloadAction<{ http: string; key: string; value: string | number }>) => {
      const { http, key, value } = action.payload
      
      // 查找是否已存在该 http 类型的记录
      let eventItem = state.events.find((item) => item.http === http)
      
      // 如果不存在，创建新的记录组
      if (!eventItem) {
        eventItem = {
          http: http,
          bended: [],
        }
        state.events.push(eventItem)
      }

      // 查找该 key 是否已存在
      const existingKeyIndex = eventItem.bended.findIndex(item => item.despot === key.toString())

      if (existingKeyIndex !== -1) {
        // 如果存在，更新 value (覆盖模式)
        eventItem.bended[existingKeyIndex].elbrus = value.toString()
      } else {
        // 如果不存在，添加新的键值对
        eventItem.bended.push({
          despot: key.toString(),
          elbrus: value.toString(),
        })
      }

      // 同步到 sessionStorage
      sessionStorage.setItem('risk_events', JSON.stringify(state.events))
    },

    // 追加单个埋点事件 (总是新增 Key-Value，不覆盖)
    appendRiskEvent: (state, action: PayloadAction<{ http: string; key: string; value: string | number }>) => {
      const { http, key, value } = action.payload
      
      // 查找是否已存在该 http 类型的记录
      let eventItem = state.events.find((item) => item.http === http)
      
      // 如果不存在，创建新的记录组
      if (!eventItem) {
        eventItem = {
          http: http,
          bended: [],
        }
        state.events.push(eventItem)
      }

      // 直接追加新的键值对
      eventItem.bended.push({
        despot: key.toString(),
        elbrus: value.toString(),
      })

      // 同步到 sessionStorage
      sessionStorage.setItem('risk_events', JSON.stringify(state.events))
    },

    // 批量添加/合并埋点事件 (用于从旧的 sessionStorage 或其他来源迁移数据)
    mergeRiskEvents: (state, action: PayloadAction<RiskEvent[]>) => {
        // 这里做一个简单的追加合并，实际可能需要更复杂的去重逻辑
        // 但考虑到埋点主要是追加，追加即可
        action.payload.forEach(newEvent => {
            const existingEvent = state.events.find(e => e.http === newEvent.http)
            if (existingEvent) {
                existingEvent.bended.push(...newEvent.bended)
            } else {
                state.events.push(newEvent)
            }
        })
        sessionStorage.setItem('risk_events', JSON.stringify(state.events))
    },

    // 清空埋点事件 (通常在上报成功后调用)
    clearRiskEvents: (state) => {
      state.events = []
      sessionStorage.removeItem('risk_events')
    },
  },
})

export const { addRiskEvent, appendRiskEvent, clearRiskEvents, mergeRiskEvents } = riskSlice.actions

// Selector
export const selectRiskEvents = (state: RootState) => state.risk.events

export default riskSlice.reducer
