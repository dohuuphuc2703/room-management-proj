import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  MessageOutlined,
  PieChartOutlined,
  PoweroffOutlined
} from '@ant-design/icons';
import { Menu, message } from 'antd';
import axios from "axios";
import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { logout } from "../../../actions";
import styles from './SideBar.module.css';

const { SubMenu } = Menu;

function SideBar({user}) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/auth/logout", {
        withCredentials: true,
      });
      message.success("Đăng xuất thành công");
      dispatch(logout());
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      message.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
      <div className={`${styles.sidebar} ${collapsed ? styles.close : ''}`}>
        <div className={styles.logoDetails}>
          <AppstoreOutlined />
          {!collapsed && 
          <div>
            <span className={styles.logoName}>
              {user?.fullName}
            </span>
            <PoweroffOutlined onClick={handleLogout} />
          </div>
          }
        </div>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          defaultSelectedKeys={['1']} 
          className={styles.menu}
        >
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Link to="/landlord/statistical">Thống kê</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<HomeOutlined />}>
            <Link to="/landlord/rooms">Phòng</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<DollarOutlined />}>
          <Link to="/landlord/contract">Hợp đồng</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<DollarOutlined />}>
          <Link to="/landlord/invoice">Hóa đơn</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<FileTextOutlined />}>
          <Link to="/landlord/account">Account</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<MessageOutlined />}>
          <Link to="/landlord/chat">Nhắn tin</Link>
          </Menu.Item>
        </Menu>
        <button onClick={toggleCollapse} className={styles.collapseButton}>
          {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        </button>

      </div>
  );
}

export default SideBar;
