import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd-mobile/es/global'
import App from '@/App'

// 移动端适配脚本
function setRem() {
  const baseSize = 37.5 // 375设计稿基准
  const scale = document.documentElement.clientWidth / 375
  // 限制最大宽度，避免PC端字体过大
  const safeScale = Math.min(scale, 2) 
  document.documentElement.style.fontSize = baseSize * safeScale + 'px'
}
// 初始化
setRem()
// 改变窗口大小时重新设置 rem
window.onresize = function () {
  setRem()
}

// 应用入口渲染
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
