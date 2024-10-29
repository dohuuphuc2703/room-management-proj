import { Button, Layout } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";


function Header() {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div>
      <Layout>
        <div className={styles.header}>
          <div className={styles.header_top}>
            <div className={styles.logo} onClick={() => navigate("/")}>
              <img src="/logo192.png" alt="logo" />
              <span>Kênh thông tin phòng trọ số 1 Việt Nam</span>
            </div>
            <div className={styles.actions}>
              <span className={styles.heart}>❤️ Yêu thích</span>
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
              <Button className={styles.post_button}>Đăng tin miễn phí +</Button>
            </div>
          </div>
          <nav className={styles.nav}>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/cho-thue-phong-tro">Cho thuê phòng trọ</a></li>
              <li><a href="/nha-cho-thue">Nhà cho thuê</a></li>
              <li><a href="/cho-thue-can-ho">Cho thuê căn hộ</a></li>
              <li><a href="/cho-thue-mat-bang">Cho thuê Mặt bằng</a></li>
              <li><a href="/tim-nguoi-o-ghep">Tìm người ở ghép</a></li>
              <li><a href="/tin-tuc">Tin tức</a></li>
              <li><a href="/bang-gia-dich-vu">Bảng giá dịch vụ</a></li>
            </ul>
          </nav>
        </div>
      </Layout>
    </div>
  );
}

export default Header;
