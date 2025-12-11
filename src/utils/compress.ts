/**
 * 压缩图片根据身份证标准
 * @param source Blob | string - 图片源（文件对象或 Base64 字符串）
 * @param options 配置项
 * @returns Promise<string> - 压缩后的 Base64 字符串
 */
export const compressImage = async (
  source: Blob | string,
  options: {
    maxWidth?: number
    maxSize?: number // 最大文件大小（字节），默认 0.5MB
    quality?: number // 初始质量，默认 0.9
  } = {}
): Promise<string> => {
  // 默认最大宽度 4096，最大大小 0.5MB (524288 字节)，初始质量 0.9
  const { maxWidth = 4096, maxSize = 0.5 * 1024 * 1024, quality = 0.9 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // 处理源
    let src = ''
    let isBlob = false
    if (typeof source === 'string') {
      src = source
    } else {
      src = URL.createObjectURL(source)
      isBlob = true
    }
    
    img.src = src

    img.onload = () => {
      let w = img.width
      let h = img.height
      
      // 调整尺寸
      if (w > maxWidth || h > maxWidth) {
        if (w > h) {
          h = Math.round(h * maxWidth / w)
          w = maxWidth
        } else {
          w = Math.round(w * maxWidth / h)
          h = maxWidth
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context failed'))
        return
      }

      // 绘制图片
      ctx.drawImage(img, 0, 0, w, h)
      
      // 循环压缩以满足大小限制
      let currentQuality = quality
      let dataUrl = canvas.toDataURL('image/jpeg', currentQuality)
      
      // 简单的 Base64 大小估算：(length * 3) / 4 - padding
      // 这里简化判断：length * 0.75 > maxSize
      while (dataUrl.length * 0.75 > maxSize && currentQuality > 0.1) {
        currentQuality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', currentQuality)
      }
      
      // 清理
      if (isBlob) {
        URL.revokeObjectURL(src)
      }
      
      resolve(dataUrl)
    }

    img.onerror = (e) => {
      if (isBlob) {
        URL.revokeObjectURL(src)
      }
      reject(e)
    }
  })
}
