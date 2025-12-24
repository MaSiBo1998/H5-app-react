import HeaderNav from "@/components/common/HeaderNav";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { 
    UserOutline, 
    AppOutline, 
    CheckCircleOutline,
    RightOutline,
    PhonebookOutline,
    BankcardOutline
} from 'antd-mobile-icons';
import { getUserDetail } from '@/services/api/user';

interface StepStatus {
    // 工作信息是否完成
    workInfo: boolean;
    // 联系人信息是否完成
    contactInfo: boolean;
    // 个人信息是否完成
    personalInfo: boolean;
    // 身份信息是否完成
    identityInfo: boolean;
    // 人脸信息是否完成
    faceInfo: boolean;
    // 银行信息是否完成
    bankInfo: boolean;
}

export default function MyInfo(): ReactElement {
    const navigate = useNavigate();
    // 步骤完成状态
    const [status, setStatus] = useState<StepStatus>({
        workInfo: false,
        contactInfo: false,
        personalInfo: false,
        identityInfo: false,
        faceInfo: false,
        bankInfo: false
    });

    // 银行卡编辑配置
    const [bankConfig, setBankConfig] = useState({
        canEdit: false,
        needVerify: false
    });

    // 获取用户详情及步骤状态
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                Toast.show({
                    icon: 'loading',
                    content: 'Cargando...',
                    duration: 0,
                });
                const res = await getUserDetail();
                Toast.clear();
                if (res) {
                    // 设置银行卡配置
                    if (res.painty) {
                        setBankConfig({
                            canEdit: res.painty.dermoid === 1,
                            needVerify: res.painty.shriek === 1
                        });
                    }

                    // champak === 1 表示全部完成
                    if (res.champak === 1) {
                         setStatus({
                             workInfo: true,
                             contactInfo: true,
                             personalInfo: true,
                             identityInfo: true,
                             faceInfo: true,
                             bankInfo: true
                         });
                    } else if (res.pentoxid) {
                        // pentoxid 包含各步骤状态
                        const newStatus = { ...status };
                        res.pentoxid.forEach((item: any) => {
                            // leonora: 1 表示完成, 0 表示未完成
                            if (item.creditPage in newStatus) {
                                newStatus[item.creditPage as keyof StepStatus] = item.leonora === 1;
                            }
                        });
                        setStatus(newStatus);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user detail", error);
                Toast.clear();
                Toast.show('Error al cargar la información');
            }
        };
        fetchStatus();
    }, []);

    // 页面跳转处理
    const handleNavigate = (path: string, isComplete: boolean) => {
        if (isComplete) return;
        navigate(`${path}?entry=profile`);
    };

    // 渲染列表项
    const renderItem = (
        title: string, 
        icon: ReactElement, 
        isComplete: boolean, 
        path: string,
        description?: string,
        customOnClick?: () => void
    ) => (
        <div 
            onClick={customOnClick ? customOnClick : () => handleNavigate(path, isComplete)}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '12px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: (isComplete && !customOnClick) ? 'default' : 'pointer',
                opacity: (isComplete && !customOnClick) ? 0.8 : 1
            }}
        >
            <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: isComplete ? '#e0f2f1' : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isComplete ? '#00897b' : '#90a4ae',
                marginRight: '16px',
                fontSize: '20px'
            }}>
                {isComplete ? <CheckCircleOutline /> : icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: '#37474f',
                    marginBottom: '4px'
                }}>
                    {title}
                </div>
                <div style={{ 
                    fontSize: '13px', 
                    color: isComplete ? '#00897b' : '#cfd8dc' 
                }}>
                    {isComplete ? 'Completado' : (description || 'Pendiente')}
                </div>
            </div>
            {(!isComplete || customOnClick) && (
                <RightOutline style={{ color: '#cfd8dc', fontSize: '18px' }} />
            )}
        </div>
    );

    // 组合 ID 验证逻辑
    const isIdComplete = status.identityInfo;
    const isFaceComplete = status.faceInfo;
    const isIdVerificationComplete = isIdComplete && isFaceComplete;
    
    // 确定 ID 验证跳转路径
    // 如果 ID 未完成 -> 去 ID
    // 如果 ID 完成但 Face 未完成 -> 去 Face
    const idVerificationPath = !isIdComplete ? '/id' : '/face-capture';

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            <HeaderNav
                title="Mi perfil"
                backDirect={false}
                onBack={() => navigate('/profile')}
            />
            <div style={{ padding: '16px' }}>
                {renderItem(
                    "Información laboral", 
                    <AppOutline />, 
                    status.workInfo, 
                    '/work'
                )}
                
                {renderItem(
                    "Contactos", 
                    <PhonebookOutline />, 
                    status.contactInfo, 
                    '/contacts'
                )}
                
                {renderItem(
                    "Datos personales", 
                    <UserOutline />, 
                    status.personalInfo, 
                    '/personal'
                )}
                
                {renderItem(
                    "Verificación de identidad", 
                    <UserOutline />, // 如果没有特定图标，使用 UserOutline 作为通用 ID 图标
                    isIdVerificationComplete, 
                    idVerificationPath,
                    !isIdComplete ? 'Sube tu ID' : 'Sube tu Selfie'
                )}

                {renderItem(
                    "Cuenta bancaria", 
                    <BankcardOutline />, 
                    status.bankInfo, 
                    '/bank',
                    undefined,
                    () => {
                        // 如果银行卡未完成，直接跳转
                        if (!status.bankInfo) {
                            navigate('/bank?entry=profile');
                            return;
                        }
                        
                        // 如果已完成但不允许修改，则不跳转
                        if (!bankConfig.canEdit) {
                            return;
                        }

                        // 如果需要验证码，跳转验证页面
                        if (bankConfig.needVerify) {
                            navigate('/check-mobile?type=editbank');
                        } else {
                            // 不需要验证码，直接跳转银行卡页面（带上编辑标识，虽然这里entry=profile可能已经够了，
                            // 但为了逻辑清晰，或者后端可能需要区分，保持原样或参考vue逻辑。
                            // vue是 /pages/steps/bank?type=userCenterEdit
                            // 这里我们用 entry=profile 应该能复用逻辑，或者加个参数
                            navigate('/bank?entry=profile&mode=edit');
                        }
                    }
                )}
            </div>
        </div>
    );
}
