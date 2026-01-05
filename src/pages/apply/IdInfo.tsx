import { useState, useRef, useEffect, type ReactElement } from 'react'
import { Card, Space, Button, Input, Picker, DatePicker, Toast, Image } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/Apply/components/ApplySteps'
import {
  RightOutline,
  CameraOutline,
  CheckCircleFill
} from 'antd-mobile-icons'
import { idcardOcr, saveIdInfo, updateIdInfo } from '@/services/api/apply'
import { compressImage } from '@/utils/compress'
import styles from './ApplyPublic.module.css'
import getNowAndNextStep from './progress'
import { useRiskTracking } from '@/hooks/useRiskTracking'

// --- 相机组件 ---
interface CameraViewProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
  type: 'front' | 'back'
}

const CameraView = ({ onCapture, onClose }: Omit<CameraViewProps, 'type'>) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [rotation, setRotation] = useState(-90)
  const [isLayoutLandscape, setIsLayoutLandscape] = useState(window.innerWidth > window.innerHeight)

  useEffect(() => {
    const handleResize = () => {
      const landscape = window.innerWidth > window.innerHeight
      setIsLayoutLandscape(landscape)
      if (landscape) {
        setRotation(0)
      } else {
        // 如果稍后没有传感器数据覆盖，默认为 -90（横向左侧）
        setRotation(prev => prev === 0 ? -90 : prev)
      }
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // 仅在纵向视口中应用传感器逻辑
      if (window.innerWidth < window.innerHeight) {
        const { gamma } = e
        if (gamma != null) {
          // gamma 范围：-90（向左倾斜）到 90（向右倾斜）
          if (gamma > 30) {
            setRotation(-90) // 向右倾斜 (顺时针) -> 文字顶部指向左侧 (物理上方)
          } else if (gamma < -30) {
            setRotation(90) // 向左倾斜 (逆时针) -> 文字顶部指向右侧 (物理上方)
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('deviceorientation', handleOrientation)

    // 初始检查
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 使用后置摄像头
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        })
        if (mounted) {
          setStream(s)
          if (videoRef.current) {
            videoRef.current.srcObject = s
            videoRef.current.play().catch(e => console.error("Video play failed:", e))
          }
        }
      } catch (err) {
        console.error("Camera error:", err)
        Toast.show('No se pudo acceder a la cámara')
        onClose()
      }
    }
    startCamera()
    return () => {
      mounted = false
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob(blob => {
          if (blob) onCapture(blob)
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const isNativeLandscape = isLayoutLandscape
  // 在纵向模式下，如果旋转为 -90（向右倾斜，顺时针），按钮栏应位于顶部（物理右侧）
  // 如果旋转为 90（向左倾斜，逆时针），按钮栏应位于底部（物理右侧）-> 默认 'column'
  const isBarAtTop = !isNativeLandscape && rotation === -90

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: isNativeLandscape ? 'row' : (isBarAtTop ? 'column-reverse' : 'column')
    }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          playsInline
          muted
        />

        {/* 框架容器 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isNativeLandscape ? '60vh' : '60vw',
          height: isNativeLandscape ? 'calc(60vh / 1.585)' : 'calc(60vw * 1.585)',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px #FFFF', // 纯黑遮罩
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}>
          {/* 内部虚线边框 */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px dashed rgba(38, 166, 154, 0.5)',
            borderRadius: '12px',
            overflow: 'hidden' // 将扫描线裁剪在边框内
          }}>
            {/* 扫描线 */}
            <div className={styles['scan-line']}></div>
          </div>

          {/* 科技角标 - 虚线边框外 */}
          <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '4px solid #26a69a', borderLeft: '4px solid #26a69a', borderTopLeftRadius: 4 }}></div>
          <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '4px solid #26a69a', borderRight: '4px solid #26a69a', borderTopRightRadius: 4 }}></div>
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '4px solid #26a69a', borderLeft: '4px solid #26a69a', borderBottomLeftRadius: 4 }}></div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '4px solid #26a69a', borderRight: '4px solid #26a69a', borderBottomRightRadius: 4 }}></div>

          {/* 十字准星 */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 2, background: 'rgba(38, 166, 154, 0.3)', transform: 'translate(-50%, -50%)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 20, background: 'rgba(38, 166, 154, 0.3)', transform: 'translate(-50%, -50%)' }}></div>
        </div>

        {/* 旋转的 HUD 指示 - 顶部 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${isNativeLandscape ? '23vh' : '34vw'})`,
          zIndex: 20,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'center',
          width: 'max-content'
        }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: '16px',
          }}>
            <div style={{
              color: '#26a69a',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
            }}>
              ESCANEO INTELIGENTE
            </div>
          </div>
        </div>

        {/* 旋转的 HUD 指示 - 底部 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(${isNativeLandscape ? '23vh' : '34vw'})`,
          zIndex: 20,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'center',
          width: 'max-content'
        }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: '16px',
          }}>
            <div style={{
              color: 'black',
              fontSize: '13px',
              fontWeight: 400
            }}>
              Alinee su identificación dentro del marco
            </div>
          </div>
        </div>

      </div>

      {/* 控制栏 */}
      <div style={{
        // 基于布局的动态尺寸
        width: isNativeLandscape ? '96px' : '100vw',
        height: isNativeLandscape ? '100vh' : '130px',
        background: '#fff',
        zIndex: 30,
        display: 'flex',
        flexDirection: isNativeLandscape
          ? 'column-reverse'
          : (rotation === -90 ? 'row' : 'row-reverse'),
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* 插槽 1：取消按钮（根据旋转情况位于上/左/右） */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={onClose} style={{
            color: '#333',
            transform: `rotate(${rotation}deg)`,
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
          }}>
            CANCELAR
          </div>
        </div>

        {/* 插槽 2：快门按钮（居中） */}
        <div
          className={styles['shutter-anim']}
          onClick={handleCapture}
          style={{
            flex: '0 0 auto',
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px solid rgba(38, 166, 154, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'rgba(38, 166, 154, 0.05)',
            boxShadow: '0 0 20px rgba(38, 166, 154, 0.1)'
          }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#26a69a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(38, 166, 154, 0.4)'
          }}>
            <CameraOutline fontSize={28} color='#fff' style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }} />
          </div>
        </div>

        {/* 插槽 3：用于平衡布局并确保快门居中的占位符 */}
        <div style={{ flex: 1 }}></div>
      </div>
    </div>
  )
}

export default function IdInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 入口参数 homeEdit首页修改, profile个人中心进件
  const entryParams = searchParams.get('entry')
  const orderId = searchParams.get('orderId')
  //下一步骤
  const [nextPath, setNextPath] = useState('')
  // 表单状态
  const [form, setForm] = useState({
    name: '',
    surname: '', // 父姓
    idNumber: '',
    gender: '', // 值
    genderLabel: '',
    birthday: '', // 显示
    birthdayValue: null as Date | null,
    stepTime: 0
  })

  // 图片
  const [frontImg, setFrontImg] = useState('') // 用于显示的 URL
  const [backImg, setBackImg] = useState('')
  const [frontBase64, setFrontBase64] = useState('')
  const [backBase64, setBackBase64] = useState('')

  // 控制
  const [showCamera, setShowCamera] = useState(false)
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front')
  const [loading, setLoading] = useState(false)
  const [ocrFailCount, setOcrFailCount] = useState(0)
  const [showForm, setShowForm] = useState(false)

  // 可见性
  const [visibleGender, setVisibleGender] = useState(false)
  const [visibleDate, setVisibleDate] = useState(false)

  // 埋点 Hook
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()

  // 埋点状态
  const pageStartTime = useRef<number>(Date.now())
  const uploadStartTimes = useRef({ front: 0, back: 0 })
  const inputStartTimes = useRef<{ [key: string]: number }>({})
  const inputTypes = useRef<{ [key: string]: number }>({}) // 1: input, 2: paste

  // 页面停留埋点
  useEffect(() => {
    pageStartTime.current = Date.now()
    return () => {
      const stayTime = Date.now() - pageStartTime.current
      toSetRiskInfo('000011', '2', stayTime)
      toSubmitRiskPoint()
    }
  }, [])

  // 输入框埋点处理
  const handleInputFocus = (field: string) => {
    inputStartTimes.current[field] = Date.now()
    inputTypes.current[field] = 1 // 默认为手输
  }

  const handleInputPaste = (field: string) => {
    inputTypes.current[field] = 2 // 粘贴
  }

  const handleInputBlur = (field: string, value: string) => {
    if (inputStartTimes.current[field] && value) {
      const duration = Date.now() - inputStartTimes.current[field]
      // 映射字段到 Key
      // idNumber (CURP): Key 4 (Type), Key 5 (Time)
      // name: Key 6 (Type), Key 7 (Time)
      // surname: Key 8 (Type), Key 9 (Time)
      let typeKey = '', timeKey = ''
      if (field === 'idNumber') { typeKey = '4'; timeKey = '5' }
      else if (field === 'name') { typeKey = '6'; timeKey = '7' }
      else if (field === 'surname') { typeKey = '8'; timeKey = '9' }

      if (typeKey && timeKey) {
        toSetRiskInfo('000010', typeKey, inputTypes.current[field] || 1)
        toSetRiskInfo('000010', timeKey, duration)
      }
      inputStartTimes.current[field] = 0
    }
  }

  // 选择器埋点处理
  const handlePickerOpen = (type: 'gender' | 'birthday') => {
    inputStartTimes.current[type] = Date.now()
    if (type === 'gender') setVisibleGender(true)
    if (type === 'birthday') setVisibleDate(true)
  }

  const handlePickerConfirm = (type: 'gender' | 'birthday') => {
    if (inputStartTimes.current[type]) {
      const duration = Date.now() - inputStartTimes.current[type]
      // gender: Key 10
      // birthday: Key 11
      const key = type === 'gender' ? '10' : '11'
      toSetRiskInfo('000010', key, duration)
      inputStartTimes.current[type] = 0
    }
  }

  useEffect(() => {
    setForm(f => ({ ...f, stepTime: new Date().getTime() }))
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {
    }
  }, [])

  const handleBack = () => {
    if (entryParams == '') {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }


  const openCamera = (type: 'front' | 'back') => {
    uploadStartTimes.current[type] = Date.now()
    setCameraType(type)
    setShowCamera(true)
  }

  const performOcr = async (fBase64: string, bBase64: string) => {
    setLoading(true)
    try {
      const payload = {
        liminal: fBase64,
        kenyon: bBase64,
        coxswain: form.stepTime,
        trysail: 1 // 默认申请流程
      }

      const res: any = await idcardOcr(payload)

      // 成功
      setShowForm(true)
      if (res?.towy) setFrontImg(res.towy)
      if (res?.curpBack) setBackImg(res.curpBack)

      const updates: any = {}
      if (res.costa) updates.name = res.costa
      if (res.vitrine) updates.surname = res.vitrine
      if (res.cavalier) updates.idNumber = res.cavalier
      if (res.hurter) {
        updates.gender = res.hurter
        updates.genderLabel = res.hurter
      }
      if (res.hemiopia) {
        updates.birthday = res.hemiopia
        // 解析 DD/MM/YYYY
        const parts = res.hemiopia.split('/')
        if (parts.length === 3) {
          updates.birthdayValue = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
        }
      }
      setForm(prev => ({ ...prev, ...updates }))

    } catch (e) {
      console.error(e)
      const newCount = ocrFailCount + 1
      setOcrFailCount(newCount)

      if (newCount >= 2) {
        setShowForm(true)
        Toast.show('No se pudo reconocer la identificación, por favor ingrese los datos manualmente')
      } else {
        Toast.show('No se pudo reconocer la identificación, por favor intente nuevamente')
        setFrontImg('')
        setBackImg('')
        setFrontBase64('')
        setBackBase64('')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCapture = async (blob: Blob) => {
    setShowCamera(false)
    setLoading(true)

    try {
      const fullBase64 = await compressImage(blob)
      // 分割以获取原始内容
      const rawContent = fullBase64.split(',')[1] || fullBase64

      if (cameraType === 'front') {
        // 埋点 Key 1: 正面上传时长
        if (uploadStartTimes.current.front) {
          const duration = Date.now() - uploadStartTimes.current.front
          toSetRiskInfo('000010', '1', duration)
        }
        setFrontImg(fullBase64)
        setFrontBase64(rawContent)
        // 检查是否可以进行 OCR
        if (backBase64) {
          performOcr(rawContent, backBase64)
        } else {
          setLoading(false)
        }
      } else {
        // 埋点 Key 2: 反面上传时长
        if (uploadStartTimes.current.back) {
          const duration = Date.now() - uploadStartTimes.current.back
          toSetRiskInfo('000010', '2', duration)
        }
        setBackImg(fullBase64)
        setBackBase64(rawContent)
        // 检查是否可以进行 OCR
        if (frontBase64) {
          performOcr(frontBase64, rawContent)
        } else {
          setLoading(false)
        }
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      Toast.show('Error al procesar la imagen')
    }
  }

  const onSubmit = async () => {
    if (!frontImg || !backImg) {
      Toast.show('Por favor suba las fotos de su identificación')
      return
    }
    if (!form.name || !form.surname || !form.idNumber || !form.gender || !form.birthday) {
      Toast.show('Por favor complete la información')
      return
    }

    setLoading(true)
    try {
      let finalFront = ''
      if (frontImg && frontImg.startsWith('http')) {
        finalFront = frontImg
      }

      let finalBack = ''
      if (backImg && backImg.startsWith('http')) {
        finalBack = backImg
      }

      let payload: any = {
        elysium: finalFront,
        politico: finalBack,
        costa: form.name,
        gardant: form.surname,
        cavalier: form.idNumber,
        hurter: form.gender,
        hemiopia: form.birthday,
        opiatic: 1, // 相机
        kyushu: 1, // 相机
        coxswain: form.stepTime
      }
      if (entryParams == 'homeEdit') {
        payload.gain = orderId
        await updateIdInfo(payload)
      } else {
        await saveIdInfo(payload)
        // 埋点 Key 1: 提交结果 = 1 (成功)
        toSetRiskInfo('000011', '1', 1)
      }

      if (entryParams == 'profile') {
        navigate('/my-info')
      } else if (entryParams == 'homeEdit') {
        navigate('/')
      } else {
        navigate(nextPath)
      }
    } catch (e: any) {
      console.error(e)
      // 埋点 Key 1: 提交结果 = 2 (失败), Key 3: 失败原因
      toSetRiskInfo('000011', '1', 2)
      toSetRiskInfo('000011', '3', e.msg || e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['page-container']}>
      {showCamera && (
        <CameraView
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}

      <HeaderNav
        title="Identificación"
        backDirect={false}
        onBack={handleBack}
      />
      {!entryParams && (
        <ApplySteps
          steps={[
            { key: 'work', label: 'Trabajo' },
            { key: 'contacts', label: 'Contactos' },
            { key: 'personal', label: 'Datos personales' },
            { key: 'id', label: 'Identificación' },
            { key: 'bankInfo', label: 'Bancaria' }
          ]}
          current="id"
        />
      )}

      <Card className={styles['form-card']}>
        <div className={styles['section-header']}>
          <div className={styles['section-title']}>Identificación</div>
          <div className={styles['section-subtitle']}>Sube fotos de tu identificación</div>
        </div>

        {/* 上传区域 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {/* 正面 */}
          <div
            onClick={() => openCamera('front')}
            style={{
              flex: 1,
              aspectRatio: '1.585 / 1', // ID-1 比例
              background: '#f8f9fa',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #e0e0e0',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: frontImg ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {frontImg ? (
              <>
                <Image src={frontImg} width='100%' height='100%' fit='cover' />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 12,
                  padding: '4px 0',
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  Frente <CheckCircleFill color='#00e676' fontSize={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#e0f2f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  margin: '0 auto 8px'
                }}>
                  <CameraOutline fontSize={24} color='#00897b' />
                </div>
                <div style={{ fontSize: 13, color: '#546e7a', fontWeight: 500 }}>Frente</div>
                <div style={{ fontSize: 10, color: '#b0bec5', marginTop: 2 }}>Subir foto</div>
              </div>
            )}
          </div>

          {/* 背面 */}
          <div
            onClick={() => openCamera('back')}
            style={{
              flex: 1,
              aspectRatio: '1.585 / 1',
              background: '#f8f9fa',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #e0e0e0',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: backImg ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {backImg ? (
              <>
                <Image src={backImg} width='100%' height='100%' fit='cover' />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 12,
                  padding: '4px 0',
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  Reverso <CheckCircleFill color='#00e676' fontSize={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#e0f2f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  margin: '0 auto 8px'
                }}>
                  <CameraOutline fontSize={24} color='#00897b' />
                </div>
                <div style={{ fontSize: 13, color: '#546e7a', fontWeight: 500 }}>Reverso</div>
                <div style={{ fontSize: 10, color: '#b0bec5', marginTop: 2 }}>Subir foto</div>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <Space direction="vertical" block>
            {/* 名字 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.name}
                  onChange={v => setForm({ ...form, name: v })}
                  placeholder="Nombre"
                  onFocus={() => handleInputFocus('name')}
                  onBlur={(e) => handleInputBlur('name', e.target.value)}
                  onPaste={() => handleInputPaste('name')}
                />
              </div>
            </div>

            {/* 姓氏 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Apellido</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.surname}
                  onChange={v => setForm({ ...form, surname: v })}
                  placeholder="Apellido"
                  onFocus={() => handleInputFocus('surname')}
                  onBlur={(e) => handleInputBlur('surname', e.target.value)}
                  onPaste={() => handleInputPaste('surname')}
                />
              </div>
            </div>

            {/* 身份证号 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Número de identificación</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.idNumber}
                  onChange={v => setForm({ ...form, idNumber: v })}
                  placeholder="Número de identificación"
                  onFocus={() => handleInputFocus('idNumber')}
                  onBlur={(e) => handleInputBlur('idNumber', e.target.value)}
                  onPaste={() => handleInputPaste('idNumber')}
                />
              </div>
            </div>

            {/* 性别 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Género</label>
              <div
                className={styles['input-wrapper']}
                onClick={() => {
                  handlePickerOpen('gender')
                  setVisibleGender(true)
                }}
              >
                <div style={{ flex: 1, color: form.genderLabel ? '#333' : '#ccc' }}>
                  {form.genderLabel || 'Seleccionar género'}
                </div>
                <RightOutline color="#cccccc" />
              </div>
            </div>

            {/* 生日 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Fecha de nacimiento</label>
              <div
                className={styles['input-wrapper']}
                onClick={() => {
                  handlePickerOpen('birthday')
                  setVisibleDate(true)
                }}
              >
                <div style={{ flex: 1, color: form.birthday ? '#333' : '#ccc' }}>
                  {form.birthday || 'dd/mm/aaaa'}
                </div>
                <RightOutline color="#cccccc" />
              </div>
            </div>

          </Space>
        )}
      </Card>

      {showForm && (
        <div className={styles['submit-bar']}>
          <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
        </div>
      )}

      <Picker
        closeOnMaskClick={false}
        visible={visibleGender}
        onClose={() => setVisibleGender(false)}
        columns={[[
          { label: 'Masculino', value: 'M' },
          { label: 'Femenino', value: 'F' }
        ]]}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={v => {
          handlePickerConfirm('gender')
          const item = v[0] === 'M' ? 'Masculino' : 'Femenino'
          setForm({ ...form, gender: v[0] as string, genderLabel: item })
        }}
      />

      <DatePicker
        closeOnMaskClick={false}
        visible={visibleDate}
        onClose={() => setVisibleDate(false)}
        confirmText="Confirmar"
        cancelText="Cancelar"
        max={new Date()}
        onConfirm={v => {
          handlePickerConfirm('birthday')
          const day = v.getDate().toString().padStart(2, '0')
          const month = (v.getMonth() + 1).toString().padStart(2, '0')
          const year = v.getFullYear()
          setForm({
            ...form,
            birthdayValue: v,
            birthday: `${day}/${month}/${year}`
          })
        }}
      />

    </div>
  )
}
