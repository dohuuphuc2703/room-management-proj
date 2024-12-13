import {
    AreaChartOutlined,
    CalendarOutlined,
    DollarOutlined,
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Button,
    Col,
    Form,
    Input,
    Layout,
    message,
    Row,
    Select,
    Table,
    Tabs,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateContract.module.css";

const { Content } = Layout;
const { TabPane } = Tabs;

const CreateContract = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]); // Danh sách phòng
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);

  const nav = useNavigate();

  // Hàm để load thông tin phòng từ API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/landlord/rooms",
          {
            withCredentials: true,
          }
        ); // Thay URL bằng API lấy phòng
        if (response.data) {
          setRooms(response.data.rooms); // Cập nhật danh sách phòng
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        message.error("Không thể tải danh sách phòng.");
      }
    };
    fetchRooms();
  }, []);

  // Hàm xử lý khi chọn phòng từ dropdown
  const handleRoomChange = async (roomId) => {
    // Tìm phòng trong danh sách đã tải
    const room = rooms.find((r) => r._id === roomId);
    if (room) {
      setSelectedRoom(room);
      // Cập nhật thông tin phòng vào form
      form.setFieldsValue({
        roomTitle: room.title,
        roomAddress: `${room.address.detail}, ${room.address.ward}, ${room.address.district}, ${room.address.province}`,
        roomPrice: room.price,
        roomAcreage: room.acreage,
        roomServices: room.servicerooms
          .map(
            (service) =>
              `${service.name} - ${service.price}/${service.description}`
          )
          .join(", "),
        deposit: room.price,
      });
    }
  };
  // Hàm để load thông tin người dùng dựa trên email
  const handleEmailChange = async (value) => {
    if (!value) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/landlord/userinfo/${value}`,
        {
          withCredentials: true,
        }
      );
      if (response.data && response.data.info) {
        const userData = response.data.info;
        setUser(response.data.info);
        // Cập nhật thông tin vào form
        form.setFieldsValue({
          fullName: userData.user.fullName,
          phone: userData.user.phone,
          address: userData.user.address,
          dob: userData.user.dob.slice(0, 10),
          gender: userData.user.gender,
        });
      } else {
        message.warning("Không tìm thấy thông tin người dùng.");
      }
    } catch (error) {
      console.error("Error fetching user info:", error); // Log chi tiết lỗi
      message.error("Đã có lỗi xảy ra khi tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        tenant: user._id, // Assuming you have this field in your form
        room: values.room,
        start_date: values.start_date,
        size: members.length + 1,
        members: members,
      };

      // Gửi yêu cầu tạo hợp đồng
      const response = await axios.post(
        "http://localhost:8000/api/contract/create",
        payload,
        {
          withCredentials: true,
        }
      );

      if (response) {
        message.success("Tạo hợp đồng thành công!");
        nav("/landlord/contract");
      }
    } catch (error) {
      console.error("Error details:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          // Lỗi không tìm thấy đối tượng
          message.error("Không tìm thấy dữ liệu khách hàng/phòng phù hợp.");
        } else if (status === 500) {
          // Lỗi yêu cầu không hợp lệ
          message.error(
            "Dữ liệu DATE không hợp lệ. Vui lòng điền đúng định dạng mm-dd-yy!"
          );
        } else {
          // Lỗi khác từ server
          message.error(
            data.message || "Đã xảy ra lỗi từ server. Vui lòng thử lại."
          );
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Request data:", error.request);
        message.error(
          "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        // Lỗi không xác định
        console.error("Error message:", error.message);
        message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMembersChange = (newMembers) => {
    setMembers(newMembers);
  };

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <div>
          <h2>Tạo hợp đồng</h2>
          <Form
            form={form}
            name="create_contract"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: "bold" }}>
              <TabPane tab="Thông tin hợp đồng" key="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        onBlur={(e) => handleEmailChange(e.target.value)} // Khi rời khỏi ô email, gọi hàm
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Phòng"
                      name="room"
                      rules={[
                        { required: true, message: "Vui lòng chọn phòng!" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn phòng"
                        onChange={handleRoomChange}
                      >
                        {/* Kiểm tra xem rooms có phải là mảng không trước khi gọi .map */}
                        {Array.isArray(rooms) && rooms.length > 0 ? (
                          rooms.map((room) => (
                            <Select.Option key={room._id} value={room._id}>
                              {room.title}{" "}
                              {/* Hoặc room.name nếu bạn muốn hiển thị tên phòng */}
                            </Select.Option>
                          ))
                        ) : (
                          <Select.Option disabled>
                            Không có phòng nào
                          </Select.Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
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
                  <Col span={12}>
                    <Form.Item label="Diện tích" name="roomAcreage">
                      <Input
                        readOnly={true}
                        prefix={<AreaChartOutlined  />}
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
                        placeholder="Nhập số điện thoại của khách thuê"
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Giá phòng" name="roomPrice">
                      <Input readOnly={true} placeholder="" prefix={<DollarOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Sinh nhật" name="dob">
                      <Input
                        placeholder="Nhập đúng định dạng yyyy-mm-dd"
                        maxLength={10}
                        prefix={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Địa chỉ" name="roomAddress">
                      <Input
                        readOnly={true}
                        placeholder="Nhập địa chỉ chi tiết của phòng"
                        prefix={<HomeOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                      rules={[
                        { required: true, message: "Vui lòng chọn giới tính!" },
                      ]}
                    >
                      <Select placeholder="Chọn giới tính" allowClear>
                        <Select.Option value="male">Nam</Select.Option>
                        <Select.Option value="female">Nữ</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Dịch vụ" name="roomServices">
                      <Input.TextArea readOnly rows={1} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Địa chỉ" name="address">
                      <Input
                        placeholder="Nhập địa chỉ chi tiết của bạn"
                        prefix={<HomeOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Tiền cọc" name="deposit">
                      <Input
                        placeholder="Nhập tiền cọc"
                        prefix={<DollarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Ngày bắt đầu"
                      name="start_date"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập ngày bắt đầu!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập đúng định dạng yyyy-mm-dd"
                        prefix={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Thông tin thành viên" key="2">
                <AddMember
                  selectedRoom={selectedRoom}
                  onMembersChange={handleMembersChange}
                />
              </TabPane>
            </Tabs>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

const AddMember = ({ selectedRoom, onMembersChange }) => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(1);

  // Xử lý khi thêm thành viên mới
  const handleAdd = () => {
    if (data.length < selectedRoom.maxSize - 1) {
      // Kiểm tra nếu số lượng thành viên chưa vượt quá maxSize
      const newMember = {
        key: count,
        memberName: "",
        memberPhone: "",
        memberGender: "",
        memberAddress: "",
      };
      const updatedData = [...data, newMember];
      setData(updatedData);
      setCount(count + 1);

      // Gửi dữ liệu khi thành viên được thêm vào
      onMembersChange(
        updatedData.map((item) => ({
          memberName: item.memberName,
          memberPhone: item.memberPhone,
          memberGender: item.memberGender,
          memberAddress: item.memberAddress,
        }))
      );
    } else {
      alert(`Số lượng thành viên không thể vượt quá ${selectedRoom.maxSize}`);
    }
  };

  // Xử lý khi xóa thành viên
  const handleRemove = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    setCount(count - 1);

    // Gửi lại dữ liệu khi thành viên bị xóa
    onMembersChange(
      updatedData.map((item) => ({
        memberName: item.memberName,
        memberPhone: item.memberPhone,
        memberGender: item.memberGender,
        memberAddress: item.memberAddress,
      }))
    );
  };

  // Cập nhật giá trị khi người dùng thay đổi
  const handleChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);

    // Gửi dữ liệu khi có thay đổi
    onMembersChange(
      updatedData.map((item) => ({
        memberName: item.memberName,
        memberPhone: item.memberPhone,
        memberGender: item.memberGender,
        memberAddress: item.memberAddress,
      }))
    );
  };

  const columns = [
    {
      title: "Tên thành viên",
      dataIndex: "memberName",
      render: (_, record, index) => (
        <Form.Item
          name={`memberName_${index}`}
          rules={[{ required: true, message: "Vui lòng nhập tên thành viên" }]}
        >
          <Input
            placeholder="Tên thành viên"
            value={record.memberName}
            onChange={(e) => handleChange(index, "memberName", e.target.value)}
          />
        </Form.Item>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "memberPhone",
      render: (_, record, index) => (
        <Form.Item
          name={`memberPhone_${index}`}
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input
            placeholder="Số điện thoại"
            value={record.memberPhone}
            onChange={(e) => handleChange(index, "memberPhone", e.target.value)}
          />
        </Form.Item>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "memberGender",
      render: (_, record, index) => (
        <Form.Item
          name={`memberGender_${index}`}
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select
            placeholder="Giới tính"
            value={record.memberGender}
            onChange={(value) => handleChange(index, "memberGender", value)}
          >
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "memberAddress",
      render: (_, record, index) => (
        <Form.Item
          name={`memberAddress_${index}`}
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input
            placeholder="Địa chỉ"
            value={record.memberAddress}
            onChange={(e) =>
              handleChange(index, "memberAddress", e.target.value)
            }
          />
        </Form.Item>
      ),
    },
    {
      title: "Hành động",
      render: (_, record, index) => (
        <Button
          type="danger"
          onClick={() => handleRemove(index)}
          disabled={data.length < 1}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        footer={() => (
          <Button type="dashed" onClick={handleAdd}>
            Thêm thành viên
          </Button>
        )}
      />
    </div>
  );
};

export default CreateContract;
