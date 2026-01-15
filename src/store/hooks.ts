import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

/**
 * 封装后的 useDispatch 钩子
 * 
 * 作用：
 * 1. 替代 react-redux 原生的 useDispatch
 * 2. 自动推断 AppDispatch 类型，提供更准确的代码提示
 * 3. 避免在每个组件中重复声明类型
 * 
 * 使用示例：
 * const dispatch = useAppDispatch()
 * dispatch(increment())
 */
export const useAppDispatch: () => AppDispatch = useDispatch

/**
 * 封装后的 useSelector 钩子
 * 
 * 作用：
 * 1. 替代 react-redux 原生的 useSelector
 * 2. 自动注入 RootState 类型，直接访问 state 属性时有代码提示
 * 3. 省去每次使用时需要手动指定 (state: RootState) 的麻烦
 * 
 * 使用示例：
 * const count = useAppSelector((state) => state.counter.value)
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
