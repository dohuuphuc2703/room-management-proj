import { CalendarOutlined, HomeOutlined, PhoneOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Form, Input, Layout, message, Row, Select, Tabs } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import styles from "./CreateContract.module.css";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { TabPane } = Tabs;

const CreateContract = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);  // Danh sách phòng
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [user, setUser] = useState(null);

    const nav = useNavigate();

    // Hàm để load thông tin phòng từ API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/landlord/rooms",
                    {
                        withCredentials: true,
                    }
                ); // Thay URL bằng API lấy phòng
                if (response.data) {
                    setRooms(response.data.rooms);  // Cập nhật danh sách phòng
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
        const room = rooms.find(r => r._id === roomId);
        if (room) {
            setSelectedRoom(room);
            // Cập nhật thông tin phòng vào form
            form.setFieldsValue({
                roomTitle: room.title,
                roomAddress: `${room.address.detail}, ${room.address.ward}, ${room.address.district}, ${room.address.province}`,
                roomPrice: room.price,
                roomAcreage: room.acreage,
                roomServices: room.servicerooms.map(service => `${service.name} - ${service.price}/${service.description}`).join(", "),
                deposit: room.price,
            });
        }
    };
    // Hàm để load thông tin người dùng dựa trên email
    const handleEmailChange = async (value) => {
        if (!value) return;

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/landlord/userinfo/${value}`,
                {
                    withCredentials: true,
                }
            );
            if (response.data && response.data.info) {
                const userData = response.data.info;
                setUser(response.data.info)
                // Cập nhật thông tin vào form
                form.setFieldsValue({
                    fullName: userData.user.fullName,
                    phone: userData.user.phone,
                    address: userData.user.address,
                    dob: userData.user.dob.slice(0, 10),
                    gender: userData.user.gender
                });
            } else {
                message.warning("Không tìm thấy thông tin người dùng.");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);  // Log chi tiết lỗi
            message.error("Đã có lỗi xảy ra khi tải thông tin người dùng.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý submit form
    const handleSubmit = async (values) => {
        setLoading(true);
        // console.log(values)
        try {
            const payload = {
                tenant: user._id, // Assuming you have this field in your form
                room: values.room,
                start_date: values.start_date,
                size: 3 // Assuming you select the room and have its ID
            };
            console.log(payload)
            // Assuming you have an API to create a contract
            const response = await axios.post("http://localhost:8000/api/contract/create", payload, {
                withCredentials: true,
            });
            if (response) {
                message.success("Tạo thành công!");
                nav("/landlord/contract")

            }
        } catch (error) {
            console.error("Error details:", error);
            if (error.response) {
                // The request was made, and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
                message.error(`Lỗi từ server: ${error.response.data.message || "Tạo không thành công. Vui lòng thử lại."}`);
            } else if (error.request) {
                // The request was made, but no response was received
                console.error("Request data:", error.request);
                message.error("Không nhận được phản hồi từ server. Vui lòng thử lại.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
                message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <div>
                    <h2>Tạo hợp đồng</h2>
                    <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: 'bold' }}>
                        <TabPane tab="Thông tin hợp đồng" key="1">
                            <Form form={form} name="create_contract" layout="vertical" onFinish={handleSubmit}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                                        >
                                            <Input
                                                prefix={<UserOutlined />}
                                                onBlur={(e) => handleEmailChange(e.target.value)} // Khi rời khỏi ô email, gọi hàm
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            label="Phòng"
                                            name="room"
                                            rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
                                        >
                                            <Select placeholder="Chọn phòng" onChange={handleRoomChange}>
                                                {/* Kiểm tra xem rooms có phải là mảng không trước khi gọi .map */}
                                                {Array.isArray(rooms) && rooms.length > 0 ? (
                                                    rooms.map((room) => (
                                                        <Select.Option key={room._id} value={room._id}>
                                                            {room.title} {/* Hoặc room.name nếu bạn muốn hiển thị tên phòng */}
                                                        </Select.Option>
                                                    ))
                                                ) : (
                                                    <Select.Option disabled>Không có phòng nào</Select.Option>
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
                                            rules={[{ required: true, message: "Vui lòng nhập họ và tên của bạn!" }]}
                                        >
                                            <Input placeholder="Nhập họ và tên của bạn" prefix={<UserOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Diện tích"
                                            name="roomAcreage"
                                        >
                                            <Input placeholder="Giới tính" prefix={<IdcardOutlined />} />
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
                                            label="Giá phòng"
                                            name="roomPrice"
                                        >
                                            <Input
                                                placeholder=""
                                                prefix={<CalendarOutlined />}
                                            />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Sinh nhật"
                                            name="dob"
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
                                            label="Địa chỉ"
                                            name="roomAddress"
                                        >
                                            <Input placeholder="Nhập địa chỉ chi tiết của bạn" prefix={<HomeOutlined />} />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Giới tính"
                                            name="gender"
                                        >
                                            <Input placeholder="Giới tính" prefix={<IdcardOutlined />} />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item label="Dịch vụ" name="roomServices">
                                            <Input.TextArea readOnly rows={2} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Địa chỉ"
                                            name="address"
                                        >
                                            <Input placeholder="Nhập địa chỉ chi tiết của bạn" prefix={<HomeOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tiền cọc"
                                            name="deposit"
                                        >
                                            <Input placeholder="Nhập tiền cọc" prefix={<HomeOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Ngày bắt đầu"
                                            name="start_date"
                                            rules={[{ required: true, message: "Vui lòng nhập ngày bắt đầu!" }]}
                                        >
                                            <Input placeholder="Nhập địa chỉ chi tiết của bạn" prefix={<CalendarOutlined />} />
                                        </Form.Item>
                                    </Col>
                                </Row>


                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Tạo
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                        <TabPane tab="Thông tin thành viên" key="2">
                            <AddMember loading={loading} />
                        </TabPane>
                    </Tabs>
                </div>
            </Content>
        </Layout>
    );
};

const AddMember = ({ onFinish, loading }) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} name="change_password" layout="vertical" onFinish={onFinish}>
            {/* Thêm các trường cần thiết cho thông tin thành viên */}
        </Form>
    );
};

export default CreateContract;
