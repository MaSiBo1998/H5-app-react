import HeaderNav from "@/components/common/HeaderNav";
import { Tabs, Toast } from "antd-mobile";
import { FileOutline } from "antd-mobile-icons";
import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrderList } from '@/services/api/myOrder';
import styles from './MyOrder.module.css';

export default function MyOrder(): ReactElement {
  const navigate = useNavigate();
  // 激活index
  const [activeKey, setActiveKey] = useState<string>('padding');
  // 订单列表
  const [orderList, setOrderList] = useState<any[]>([]);
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // 返回个人中心
  const goBack = () => {
    navigate('/profile');
  };

  const tabList: { title: string, key: string }[] = [
    { title: 'Orden actual', key: 'padding' },
    { title: 'Pedidos históricos', key: 'already' }
  ];

  useEffect(() => {
    getOrderList(activeKey);
  }, []);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    getOrderList(key);
  };

  const getOrderList = async (type: string) => {
    setLoading(true);
    setOrderList([]); // Clear list while loading
    try {
      const res = await getMyOrderList({ gamin: type === 'padding' ? 1 : 2 }) as any;
      const list = Array.isArray(res) ? res : [];
      setOrderList(list);
    } catch (error) {
      console.error(error);
      Toast.show('Error al cargar la lista de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const toLoanPage = (item: any) => {
    navigate(`/my-order/detail`,{state:{appName: item.lima, loanNumber:item.gain}});
  };

  const toHome = () => {
    navigate('/');
  };

  const renderList = () => {
    if (orderList.length === 0 && !loading) {
      return (
        <div className={styles['no-data']}>
          <FileOutline className={styles['no-data-icon']} />
          <div className={styles['no-data-text']}>
            No hay pedidos
          </div>
          <button className={styles['apply-btn']} onClick={toHome}>
            APLICAR YA
          </button>
        </div>
      );
    }

    return (
      <div className={styles['list-container']}>
        {orderList.map((item: any, index: number) => {
          const isOverdue = item.galabia === 1; // 1: 逾期
          const statusText = isOverdue ? "Atrasado" : (activeKey === 'already' ? "Liquidación" : "Reembolso");
          
          return (
            <div 
              key={index} 
              className={styles['card-item']}
              onClick={() => toLoanPage(item)}
            >
              <div className={styles['card-top']}>
                <div className={styles['top-left']}>
                  <img src={item.gridding} alt="" className={styles['app-icon']} />
                  <span>{item.lima}</span>
                </div>
                <div className={`${styles['top-right']} ${isOverdue ? styles['over-color'] : styles['green-color']}`}>
                  {statusText}
                </div>
              </div>

              <div className={styles['info-box']}>
                <div className={styles['info-item']}>
                  <span>El monto del préstamo</span>
                  <span className={styles['bold-title']}>${item.laterite}</span>
                </div>
                <div className={styles['info-item']}>
                  <span>Fecha de solicitud</span>
                  <span>{item.alderfly}</span>
                </div>
                {/* 
                  Vue 代码中显示了更多信息吗？
                  列表通常只显示关键信息。
                  Vue代码参考:
                  <view class="row">
                    <view class="label">El monto del préstamo</view>
                    <view class="value">${item.laterite}</view>
                  </view>
                  <view class="row">
                    <view class="label">Fecha de solicitud</view>
                    <view class="value">{{item.alderfly}}</view>
                  </view>
                */}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 头部背景渐变 */}
      <div className={styles['header-bg']} />

      <HeaderNav 
        title="Mi Pedido" 
        onBack={goBack} 
        background="transparent"
        color="#ffffff"
      />
      
      <div className={styles['content-wrapper']}>
        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          className={styles.tabs}
        >
          {tabList.map(item => (
            <Tabs.Tab title={item.title} key={item.key} />
          ))}
        </Tabs>
        
        {renderList()}
      </div>
    </div>
  );
}
