import { useNavigate, useParams } from "react-router-dom";

import { Button, Col, Form, Input, message, Modal, Row } from "antd";

import styles from "./VerifyEmail.module.css";
import { FaCheckCircle } from "react-icons/fa";
import { VscError } from "react-icons/vsc";
import { useState } from "react";
import { MdEmail } from "react-icons/md";
import axios from "axios";

function VerifyEmail() {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { status } = useParams();
  const nav = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const handleResendEmail = (email) => {
    setLoading(true);
    axios.post(`http://localhost:8000/auth/send-mail`, email)
      .then(res => {
        messageApi.info("Đã gửi lại mail đến email của bạn!");
      })
      .catch(err => {
        console.error(err);
        messageApi.error(err.response.data.message);
      })
      .finally(() => setLoading(false))
  }

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" className={styles.verifyEmail}>
        <Col>
          <div className={status === "success" ? styles.iconSuccess : styles.iconError}>
            {status === "success" ? <FaCheckCircle /> : <VscError />}
          </div>
          <div className={styles.content}>
            <h2 className={styles.status}>{status === "success" ? "Đã xác minh!" : "Có lỗi xảy ra!"}</h2>
            {status === "success" ? <p>Xác thực tài khoản thành công.</p> : <p>Xác thực tài khoản không thành công. <br />
              Vui lòng xác minh lại hoặc liên lạc với hỗ trợ kỹ thuật của chúng tôi.</p>}
            <Button className={styles.btnAction}
              onClick={() => {
                if (status === "success")
                  nav("/login");
                else
                  setOpenModal(true);
              }}
            >
              {status === "success" ? "Đăng nhập" : "Xác minh lại"}
            </Button>
          </div>
        </Col>
      </Row>
      <Modal
        title={<h3 className={styles.center}>Nhập địa chỉ email</h3>}
        open={openModal}
        closable
        cancelButtonProps={{ hidden: true }}
        onCancel={() => setOpenModal(false)}
        centered
        footer={[]}
      >
        <Form
          layout="vertical"
          onFinish={handleResendEmail}
        >
          <Form.Item
            label={<span className={styles.lbLoginFrm}>Email</span>}
            name="email"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập địa chỉ email của bạn',
              },
              {
                type: 'email',
                message: 'Email bạn nhập không hợp lệ',
              }
            ]}
          >
            <Input size="large" placeholder="Email" className={styles.field} type="email"
            addonBefore={<span className={styles.icon}><MdEmail /></span>} />
          </Form.Item>

          <Form.Item>
          <Button
            type="primary"
            block size="large"
            htmlType="submit" loading={loading}
            className={styles.btnLogin}
          >
            Gửi lại
          </Button>
        </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default VerifyEmail;