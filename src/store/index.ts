import { configureStore } from '@reduxjs/toolkit'
import riskReducer from './features/risk/riskSlice'

/**
 * 创建全局 Redux Store
 * configureStore 是 Redux Toolkit 提供的标准构建函数，它自动完成了以下工作：
 * 1. 组合 reducers (不需要手动使用 combineReducers)
 * 2. 启用 Redux DevTools 扩展
 * 3. 添加默认的中间件 (如 redux-thunk, serializableCheck 等)
 */
export const store = configureStore({
  // 注册 reducer 模块
  reducer: {
    risk: riskReducer,
    // 在这里添加更多 reducer，例如：
    // user: userReducer,
    // auth: authReducer,
  },
})

// 推断 RootState 类型：根据 store.getState() 的返回值自动生成
// 例如：{ counter: { value: number }, user: { name: string } }
export type RootState = ReturnType<typeof store.getState>

// 推断 AppDispatch 类型：包含 store.dispatch 的所有方法签名
// 用于在 hooks 中正确提示 dispatch 的参数类型
export type AppDispatch = typeof store.dispatch
