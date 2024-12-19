import { useNavigate } from "react-router-dom";

import { Button, Col, message, Row } from "antd";

import { FaCheckCircle } from "react-icons/fa";
import styles from "./VerifyContract.module.css";

function VerifyContractEmail() {
  const nav = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" className={styles.verifyEmail}>
        <Col>
          <div className={styles.iconSuccess}>
            <FaCheckCircle />
          </div>
          <div className={styles.content}>
            <h2 className={styles.status}>Đã xác nhận!</h2>
            <p>Xác nhận hợp đồng thành công.</p>
            <Button className={styles.btnAction}
              onClick={() => {
                  nav("/");
              }}
            >
              Về trang chủ
            </Button>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default VerifyContractEmail;