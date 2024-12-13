import {
  CalendarOutlined,
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Layout,
  message,
  Row,
  Select,
  Tabs,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "../../../actions";
import styles from "./AccountLandlord.module.css";

const { Content } = Layout;
const { TabPane } = Tabs;

const AccountLandlord = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null); // State to store avatar URL
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/landlord/info",
          { withCredentials: true }
        );
        const { info } = response.data;
        console.log("info", info);
        setAvatarUrl(info.user.avatar); // Set avatar URL from fetched user info
        form.setFieldsValue({
          email: info.user.email,
          fullName: info.user.fullName ? info.user.fullName : "",
          phone: info.user.phone ? info.user.phone : "",
          dob: info.user.dob ? info.user.dob.slice(0, 10) : "",
          address: info.user.address ? info.user.address : "",
          gender: info.user.gender ? info.user.gender : "",
          bankDetails: {
            bank: info.bankDetails?.bank || null,
            accountNumber: info.bankDetails?.accountNumber || "",
            accountName: info.bankDetails?.accountName || "",
          },
        });
      } catch (error) {
        message.error("Error fetching user info");
      }
    };

    fetchUserInfo();
  }, [form]);

  useEffect(() => {
    console.log("Avatar URL:", avatarUrl); // Kiểm tra URL trong console
  }, [avatarUrl]);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const result = await response.json();
        if (result.code === "00") {
          setBanks(result.data);
        } else {
          console.error("Failed to fetch banks:", result.desc);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Thêm trường avatar vào values
      const updatedValues = {
        ...values,
        avatar: avatarUrl, // Thêm avatarUrl vào values
      };

      const response = await axios.post(
        "http://localhost:8000/api/landlord/info/",
        updatedValues,
        {
          withCredentials: true,
        }
        
      );
      console.log(updatedValues)

      message.success("Thông tin đã được cập nhật thành công");
      dispatch(
        setTenantInfo({
          uid: response.data.info._id,
          ...response.data.info.user,
        })
      );
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async ({ file }) => {
    if (file.status === "uploading") {
      try {
        const formData = new FormData();
        formData.append("avatar", file.originFileObj);
        const response = await axios.post(
          "http://localhost:8000/api/landlord/update-avatar/",
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("Upload response:", response.data);
        setAvatarUrl(response.data.avatar);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        message.error("Error uploading avatar");
      }
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8000/api/landlord/change-password/",
        values,
        {
          withCredentials: true,
        }
      );
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
          <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: "bold" }}>
            <TabPane tab="Chỉnh sửa thông tin cá nhân" key="1">
              <Form
                form={form}
                name="update_info"
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={16}>
                  <Col span={24} style={{ textAlign: "center" }}>
                    <Avatar size={100} src={avatarUrl} />
                    <Form.Item>
                      <Upload
                        name="avatar"
                        showUploadList={false}
                        customRequest={handleAvatarChange}
                        onChange={handleAvatarChange} // Thêm sự kiện này
                      >
                        <Button icon={<UploadOutlined />}>
                          Chọn ảnh đại diện
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true }]}
                    >
                      <Input disabled prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập họ và tên của bạn!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập họ và tên của bạn"
                        prefix={<UserOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại của bạn!",
                        },
                        {
                          pattern: /^[0-9]{10}$/,
                          message:
                            "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập số điện thoại của bạn"
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Địa chỉ"
                      name="address"
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập địa chỉ của bạn!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập địa chỉ chi tiết của bạn"
                        prefix={<HomeOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Sinh nhật"
                      name="dob"
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập ngày sinh của bạn!",
                        },
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

                  <Col span={12}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn giới tính của bạn!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn giới tính">
                        <Select.Option value="male">Nam</Select.Option>
                        <Select.Option value="female">Nữ</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  {/* Ngân hàng */}
                  <Col span={8}>
                    <Form.Item
                      label="Ngân hàng"
                      name={["bankDetails", "bank"]}
                      rules={[
                        { required: true, message: "Vui lòng chọn ngân hàng!" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn ngân hàng"
                        loading={loading}
                        showSearch
                        filterOption={(input, option) =>
                          option?.label
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={banks.map((bank) => ({
                          value: bank.bin,
                          label: (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <img
                                src={bank.logo}
                                alt={bank.name}
                                style={{ width: 20, marginRight: 8 }}
                              />
                              ({bank.bin}) {bank.shortName}
                            </div>
                          ),
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  {/* Số tài khoản */}
                  <Col span={8}>
                    <Form.Item
                      label="Số tài khoản"
                      name={["bankDetails", "accountNumber"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số tài khoản!",
                        },
                        {
                          pattern: /^\d+$/,
                          message: "Số tài khoản chỉ bao gồm số!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập số tài khoản" maxLength={20} />
                    </Form.Item>
                  </Col>

                  {/* Tên tài khoản */}
                  <Col span={8}>
                    <Form.Item
                      label="Tên tài khoản"
                      name={["bankDetails", "accountName"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên tài khoản!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên tài khoản" maxLength={50} />
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
              <ChangePasswordForm
                onFinish={handleChangePassword}
                loading={loading}
              />
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
    <Form
      form={form}
      name="change_password"
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        label="Mật khẩu cũ"
        name="oldPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
      >
        <Input.Password
          placeholder="Nhập mật khẩu cũ"
          prefix={<LockOutlined />}
        />
      </Form.Item>
      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
      >
        <Input.Password
          placeholder="Nhập mật khẩu mới"
          prefix={<LockOutlined />}
        />
      </Form.Item>
      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder="Xác nhận mật khẩu mới"
          prefix={<LockOutlined />}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AccountLandlord;
