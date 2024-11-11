import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  MessageOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SideBar.module.css';

const { SubMenu } = Menu;

function SideBar({user}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.close : ""}`}>
      <div className={styles.logoDetails}>
        {!collapsed && (
          <>
            <AppstoreOutlined />
            <span className={styles.logoName}>{user?.fullName}</span>
          </>
        )}
      </div>
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        className={styles.menu}
      >
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          <Link to="/landlord/statistical">Thống kê</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<HomeOutlined />}>
          <Link to="/landlord/rooms">Phòng</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<DollarOutlined />}>
          Hóa đơn
        </Menu.Item>
        <Menu.Item key="4" icon={<FileTextOutlined />}>
          Phiếu bảo trì
        </Menu.Item>
        <Menu.Item key="5" icon={<MessageOutlined />}>
          Chat
        </Menu.Item>
      </Menu>
      <Button
        type="primary"
        icon={collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        onClick={toggleCollapse}
        className={styles.ocButton}
      ></Button>
    </div>
  );
}

export default SideBar;
