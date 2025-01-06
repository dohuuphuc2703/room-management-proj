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
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../actions";
import styles from "./Header.module.css";

function Header({ socket }) {
  const user = useSelector((state) => state.userReducer);
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1); // Quản lý trang
  const [loading, setLoading] = useState(false); // Để quản lý trạng thái đang tải
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket && user?._id) {
      // Subscribe vào phòng của user
      socket.emit("subscribe", user._id);

      // Nhận thông báo từ server
      socket.on("receive_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prevCount) => prevCount + 1);
        message.info("Bạn có một thông báo mới.");
      });

      socket.emit("get_notifications", user._id, 1, (data) => {
        setNotifications(data); // Cập nhật thông báo mới nhất
        const unread = data.filter((notif) => !notif.isRead).length;
        setUnreadCount(unread); // Cập nhật số lượng thông báo chưa đọc
        setPage(2); // Cập nhật thứ tự trang sau khi tải xong trang thông báo đầu tiên
      });

      // Cleanup khi component bị unmount
      return () => {
        socket.emit("unsubscribe", user._id);
        socket.off("receive_notification");
      };
    }
  }, [socket, user]);

  // Tải thêm thông báo cũ hơn
  const loadMoreNotifications = () => {
    if (loading) return;
    setLoading(true);

    socket.emit("get_notifications", user._id, page, (data) => {
      if (data.length === 0) {
        message.info("Không còn thông báo cũ.");
      } else {
        setNotifications((prev) => [...prev, ...data]); // Thêm thông báo mới vào danh sách
        setUnreadCount((prevCount) => {
          const unread = data.filter((notif) => !notif.isRead).length;
          return prevCount + unread;
        });
        setPage((prevPage) => prevPage + 1); // Tăng trang khi tải thêm
      }
      setLoading(false);
    });
  };

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

  const handleNotificationClick = (notification) => {
    // Cập nhật trạng thái đọc trên giao diện
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notification._id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
    setVisible(false);
    // Gửi yêu cầu cập nhật trạng thái đọc qua socket
    socket.emit("mark_as_read", {
      userId: user._id,
      notificationId: notification._id,
    });

    if (notification.type === "contract") {
      window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
    } else if (notification.type === "invoice") {
      navigate("/my-room");
    }
  };

  // Kiểm soát khi menu thông báo mở/đóng
  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="0" icon={<UserOutlined />}>
        {user?.fullName}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="1"
        icon={<SettingOutlined />}
        onClick={() => navigate("/account")}
      >
        Quản lý tài khoản
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<HomeOutlined />}
        onClick={() => navigate("/my-room")}
      >
        Phòng trọ của tôi
      </Menu.Item>
      <Menu.Item
        key="3"
        icon={<HeartOutlined />}
        onClick={() => navigate("/saved-rooms")}
      >
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
      <Menu.Item key="/">Trang chủ</Menu.Item>
      <Menu.Item key="/my-room">Phòng trọ của tôi</Menu.Item>
      <Menu.Item key="/saved-rooms">Phòng đã lưu</Menu.Item>
    </Menu>
  );

  // Menu thông báo
  // Menu thông báo
  const notificationMenu = (
    <Menu className={styles.notificationMenu}>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Menu.Item
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
          >
            {notification.isRead ? (
              notification.message
            ) : (
              <strong>{notification.message}</strong>
            )}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled>Không có thông báo nào</Menu.Item>
      )}
      <Menu.Item>
        <Button type="link" onClick={loadMoreNotifications} loading={loading}>
          Xem thông báo cũ hơn
        </Button>
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
          <div className={styles.navMenu}>{navMenu}</div>
          <div className={styles.actions}>
            {user && user.fullName ? (
              <div className={styles.userInfo}>
                <Badge
                  count={unreadCount}
                  offset={[10, 0]}
                  style={{ marginRight: "20px" }}
                >
                  <Dropdown
                    overlay={notificationMenu}
                    trigger={["click"]}
                    visible={visible} // Đảm bảo trạng thái mở/đóng của menu được kiểm soát
                    onVisibleChange={handleVisibleChange} // Sử dụng để kiểm soát khi menu thay đổi trạng thái
                  >
                    <BellOutlined
                      className={styles.icon}
                      style={{
                        fontSize: "18px",
                        marginRight: "20px",
                        cursor: "pointer",
                      }}
                    />
                  </Dropdown>
                </Badge>
                <Badge style={{ marginRight: "20px" }}>
                  <MessageOutlined
                    className={styles.icon}
                    style={{
                      fontSize: "18px",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
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
                    backgroundColor: hoverRegister
                      ? "rgb(230, 228, 228)"
                      : "white",
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
