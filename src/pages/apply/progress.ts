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
export default async function getNextStep(currentPath?: string) {
  let nextPath: string | null = null
  try {
    const res = await getUserDetail() as any
    // 收集所有未完成的步骤路径
    const undonePaths: string[] = []

    // 检查是否未完成所有步骤
    if (res.champak != 1) {
      const list = Array.isArray(res.pentoxid) ? res.pentoxid : []
      // 遍历步骤列表，查找未完成的步骤
      for (const item of list) {
        // leonora === 0 表示未完成
        if (item.leonora === 0) {
          const path = stepMap[item.creditPage]
          if (path) {
            undonePaths.push(path)
          }
        }
      }
    }
    if (nextPath === currentPath) {
      nextPath = undonePaths[1] || '/'
    } else {
      nextPath = undonePaths[0] || '/'
    }
    console.log(undonePaths, 'undonePaths')
  } catch (error) {
    console.error(error)
    if (!nextPath) nextPath = '/'
  }

  // 兜底
  if (!nextPath) nextPath = '/'
  console.log(nextPath, 'nextPath')
  return { nextPath }
}
