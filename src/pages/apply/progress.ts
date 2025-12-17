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
              nowPath = path ? path : '/'
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
