import { CalendarOutlined, HomeOutlined, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, message, Row, Tabs } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./AccountManagement.module.css";

const { Content } = Layout;
const { TabPane } = Tabs;

const AccountManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/tenant/info/",
          { withCredentials: true }
        );
        const { info } = response.data;
        form.setFieldsValue({
          email: info.user.email,
          fullName: info.user.fullName,
          phone: info.user.phone,
          dob: info.user.dob.slice(0, 10),
          address: info.user.address,
        });
      } catch (error) {
        message.error("Error fetching user info");
      }
    };

    fetchUserInfo();
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/tenant/info/", values, {
        withCredentials: true,
      });
      message.success("Thông tin đã được cập nhật thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/tenant/change-password/", values, {
        withCredentials: true,
      });
      message.success("Mật khẩu đã được thay đổi thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi thay đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <div>
          <h2>Quản lý tài khoản</h2>
          <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: 'bold' }}>
            <TabPane tab="Chỉnh sửa thông tin cá nhân" key="1">
              <Form form={form} name="update_info" layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true }]}
                    >
                      <Input disabled prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên của bạn!" }]}
                    >
                      <Input placeholder="Nhập họ và tên của bạn" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại của bạn!" },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập số điện thoại của bạn" prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Địa chỉ"
                      name="address"
                      rules={[{ required: false, message: "Vui lòng nhập địa chỉ của bạn!" }]}
                    >
                      <Input placeholder="Nhập địa chỉ chi tiết của bạn" prefix={<HomeOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Sinh nhật"
                      name="dob"
                      rules={[
                        { required: false, message: "Vui lòng nhập ngày sinh của bạn!" },
                        {
                          pattern: /^\d{4}-\d{2}-\d{2}$/,
                          message: "Vui lòng nhập đúng định dạng yyyy-mm-dd!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập đúng định dạng yyyy-mm-dd"
                        maxLength={10}
                        prefix={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Thay đổi mật khẩu" key="2">
              <ChangePasswordForm onFinish={handleChangePassword} loading={loading} />
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

const ChangePasswordForm = ({ onFinish, loading }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} name="change_password" layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mật khẩu cũ"
        name="oldPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
      >
        <Input.Password placeholder="Nhập mật khẩu cũ" prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
      >
        <Input.Password placeholder="Nhập mật khẩu mới" prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Xác nhận mật khẩu mới" prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AccountManagement;
