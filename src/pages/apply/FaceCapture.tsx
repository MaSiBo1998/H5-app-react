import { useState, useRef, useEffect, type ReactElement } from 'react'
import { Card, Button, Toast } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/Apply/components/ApplySteps'
import { CameraOutline } from 'antd-mobile-icons'
import { saveFaceInfo, updateFaceInfo } from '@/services/api/apply'
import { compressImage } from '@/utils/compress'
import styles from './ApplyPublic.module.css'
import getNowAndNextStep from './progress'
import { useRiskTracking } from '@/hooks/useRiskTracking'

export default function FaceCapture(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 入口参数 homeEdit首页修改, profile个人中心进件
  const entryParams = searchParams.get('entry')
  const orderId = searchParams.get('orderId')
  // 视频和画布引用
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 媒体流状态
  const [stream, setStream] = useState<MediaStream | null>(null)
  // 捕获的图片地址
  const [imgSrc, setImgSrc] = useState<string>('')
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 步骤开始时间
  const [stepTime, setStepTime] = useState(0)
  // 摄像头激活状态
  const [isCameraActive, setIsCameraActive] = useState(false)
  // 错误状态
  const [isError, setIsError] = useState(false)
  //下一步骤
  const [nextPath, setNextPath] = useState('')

  // 埋点 Hook
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()

  // 埋点相关 Refs
  const pageStartTime = useRef(Date.now())
  const faceStartTime = useRef(0)
  // 初始化
  useEffect(() => {
    setStepTime(new Date().getTime())
    pageStartTime.current = Date.now()
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
        setNextPath(nextPath ?? '')
      })()  
    } catch (error) {
    }
    return () => {
      stopCamera()
      // 页面卸载/隐藏时埋点
      const duration = Date.now() - pageStartTime.current
      toSetRiskInfo('000012', '2', duration)
      toSubmitRiskPoint()
    }
  }, [])

  // 监听摄像头流
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error("Video play failed:", e))
    }
  }, [isCameraActive, stream])

  // 启动摄像头
  const startCamera = async () => {
    // 确保之前的流已停止
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }

    try {
      faceStartTime.current = Date.now() // 记录开始时间
      setIsCameraActive(true) // 先渲染视频元素

      let s: MediaStream
      try {
        // 尝试首选配置
        s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
      } catch (firstErr: any) {
        console.warn("First camera attempt failed:", firstErr)
        // 降级策略：如果是因为参数约束或无法读取，尝试最基本的配置
        if (firstErr.name === 'OverconstrainedError' || 
            firstErr.name === 'ConstraintNotSatisfiedError' || 
            firstErr.name === 'NotReadableError') {
          s = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user'
            },
            audio: false
          })
        } else {
          throw firstErr
        }
      }
      
      setStream(s)
    } catch (err: any) {
      console.error("Camera error:", err)
      setIsCameraActive(false)
      
      let msg = 'No se pudo acceder a la cámara.'
      // 根据错误类型提供更准确的提示
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = 'Acceso a la cámara denegado. Por favor, habilite los permisos.'
      } else if (err?.name === 'NotFoundError') {
        msg = 'No se encontró la cámara.'
      } else if (err?.name === 'NotReadableError') {
        msg = 'La cámara está ocupada o no es accesible. Cierre otras aplicaciones.'
      }
      
      Toast.show(msg)
    }
  }

  // 停止摄像头
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  // 返回处理
  const handleBack = () => {
    stopCamera()
    if (entryParams == 'profile') {
      navigate('/my-info')
    } else if (entryParams == 'homeEdit') {
      navigate('/')
    } else {
      navigate('/')
    }
  }

  // 拍照处理
  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // 计算裁剪区域以使其正方形/居中
      const size = Math.min(video.videoWidth, video.videoHeight)
      const x = (video.videoWidth - size) / 2
      const y = (video.videoHeight - size) / 2

      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      if (ctx) {
        // 水平镜像图像以获得自拍感
        ctx.translate(size, 0)
        ctx.scale(-1, 1)

        ctx.drawImage(video, x, y, size, size, 0, 0, size, size)

        // 获取原始图片
        const rawDataUrl = canvas.toDataURL('image/jpeg', 1.0)

        // 使用标准压缩 (最大 1024, 质量 0.7)
        const compressedDataUrl = await compressImage(rawDataUrl)

        setImgSrc(compressedDataUrl)
        stopCamera()

        // 直接提交
        await submitFace(compressedDataUrl)
      }
    }
  }

  // 提交人脸信息
  const submitFace = async (base64Str: string) => {
    setLoading(true)
    setIsError(false)

    // 记录拍照时长
    const duration = Date.now() - faceStartTime.current
    toSetRiskInfo('000012', '1', duration)

    try {
      // 移除 base64 前缀
      const cleanBase64 = base64Str.split(',')[1]

      let tokeny = ''
      try {
          // @ts-ignore
          const client = new window.FingerPrint(
              "https://us.mobilebene.com/w",
              import.meta.env.VITE_APP_JG_KEY
          )
          // @ts-ignore
          tokeny = await client.record("order")
      } catch (err) {
          console.log('金果SDK获取token失败', err)
          tokeny = ''
      }

      const payload: any = {
        moil: cleanBase64,
        haslet:entryParams == 'homeEdit'?5: 1,
        coxswain: stepTime,
        tokenKey: tokeny
      }

      if (entryParams == 'homeEdit') {
        payload.gain = orderId
        await updateFaceInfo(payload)
      } else {
        await saveFaceInfo(payload)
      }

      // 提交成功埋点
      toSetRiskInfo('000012', '4', '1')
      await toSubmitRiskPoint()

      if (entryParams == 'profile') {
        navigate('/my-info')
      } else if (entryParams == 'homeEdit') {
        navigate('/')
      } else {
        navigate(nextPath)
      }
    } catch (e: any) {
      console.error(e)
      setIsError(true)
      // 提交失败埋点
      toSetRiskInfo('000012', '3', e.msg || e.message || 'Error')
      toSetRiskInfo('000012', '4', '2')
    } finally {
      setLoading(false)
    }
  }

  // 重试
  const handleRetake = () => {
    setImgSrc('')
    setIsError(false)
    startCamera()
  }

  // 点击圆圈处理
  const handleCircleClick = () => {
    if (loading) return

    if (isError) {
      handleRetake()
      return
    }

    if (imgSrc) {
      return
    } else if (isCameraActive) {
      handleCapture()
    } else {
      startCamera()
    }
  }

  return (
    <div className={styles['page-container']}>
      <HeaderNav
        title="Verificación Facial"
        backDirect={false}
        onBack={handleBack}
      />
      {!entryParams && (
        <ApplySteps
          steps={[
            { key: 'work', label: 'Trabajo' },
            { key: 'contacts', label: 'Contactos' },
            { key: 'personal', label: 'Datos personales' },
            { key: 'face', label: 'Selfie' },
            { key: 'bankInfo', label: 'Bancaria' }
          ]}
          current="face"
        />
      )}

      <Card className={styles['form-card']} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 56,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none'
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 12,
          background: 'linear-gradient(135deg, #26a69a 0%, #00897b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          textAlign:'center'
        }}>
          Verificación Facial
        </div>
        <div style={{ fontSize: 16, color: '#546e7a', marginBottom: 40, textAlign: 'center', maxWidth: '85%', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Por favor, asegúrese de tener buena iluminación y mantenga su rostro dentro del marco.
        </div>

        {/* Camera/Image Container */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          {/* 高级环形装饰 */}
          {(isCameraActive || imgSrc) && (
            <div className={styles['advanced-ring']} />
          )}

          <div
            onClick={handleCircleClick}
            style={{
              position: 'relative',
              width: 260,
              height: 260,
              borderRadius: '50%',
              overflow: 'hidden',
              border: isError ? '4px solid #ff4d4f' : (isCameraActive ? 'none' : '1px dashed #cfd8dc'),
              background: isCameraActive ? '#000' : '#f8f9fa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isError ? '0 10px 40px rgba(255, 77, 79, 0.2)' : (isCameraActive ? '0 20px 60px rgba(0,0,0,0.3)' : 'none')
            }}
          >
            {/* 状态 1: 空闲 (引导) */}
            {!isCameraActive && !imgSrc && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#78909c' }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #26a69a 0%, #00897b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 12px 32px rgba(38, 166, 154, 0.3)',
                  border: 'none',
                  transition: 'transform 0.3s ease'
                }}>
                  <CameraOutline fontSize={48} color='#fff' />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00897b', letterSpacing: '0.5px' }}>Iniciar Cámara</div>
              </div>
            )}

            {/* 状态 2: 相机激活 (视频) */}
            {isCameraActive && !imgSrc && (
              <>
                <video
                  key={stream?.id}
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // 镜像效果
                  }}
                />

                {/* 干净视图 - 图像区域内无覆盖层 */}
              </>
            )}

            {/* 状态 3: 已捕获 (图片) */}
            {imgSrc && (
              <img
                src={imgSrc}
                alt="Selfie"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
              />
            )}
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {isError && (
          <div style={{ marginTop: 24, textAlign: 'center', color: '#ff4d4f', fontWeight: 600 }}>
            Verificación fallida, por favor intente nuevamente
          </div>
        )}
      </Card>

      <div className={styles['submit-bar']}>
        <Button
          color='primary'
          block
          className={styles['submit-btn']}
          disabled={loading}
          onClick={() => {
            if (isError) {
              handleRetake()
            } else if (imgSrc) {
              // 处理中不做任何操作
            } else if (isCameraActive) {
              handleCapture()
            } else {
              handleCircleClick()
            }
          }}
        >
          {loading ? 'Procesando...' : (isError ? 'Reintentar' : (isCameraActive ? 'Capturar' : 'Iniciar Cámara'))}
        </Button>
      </div>
    </div>
  )
}
