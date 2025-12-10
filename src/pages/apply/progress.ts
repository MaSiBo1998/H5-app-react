import { getUserDetail } from '@/services/api/user'

export type ApplyStep = 'workInfo' | 'contactInfo' | 'personalInfo' | 'identityInfo' | 'faceInfo' | 'bankInfo'

export const stepMap: Record<string, string> = {
  workInfo: '/work',
  contactInfo: '/contacts',
  personalInfo: '/personal',
  identityInfo: '/id',
  faceInfo: '/face-capture',
  bankInfo: '/bank'
}

export const markCompleted = (step: string) => {
  try {
    const completed = JSON.parse(localStorage.getItem('local_completed_steps') || '[]')
    if (!completed.includes(step)) {
      completed.push(step)
      localStorage.setItem('local_completed_steps', JSON.stringify(completed))
    }
  } catch { }
}

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
    if (res.champak != 1) {
      const list = Array.isArray(res.pentoxid) ? res.pentoxid : []
      for (const item of list) {
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
