import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PieChartOutlined,
  PoweroffOutlined,
  SettingOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Menu, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../../actions";
import styles from "./SideBar.module.css";

function SideBar({ admin }) {
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
    <div className={`${styles.sidebar} ${collapsed ? styles.close : ""}`}>
      <div className={styles.logoDetails}>
        <AppstoreOutlined />
  
        {!collapsed && (
          <div>
            <span className={styles.logoName}>{admin?.fullName} Admin</span>
            <PoweroffOutlined onClick={handleLogout} />
          </div>
        )}
      </div>
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        className={styles.menu}
      >
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          <Link to="/admin/statistical">Thống kê</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<TeamOutlined />}>
          <Link to="/admin/tenant-manage">Người dùng</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<TeamOutlined />}>
          <Link to="/admin/landlord-manage">Chủ trọ</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SettingOutlined />}>
          <Link to="/admin/category-manage">Category</Link>
        </Menu.Item>
      </Menu>
      <button onClick={toggleCollapse} className={styles.collapseButton}>
        {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
      </button>
    </div>
  );
}

export default SideBar;
