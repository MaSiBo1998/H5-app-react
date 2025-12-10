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
    workInfo: boolean;
    contactInfo: boolean;
    personalInfo: boolean;
    identityInfo: boolean;
    faceInfo: boolean;
    bankInfo: boolean;
}

export default function MyInfo(): ReactElement {
    const navigate = useNavigate();
    const [status, setStatus] = useState<StepStatus>({
        workInfo: false,
        contactInfo: false,
        personalInfo: false,
        identityInfo: false,
        faceInfo: false,
        bankInfo: false
    });

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
                        const newStatus = { ...status };
                        res.pentoxid.forEach((item: any) => {
                            // leonora: 1 means complete, 0 means incomplete
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

    const handleNavigate = (path: string, isComplete: boolean) => {
        if (isComplete) return;
        navigate(`${path}?entry=profile`);
    };

    const renderItem = (
        title: string, 
        icon: ReactElement, 
        isComplete: boolean, 
        path: string,
        description?: string
    ) => (
        <div 
            onClick={() => handleNavigate(path, isComplete)}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '12px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: isComplete ? 'default' : 'pointer',
                opacity: isComplete ? 0.8 : 1
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
            {!isComplete && (
                <RightOutline style={{ color: '#cfd8dc', fontSize: '18px' }} />
            )}
        </div>
    );

    // Combined ID verification logic
    const isIdComplete = status.identityInfo;
    const isFaceComplete = status.faceInfo;
    const isIdVerificationComplete = isIdComplete && isFaceComplete;
    
    // Determine which path to go for ID verification
    // If ID is incomplete -> go to ID
    // If ID is complete but Face is incomplete -> go to Face
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
                    <UserOutline />, // Using UserOutline as generic ID icon if specific one not available
                    isIdVerificationComplete, 
                    idVerificationPath,
                    !isIdComplete ? 'Sube tu ID' : 'Sube tu Selfie'
                )}

                {renderItem(
                    "Cuenta bancaria", 
                    <BankcardOutline />, 
                    status.bankInfo, 
                    '/bank'
                )}
            </div>
        </div>
    );
}