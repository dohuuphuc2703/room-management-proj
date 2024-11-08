import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  AppstoreOutlined,
  PieChartOutlined,
  FileTextOutlined,
  DollarOutlined,
  HomeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styles from './SideBar.module.css';

const { SubMenu } = Menu;

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.sidebar} ${collapsed ? styles.close : ''}`}>
        <div className={styles.logoDetails}>
          <AppstoreOutlined />
          <span className={styles.logoName}>Menu</span>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          className={styles.menu}
        >
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            Thống kê
          </Menu.Item>
          <Menu.Item key="2" icon={<HomeOutlined />}>
            Phòng
          </Menu.Item>
          <Menu.Item key="3" icon={<DollarOutlined />}>
            Hóa đơn
          </Menu.Item>
          <Menu.Item key="4" icon={<FileTextOutlined />}>
            Phiếu bảo trì
          </Menu.Item>
          <Menu.Item key="4" icon={<MessageOutlined />}>
            Chat
          </Menu.Item>
        </Menu>
        <button onClick={toggleCollapse} className={styles.collapseButton}>
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      <div className={styles.content}>
        {/* Nội dung khác của ứng dụng sẽ nằm trong ô container này */}
        <h1>Welcome to the Dashboard</h1>
        <p>This is where your main content goes.</p>
      </div>
    </div>
  );
}

export default SideBar;
