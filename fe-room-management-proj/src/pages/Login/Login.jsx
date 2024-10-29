import Header from "../../components/Header/Header";
import styles from "./Login.module.css";
import { ConfigProvider } from "antd";

import Footer from "../../components/Footer/Footer";
import LoginForm from "../../components/Login/LoginForm";

import { Outlet } from "react-router-dom";

function Login() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultHoverBg: "blue",
          },
          Select: {
            defaultActiveBg: "blue",
          },
        },
      }}
    >
      <div>
        <Header />
        <div className={styles.content}>
          <Outlet />
          <LoginForm />
        </div>
        <div
          className={styles.footer_main}
          style={{
            width: "1150px",
            // height: "170px",
            margin: "0 auto",
          }}
        >
          <Footer />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Login;