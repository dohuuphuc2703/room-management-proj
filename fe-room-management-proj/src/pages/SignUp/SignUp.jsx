import { ConfigProvider, message } from "antd";
import Header from "../../components/Header/Header";
import styles from "./SignUp.module.css";

import axios from "axios";
import { useState } from "react";

import Footer from "../../components/Footer/Footer";
import SignUpForm from "../../components/SignUpForm/SignUpForm";


function SignUp() {
  const [loading, setLoading] = useState(false);
  const [sendMail, setSendMail] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [resend, setResend] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmitSignUpFrm = (values) => {
    setLoading(true);
    axios
      .post(`http://localhost:8000/auth/sign-up`, values)
      .then((res) => {
        setSendMail(values.email);
        setOpenModal(true);
      })
      .catch((err) => {
        messageApi.error(err.response.data.message);
      })
      .finally(() => setLoading(false));
  };

  const handleResendEmail = () => {
    setResend(true);
    axios
      .post(`http://localhost:8000/auth/send-mail`, { email: sendMail })
      .then(() => {
        messageApi.info("Đã gửi lại mail đến email của bạn!");
      })
      .catch((err) => {
        messageApi.error(err.response?.data.message);
      })
      .finally(() => setResend(false));
  };
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
          <div className={styles.signupFormContainer}>
          <SignUpForm
            loading={loading}
            handleSubmitSignUpFrm={handleSubmitSignUpFrm}
            handleResendEmail={handleResendEmail}
            openModal={openModal}
            resend={resend}
          />
          </div>
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

export default SignUp;
