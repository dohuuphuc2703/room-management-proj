import { ConfigProvider, message } from "antd";
import Header from "../../components/Header/Header";
import styles from "./Login.module.css";

import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { login } from "../../actions";
import Footer from "../../components/Footer/Footer";
import LoginForm from "../../components/Login/LoginForm";

import { Outlet } from "react-router-dom";

function Login() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmitLoginFrm = (values) => {
    setLoading(true);
    axios.post("http://localhost:8000/auth/login", values, {
      withCredentials: true,
    })
      .then(res => {
        console.log(res.data);
        dispatch(login(res.data));
        messageApi.success("Đăng nhập thành công", 1).then(() => {
          switch (res.data.role) {
            case "admin":
              nav("/admin/dashboard");
              break;
            case "landlord":
              nav("/landlord/statistical");
              break;
            default:
              nav("/");
          }
        });
      })
      .catch(err => {
        console.error(err.response?.data);
        console.log(err)
        messageApi.error(`Đăng nhập thất bại. ${err.response?.data.message || ""}`, 10);
      })
      .finally(() => setLoading(false))
  }
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
      {contextHolder}
      <div>
        <Header />
        <div className={styles.content}>
          <Outlet />
          <LoginForm 
            loading={loading}
            handleSubmitLoginFrm={handleSubmitLoginFrm}
          />
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