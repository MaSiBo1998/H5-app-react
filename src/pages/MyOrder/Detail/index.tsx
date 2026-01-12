import HeaderNav from "@/components/common/HeaderNav";
import { Toast, SpinLoading } from "antd-mobile";
import { useEffect, useState, type ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyOrderDetail } from '@/services/api/myOrder';
import { addDayToDateStr } from '@/utils/date';
import styles from './Detail.module.css';

export default function OrderDetail(): ReactElement {
  const location = useLocation();
  const state = location.state || {};
  const { appName = '', loanNumber = '' } = state;
  
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    fetchData();
  }, [appName, loanNumber]);

  const fetchData = async () => {
    if (!appName || !loanNumber) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getMyOrderDetail({ 
        lima: appName, 
        gain: loanNumber 
      });
      setData(res || {});
    } catch (error) {
      console.error(error);
      Toast.show('Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <SpinLoading color='primary' />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles['header-bg']} />
      
      <HeaderNav 
        title="Detalle" 
        onBack={goBack} 
        background="transparent" 
        color="#ffffff" 
      />
      
      <div className={styles['content-wrapper']}>
        {/* 遍历 stellar 数组渲染每个子订单/分期详情 */}
        {data.stellar && data.stellar.map((item: any, index: number) => {
          // leonora: 1:error 100:放款中 200:放款失败 300:还款期 400:已结清
          const isRepayment = item.leonora === 300 && item.crinum === 0;
          const isOverdue = item.leonora === 300 && item.crinum > 0;
          const isSettled = item.leonora === 400;

          return (
            <div className={styles['nav-card']} key={index}>
              {/* 状态部分 */}
              <div className={styles['nav-card-title']}>
                <div className={styles['title-text']}>Situación actual</div>
                {item.galabia === 1 && (
                  <div className={styles['over-info']}>
                    Por favor, reembolse lo antes posible
                  </div>
                )}
              </div>
              
              <div className={styles['nav-card-date']}>
                {isRepayment && (
                  <div className={styles['padding-color']}>Reembolso</div>
                )}
                {isOverdue && (
                  <div className={styles['over-color']}>Atrasado {item.crinum} días</div>
                )}
                {isSettled && (
                  <div className={styles['history-color']}>liquidación</div>
                )}
                <div className={styles['history-color']}>{addDayToDateStr(item.movies)}</div>
              </div>

              {isRepayment && (
                <div className={styles['tips-info']}>
                  Cuenta atrás {item.zoogamy} días
                </div>
              )}
              {isOverdue && (
                <div className={`${styles['tips-info']} ${styles['over-color']}`}>
                  Cuenta atrás {item.crinum} días
                </div>
              )}

              {/* 费用详情部分 */}
              <div className={styles['section-title']}>Tasas de servicio</div>
              
              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Productos de préstamo</div>
                <div className={styles['item-right']}>{appName}</div>
              </div>
              
              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Fecha del préstamo</div>
                <div className={styles['item-right']}>{data.alderfly}</div>
              </div>
              
              <div className={styles['card-item']}>
                <div className={styles['item-left']}>El monto del préstamo</div>
                <div className={styles['item-right']}>{item.laterite} pesos</div>
              </div>
              
              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Plazo del reembolso</div>
                <div className={styles['item-right']}>{item.fistic} días</div>
              </div>

              {item.exigence != 0 && (
                <div className={styles['card-item']}>
                  <div className={`${styles['item-left']} ${styles['over-color']}`}>Multa vencida</div>
                  <div className={`${styles['item-right']} ${styles['over-color']}`}>{item.exigence} pesos</div>
                </div>
              )}

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Interés</div>
                <div className={styles['item-right']}>{item.masseuse} pesos</div>
              </div>

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>IVA</div>
                <div className={styles['item-right']}>{item.encash} pesos</div>
              </div>

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Tarifa de servicio</div>
                <div className={styles['item-right']}>{item.larder} pesos</div>
              </div>

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Cantidades pagaderas</div>
                <div className={styles['item-right']}>{item.cypher} pesos</div>
              </div>

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Cantidad pagada</div>
                <div className={styles['item-right']}>{item.gneissic} pesos</div>
              </div>

              <div className={styles['card-item']}>
                <div className={styles['item-left']}>Número del contrato</div>
                <div className={styles['item-right']}>{data.gain}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
