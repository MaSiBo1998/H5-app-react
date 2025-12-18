import { useState, useRef, useEffect, type ReactElement } from 'react'
import { Card, Button, Toast } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'
import { CameraOutline } from 'antd-mobile-icons'
import { saveFaceInfo, updateFaceInfo } from '@/services/api/apply'
import { compressImage } from '@/utils/compress'
import styles from './ApplyPublic.module.css'
import getNowAndNextStep from './progress'

export default function FaceCapture(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 入口参数 homeEdit首页修改, profile个人中心进件
  const entryParams = searchParams.get('entry')
  const orderId = searchParams.get('orderId')
  // 是否从个人中心进入
  const isProfileEntry = entryParams === 'profile'

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

  // 初始化
  useEffect(() => {
    setStepTime(new Date().getTime())
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {
    }
    return () => {
      stopCamera()
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
    try {
      setIsCameraActive(true) // Render video element first
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      setStream(s)
    } catch (err) {
      console.error("Camera error:", err)
      setIsCameraActive(false)
      Toast.show('No se pudo acceder a la cámara. Por favor verifique los permisos.')
    }
  }

  // 停止摄像头
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
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

      // Calculate crop to make it square/centered
      const size = Math.min(video.videoWidth, video.videoHeight)
      const x = (video.videoWidth - size) / 2
      const y = (video.videoHeight - size) / 2

      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Mirror the image horizontally for selfie feel
        ctx.translate(size, 0)
        ctx.scale(-1, 1)

        ctx.drawImage(video, x, y, size, size, 0, 0, size, size)

        // 获取原始图片
        const rawDataUrl = canvas.toDataURL('image/jpeg', 1.0)

        // 使用标准压缩 (Max 1024, Q 0.7)
        const compressedDataUrl = await compressImage(rawDataUrl)

        setImgSrc(compressedDataUrl)
        stopCamera()

        // Direct submit
        await submitFace(compressedDataUrl)
      }
    }
  }

  // 提交人脸信息
  const submitFace = async (base64Str: string) => {
    setLoading(true)
    setIsError(false)
    try {
      // 移除 base64 前缀
      const cleanBase64 = base64Str.split(',')[1]

      const payload: any = {
        moil: cleanBase64,
        // haslet:entryParams == 'homeEdit'?5: 1,
        coxswain: stepTime
      }

      if (entryParams == 'homeEdit') {
        payload.gain = orderId
        await updateFaceInfo(payload)
      } else {
        await saveFaceInfo(payload)
      }

      if (entryParams == 'profile') {
        navigate('/my-info')
      } else if (entryParams == 'homeEdit') {
        navigate('/')
      } else {
        navigate(nextPath)
      }
    } catch (e) {
      console.error(e)
      setIsError(true)
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
        paddingTop: 40,
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
          letterSpacing: '-0.5px'
        }}>
          Verificación Facial
        </div>
        <div style={{ fontSize: 16, color: '#546e7a', marginBottom: 40, textAlign: 'center', maxWidth: '85%', lineHeight: 1.6 }}>
          Por favor, asegúrese de tener buena iluminación y mantenga su rostro dentro del marco.
        </div>

        {/* Camera/Image Container */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          {/* Advanced Ring Decoration */}
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
            {/* State 1: Idle (Guide) */}
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

            {/* State 2: Camera Active (Video) */}
            {isCameraActive && !imgSrc && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror effect
                  }}
                />

                {/* Clean View - No Overlays inside image area */}
              </>
            )}

            {/* State 3: Captured (Image) */}
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
              // Do nothing while processing
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
