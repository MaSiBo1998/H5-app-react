import { getUserDetail } from '@/services/api/user'

export type ApplyStep = 'workInfo' | 'contactInfo' | 'personalInfo' | 'identityInfo' | 'faceInfo' | 'bankInfo'

// 步骤路由映射
export const stepMap: Record<string, string> = {
  workInfo: '/work',
  contactInfo: '/contacts',
  personalInfo: '/personal',
  identityInfo: '/id',
  faceInfo: '/face-capture',
  bankInfo: '/bank'
}

// 标记步骤完成
export const markCompleted = (step: string) => {
  try {
    const completed = JSON.parse(localStorage.getItem('local_completed_steps') || '[]')
    if (!completed.includes(step)) {
      completed.push(step)
      localStorage.setItem('local_completed_steps', JSON.stringify(completed))
    }
  } catch { }
}

// 获取下一步路由
export const getNextPath = (currentStep?: string) => {
  if (currentStep) {
    const keys = Object.keys(stepMap)
    const idx = keys.indexOf(currentStep)
    if (idx !== -1 && idx < keys.length - 1) {
      return stepMap[keys[idx + 1]]
    }
  }
  return '/'
}

// 获取当前和下一步骤
export default async function getNowAndNextStep() { 
  const routeMap = {
    workInfo: '/work',
    contactInfo: '/contacts',
    personalInfo: '/personal',
    identityInfo: '/id',
    faceInfo: '/face-capture',
    bankInfo: '/bank'
  }
  let nowPath: string | null = null
  let nextPath: string | null = null
  try {
    const res = await getUserDetail() as any
    console.log(res)
    // 检查是否未完成所有步骤
    if (res.champak != 1) {
      const list = Array.isArray(res.pentoxid) ? res.pentoxid : []
      // 遍历步骤列表，查找未完成的步骤
      for (const item of list) {
        // leonora === 0 表示未完成
        if (item.leonora === 0) {
          const path = routeMap[item.creditPage as keyof typeof routeMap]
          if (path) {
            if (!nowPath) {
              nowPath = path
            } else {
              nextPath = path
              break
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
  return { nowPath, nextPath }
}
