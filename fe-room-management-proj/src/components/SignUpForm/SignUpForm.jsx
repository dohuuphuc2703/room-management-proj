import { Button, Checkbox, Form, Input, Modal, Radio } from "antd";
import React, { useState } from "react";
import { BsShieldFillCheck, BsShieldLockFill } from "react-icons/bs";
import { FaPhone, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import styles from "./SignUpForm.module.css";

import { useNavigate } from "react-router-dom";

const SignUpForm = ({
  handleSubmitSignUpFrm,
  handleResendEmail,
  loading,
  openModal,
  resend,
  sendMail
}) => {
  const [role, setRole] = useState("NGƯỜI DÙNG");
  const [confirmPolicy, setConfirmPolicy] = useState(false);

  const nav = useNavigate();

  const validateRetypePassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (value) {
        if (getFieldValue("password") === value) return Promise.resolve();
        else
          return Promise.reject(
            new Error("Mật khẩu nhập lại không khớp với mật khẩu đã nhập")
          );
      }

      return Promise.resolve();
    },
  });

  return (
    <div className={styles.signUp}>
      <Form
        layout="vertical"
        onFinish={handleSubmitSignUpFrm}
        className={styles.signUpForm}
      >
        <h2 className={styles.title}>Tạo tài khoản mới</h2>

        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ tên của bạn" }]}
        >
          <Input
            size="large"
            placeholder="Họ và tên"
            className={styles.field}
            addonBefore={<FaUser className={styles.icon} />}
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại của bạn" }]}
        >
          <Input
            size="large"
            placeholder="Số điện thoại"
            className={styles.field}
            addonBefore={<FaPhone className={styles.icon} />}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ email của bạn" },
            { type: "email", message: "Email bạn nhập không hợp lệ" },
          ]}
        >
          <Input
            size="large"
            placeholder="Email"
            className={styles.field}
            addonBefore={<MdEmail className={styles.icon} />}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu của bạn" },
            {
              min: 6,
              max: 25,
              message: "Mật khẩu phải chứa từ 6 đến 25 ký tự",
            },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*?&].{6,25}$/,
              message:
                "Mật khẩu phải bao gồm ít nhất 1 chữ hoa, chữ thường, ký tự số và ký tự đặc biệt",
            },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Mật khẩu ( từ 6 đến 25 ký tự )"
            className={styles.field}
            addonBefore={<BsShieldLockFill className={styles.icon} />}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm-password"
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận lại mật khẩu của bạn",
            },
            validateRetypePassword,
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Xác nhận mật khẩu"
            className={styles.field}
            addonBefore={<BsShieldFillCheck className={styles.icon} />}
          />
        </Form.Item>

        <Form.Item label="Loại Tài Khoản" name="role">
          <Radio.Group
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className={styles.roleContainer}
          >
            <Radio value="tenant">NGƯỜI DÙNG</Radio>
            <Radio value="landlord">CHỦ PHÒNG</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={confirmPolicy}
            onChange={() => setConfirmPolicy(!confirmPolicy)}
          >
            Tôi đã đọc và đồng ý với
            <a href="/terms-of-service"> Điều khoản dịch vụ</a> và
            <a href="/privacy-policy"> Chính sách bảo mật</a>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            block
            size="large"
            disabled={!confirmPolicy}
            htmlType="submit"
            loading={loading}
            className={styles.submitButton}
          >
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title={
          <div className={styles.center}>
            <img
              src="/email.png"
              alt="Email Logo"
              className={styles.emailImg}
            />
            <h3 className={styles.center}>Vui lòng xác minh email của bạn</h3>
          </div>
        }
        open={openModal}
        closable={false}
        cancelButtonProps={{ hidden: true }}
        centered
        footer={
          <div className={styles.center}>
            <Button
              className={styles.btnResend}
              onClick={handleResendEmail}
              loading={resend}
            >
              Gửi lại
            </Button>
            <Button className={styles.btnResend} onClick={() => nav("/login")}>
              Đăng nhập
            </Button>
          </div>
        }
      >
        <div className={styles.center}>
          <p>
            Chúng tôi đã gửi một email đến địa chỉ <strong>{sendMail}</strong>.
            <br /> Click vào liên kết trong email để xác minh tài khoản của bạn.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SignUpForm;
