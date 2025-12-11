import { useState, useRef, useEffect, type ReactElement } from 'react'
import { Card, Space, Button, Input, Picker, DatePicker, Toast, Image } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markCompleted, getNextPath } from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'
import {
  RightOutline,
  CameraOutline,
  CheckCircleFill
} from 'antd-mobile-icons'
import { idcardOcr, saveIdInfo } from '@/services/api/apply'
import styles from './ApplyPublic.module.css'

// Helper for image compression
const compressImage = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(blob)
    img.onload = () => {
      let w = img.width
      let h = img.height
      const max = 4096
      // Resize if needed
      if (w > max || h > max) {
        if (w > h) {
          h = Math.round(h * max / w)
          w = max
        } else {
          w = Math.round(w * max / h)
          h = max
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h)
        // Compress to jpeg with quality 0.7 (should be enough for < 0.5MB usually)
        // If strict < 0.5MB is needed, we could loop, but 0.7 is a good start.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl)
      } else {
        reject(new Error('Canvas context failed'))
      }
      URL.revokeObjectURL(img.src)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(img.src)
      reject(e)
    }
  })
}

// --- Camera Component ---
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
        // Default to -90 (Landscape Left) if no sensor data overrides it later
        setRotation(prev => prev === 0 ? -90 : prev)
      }
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Only apply sensor logic if we are in Portrait Viewport
      if (window.innerWidth < window.innerHeight) {
        const { gamma } = e
        if (gamma != null) {
          // gamma range: -90 (tilted left) to 90 (tilted right)
          if (gamma > 30) {
            setRotation(-90) // Tilted Right (CW) -> Text top points Left (Physical Up)
          } else if (gamma < -30) {
            setRotation(90) // Tilted Left (CCW) -> Text top points Right (Physical Up)
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('deviceorientation', handleOrientation)

    // Initial check
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
            facingMode: 'environment', // Use back camera
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
  // In portrait, if rotation is -90 (Tilted Right, CW), button bar should be at Top (Physical Right)
  // If rotation is 90 (Tilted Left, CCW), button bar should be at Bottom (Physical Right) -> default 'column'
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

        {/* Frame Container */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isNativeLandscape ? '60vh' : '60vw',
          height: isNativeLandscape ? 'calc(60vh / 1.585)' : 'calc(60vw * 1.585)',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px #FFFF', // Solid black mask
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}>
          {/* Inner Dashed Border */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px dashed rgba(38, 166, 154, 0.5)',
            borderRadius: '12px',
            overflow: 'hidden' // Clip the scan line inside the border
          }}>
            {/* Scan Line */}
            <div className={styles['scan-line']}></div>
          </div>

          {/* Tech Corners - Outside the dashed border */}
          <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '4px solid #26a69a', borderLeft: '4px solid #26a69a', borderTopLeftRadius: 4 }}></div>
          <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '4px solid #26a69a', borderRight: '4px solid #26a69a', borderTopRightRadius: 4 }}></div>
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '4px solid #26a69a', borderLeft: '4px solid #26a69a', borderBottomLeftRadius: 4 }}></div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '4px solid #26a69a', borderRight: '4px solid #26a69a', borderBottomRightRadius: 4 }}></div>

          {/* Crosshair */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 2, background: 'rgba(38, 166, 154, 0.3)', transform: 'translate(-50%, -50%)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 20, background: 'rgba(38, 166, 154, 0.3)', transform: 'translate(-50%, -50%)' }}></div>
        </div>

        {/* Rotated HUD Instructions - Top */}
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

        {/* Rotated HUD Instructions - Bottom */}
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

      {/* Controls Bar */}
      <div style={{
        // Dynamic size based on layout
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
        {/* Slot 1: Cancel Button (Top/Left/Right depending on rotation) */}
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
        
        {/* Slot 2: Shutter Button (Center) */}
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
        
        {/* Slot 3: Spacer to balance the layout and ensure Shutter is centered */}
        <div style={{ flex: 1 }}></div>
      </div>
    </div>
  )
}

export default function IdInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isProfileEntry = searchParams.get('entry') === 'profile'

  // Form State
  const [form, setForm] = useState({
    name: '',
    surname: '', // Father name
    idNumber: '',
    gender: '', // value
    genderLabel: '',
    birthday: '', // display
    birthdayValue: null as Date | null,
    stepTime: 0
  })

  // Images
  const [frontImg, setFrontImg] = useState('') // URL for display
  const [backImg, setBackImg] = useState('')
  const [frontBase64, setFrontBase64] = useState('')
  const [backBase64, setBackBase64] = useState('')

  // Control
  const [showCamera, setShowCamera] = useState(false)
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front')
  const [loading, setLoading] = useState(false)
  const [ocrFailCount, setOcrFailCount] = useState(0)
  const [showForm, setShowForm] = useState(false)

  // Visibles
  const [visibleGender, setVisibleGender] = useState(false)
  const [visibleDate, setVisibleDate] = useState(false)

  useEffect(() => {
    setForm(f => ({ ...f, stepTime: new Date().getTime() }))
  }, [])

  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  const openCamera = (type: 'front' | 'back') => {
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
        trysail: 1 // Default apply flow
      }

      const res: any = await idcardOcr(payload)

      // Success
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
        // Parse DD/MM/YYYY
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
      // Split to get raw content
      const rawContent = fullBase64.split(',')[1] || fullBase64

      // Display still needs the prefix if it's base64, 
      // OR we can use URL.createObjectURL(blob) for display to save memory?
      // But the previous code used base64 for display. 
      // Let's stick to using fullBase64 for display, but rawContent for state/api.

      if (cameraType === 'front') {
        setFrontImg(fullBase64)
        setFrontBase64(rawContent)
        // Check if we can OCR
        if (backBase64) {
          performOcr(rawContent, backBase64)
        } else {
          setLoading(false)
        }
      } else {
        setBackImg(fullBase64)
        setBackBase64(rawContent)
        // Check if we can OCR
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

      const payload = {
        elysium: finalFront,
        politico: finalBack,
        costa: form.name,
        gardant: form.surname,
        cavalier: form.idNumber,
        hurter: form.gender,
        hemiopia: form.birthday,
        opiatic: 1, // Camera
        kyushu: 1, // Camera
        coxswain: form.stepTime
      }
      await saveIdInfo(payload)
      markCompleted('id')
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(getNextPath())
      }
    } catch (e) {
      console.error(e)
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
      {!isProfileEntry && (
        <ApplySteps
          steps={[
            { key: 'work', label: 'Trabajo' },
            { key: 'contacts', label: 'Contactos' },
            { key: 'personal', label: 'Datos personales' },
            { key: 'id', label: 'Identificación' },
            { key: 'face', label: 'Selfie' },
          ]}
          current="id"
        />
      )}

      <Card className={styles['form-card']}>
        <div className={styles['section-header']}>
          <div className={styles['section-title']}>Identificación</div>
          <div className={styles['section-subtitle']}>Sube fotos de tu identificación</div>
        </div>

        {/* Upload Area */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {/* Front */}
          <div
            onClick={() => openCamera('front')}
            style={{
              flex: 1,
              aspectRatio: '1.585 / 1', // ID-1 ratio
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

          {/* Back */}
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
            {/* Name */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.name}
                  onChange={v => setForm({ ...form, name: v })}
                  placeholder="Nombre"
                />
              </div>
            </div>

            {/* Surname */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Apellido</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.surname}
                  onChange={v => setForm({ ...form, surname: v })}
                  placeholder="Apellido"
                />
              </div>
            </div>

            {/* ID Number */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Número de identificación</label>
              <div className={styles['input-wrapper']}>
                <Input
                  value={form.idNumber}
                  onChange={v => setForm({ ...form, idNumber: v })}
                  placeholder="Número de identificación"
                />
              </div>
            </div>

            {/* Gender */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Género</label>
              <div
                className={styles['input-wrapper']}
                onClick={() => {
                  setVisibleGender(true)
                }}
              >
                <div style={{ flex: 1, color: form.genderLabel ? '#333' : '#ccc' }}>
                  {form.genderLabel || 'Seleccionar género'}
                </div>
                <RightOutline color="#cccccc" />
              </div>
            </div>

            {/* Birthday */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Fecha de nacimiento</label>
              <div
                className={styles['input-wrapper']}
                onClick={() => {
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
