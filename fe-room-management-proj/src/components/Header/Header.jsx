import {
  BellOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Layout, Menu, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../actions";
import styles from "./Header.module.css";

function Header() {
  const user = useSelector(state => state.userReducer)
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleRegisterClick = () => {
    navigate("/sign-up");
  };
  const handleNavigateToChat = () => {
    navigate("/chat");
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
      message.error("Có lỗi xảy ra khi đăng xuất");
    }
  };
  const userMenu = (
    <Menu>
      <Menu.Item key="0" icon={<UserOutlined />}>
        {user?.fullName}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => navigate("/account")}>
        Quản lý tài khoản
      </Menu.Item>
      <Menu.Item key="2" icon={<HomeOutlined />} onClick={() => navigate("/my-room")}>
        Phòng trọ của tôi
      </Menu.Item>
      <Menu.Item key="3" icon={<HeartOutlined />} onClick={() => navigate("/saved-rooms")}>
        Yêu thích
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item> 
    </Menu>
  );

  const navMenu = (
    <Menu
      mode="horizontal"
      className={styles.navMenu}
      defaultSelectedKeys={["/"]}
      onClick={({ key }) => navigate(key)}
    >
      <Menu.Item key="/">
        Trang chủ
      </Menu.Item>
      <Menu.Item key="/my-room">
        Phòng trọ của tôi
      </Menu.Item>
      <Menu.Item key="/saved-rooms">
        Phòng đã lưu
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Layout>
        <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate("/")}>
              <img src="/logo.png" alt="logo" />
            </div>
            <div className={styles.navMenu}>  {/* Đặt navMenu ở đây */}
              {navMenu}
            </div>
            <div className={styles.actions}>
              {user && user.fullName ? (
                <div className={styles.userInfo}>
                  <Badge /*count={5} offset={[10, 0]}*/ style={{ marginRight: "20px" }}>
                    <BellOutlined
                      className={styles.icon}
                      style={{ fontSize: "18px", marginRight: "20px", cursor: "pointer" }}
                    />
                  </Badge>
                  <Badge /*count={3} offset={[10, 0]}*/ style={{ marginRight: "20px" }}>
                    <MessageOutlined
                      className={styles.icon}
                      style={{ fontSize: "18px", marginRight: "20px", cursor: "pointer" }}
                      onClick={handleNavigateToChat}
                    />
                  </Badge>
                  <Dropdown overlay={userMenu} trigger={["click"]}>
                    <Avatar
                      style={{ cursor: "pointer", backgroundColor: "#87d068" }}
                      src={user.avatar}
                    />
                  </Dropdown>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleLoginClick}
                    className={styles.login_button}
                    style={{
                      backgroundColor: hoverLogin ? "#0fc862" : "#00b14f",
                      color: "white",
                      border: "none",
                    }}
                    onMouseEnter={() => setHoverLogin(true)}
                    onMouseLeave={() => setHoverLogin(false)}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={handleRegisterClick}
                    className={styles.register_button}
                    style={{
                      backgroundColor: hoverRegister ? "rgb(230, 228, 228)" : "white",
                      border: "1px solid #00b14f",
                      color: hoverRegister ? "#0fc862" : "#00b14f",
                    }}
                    onMouseEnter={() => setHoverRegister(true)}
                    onMouseLeave={() => setHoverRegister(false)}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
        </div>
      </Layout>
    </div>
  );
  
}

export default Header;
