import { AreaChartOutlined, FileTextOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, InputNumber, message, Row, Select, Upload } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./CreateRoom.module.css";

const { Option } = Select;

const CreateRoom = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState(null); // State to store the uploaded image URL
    const [servicerooms, setServicerooms] = useState([{}]); // State to store service rooms
    const [categories, setCategories] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [category, setCategory] = useState();
    const nav = useNavigate();

    const handleChangeProvince = async (value) => {
        const selectedProvince = provinces.find(prov => prov.value === value);
        setProvince(selectedProvince ? selectedProvince.label : "");
        setDistrict("");
        setWard("");

        // Lấy danh sách quận dựa trên tỉnh đã chọn
        try {
            const res = await axios.get(`https://open.oapi.vn/location/districts/${value}`);
            setDistricts(res.data.data.map(d => ({ label: d.name, value: d.id })));
        } catch (error) {
            message.error(error);
        }
    };

    const handleChangeDistrict = async (value) => {
        const selectedDistrict = districts.find(d => d.value === value);
        setDistrict(selectedDistrict ? selectedDistrict.label : "");
        setWard("");

        // Lấy danh sách phường dựa trên quận đã chọn
        try {
            const res = await axios.get(`https://open.oapi.vn/location/wards/${value}`);
            setWards(res.data.data.map(w => ({ label: w.name, value: w.id })));
        } catch (error) {
            message.error(error);

        }
    };

    const handleChangeWard = async (value) => {
        const selectedWard = wards.find(w => w.value === value);
        setWard(selectedWard ? selectedWard.label : "");
    };

    const handleChangeCategory = (value) => {
        const selectedCategory = categories.find(cat => cat.value === value);
        setCategory(selectedCategory ? selectedCategory.label : "");
    };

    const onFinish = async (values) => {
        setLoading(true);

        // Tạo đối tượng address từ các trường đã chọn
        const address = {
            province: province,    // Lấy giá trị tỉnh
            district: district,    // Lấy giá trị quận
            ward: ward,            // Lấy giá trị phường
            detail: values.detail, // Lấy chi tiết địa chỉ từ form
        };

        const images = imageUrls;
        // Gửi dữ liệu phòng cùng với address
        try {
            const response = await axios.post("http://localhost:8000/api/room/addRoom", {
                ...values,
                address: address,
                images: images // Gửi địa chỉ dưới dạng đối tượng
            }, {
                withCredentials: true,
            });

            message.success("Phòng đã được tạo thành công!");
            nav('/landlord/rooms');
        } catch (error) {
            message.error("Có lỗi xảy ra khi tạo phòng.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            const formData = new FormData();
            formData.append("image", file);  // Thêm ảnh vào formData

            // Gửi ảnh lên server
            const response = await axios.post(
                "http://localhost:8000/api/room/uploadImage",
                formData,
                { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // Kiểm tra phản hồi từ server
            if (response.data && response.data.roomImageUrl) {
                setImageUrls((prevUrls) => {
                    // Nếu prevUrls chưa được khởi tạo (null), khởi tạo nó là mảng rỗng
                    const updatedUrls = prevUrls ? [...prevUrls, response.data.roomImageUrl] : [response.data.roomImageUrl];
                    return updatedUrls;
                });

                if (onSuccess) {
                    onSuccess("Upload thành công");  // Thông báo upload thành công
                }
            } else {
                throw new Error("Không nhận được URL ảnh từ server");
            }
        } catch (error) {
            if (onError) {
                onError(error);  // Gọi onError để xử lý lỗi
            }
        }
    };

    const handleRemove = (file) => {
        setImageUrls(imageUrls.filter((url) => url !== file.url)); // Loại bỏ ảnh khỏi mảng khi xóa
    };

    const handleAddServiceRoom = () => {
        setServicerooms([...servicerooms, {}]);
    };

    const handleRemoveServiceRoom = (index) => {
        const newServicerooms = [...servicerooms];
        newServicerooms.splice(index, 1);
        setServicerooms(newServicerooms);
    };

    useEffect(() => {
        // Lấy danh sách tỉnh và loại phòng
        Promise.all([
            axios.get("https://open.oapi.vn/location/provinces?page=0&size=63"),
            axios.get("http://localhost:8000/api/room-category/all"),
        ]).then(([resCities, resRoomCates]) => {
            setProvinces(resCities.data.data.map(city => ({ label: city.name, value: city.id })));
            setCategories(resRoomCates.data.categories.map(category => ({ label: category.category, value: category._id })));
        });
    }, []);

    return (
        <div className={styles.container}>
            <h2>Tạo Phòng Mới</h2>
            <Form form={form} name="create_room" layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Tiêu đề phòng"
                            name="title"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề phòng!" }]} >
                            <Input placeholder="Nhập tiêu đề phòng" prefix={<FileTextOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Loại phòng"
                            name="category"
                            rules={[{ required: true, message: "Vui lòng chọn loại phòng!" }]}>
                            <Select placeholder="Chọn loại phòng" onChange={handleChangeCategory}>
                                {categories.map(cat => (
                                    <Select.Option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Địa chỉ */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label="Tỉnh"
                            name="province"
                            rules={[{ required: true, message: "Vui lòng chọn tỉnh!" }]}>
                            <Select placeholder="Chọn tỉnh/thành phố" onChange={handleChangeProvince}>
                                {provinces.map(loc => (
                                    <Select.Option key={loc.value} value={loc.value}>
                                        {loc.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Quận"
                            name="district"
                            rules={[{ required: true, message: "Vui lòng chọn quận!" }]}>
                            <Select placeholder="Chọn quận/huyện" onChange={handleChangeDistrict}>
                                {districts.map(d => (
                                    <Select.Option key={d.value} value={d.value}>
                                        {d.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Phường"
                            name="ward"
                            rules={[{ required: true, message: "Vui lòng chọn phường!" }]}>
                            <Select placeholder="Chọn xã/phường" onChange={handleChangeWard}>
                                {wards.map(w => (
                                    <Select.Option key={w.value} value={w.value}>
                                        {w.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="detail"
                            label="Địa chỉ"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                            <Input placeholder="Địa chỉ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Diện tích (m²)"
                            name="acreage"
                            rules={[{ required: true, message: "Vui lòng nhập diện tích phòng!" }]}>
                            <InputNumber min={1} placeholder="Nhập diện tích" prefix={<AreaChartOutlined />} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Giá phòng (VND)"
                            name="price"
                            rules={[{ required: true, message: "Vui lòng nhập giá phòng!" }]}>
                            <InputNumber min={1} placeholder="Nhập giá phòng" prefix="VNĐ" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Số người tối đa"
                            name="maxSize"
                            rules={[{ required: true, message: "Vui lòng nhập số người tối đa!" }]}>
                            <InputNumber min={1} placeholder="Nhập số người tối đa" prefix={<TeamOutlined />} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>


                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Mô tả phòng"
                            name="description"
                            rules={[{ required: true, message: "Vui lòng nhập mô tả phòng!" }]}>
                            <Input.TextArea placeholder="Mô tả phòng" rows={4} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} align="middle">
                    {/* Điện */}
                    <Col span={2}>
                        <h4 style={{ marginBottom: 0 }}>Điện:</h4>
                    </Col>
                    <Col span={9}>
                        <Form.Item
                            label="Đơn giá"
                            name={["electric", "price"]}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            rules={[{ required: true, message: "Vui lòng nhập giá điện" }]}
                        >
                            <Input placeholder="Nhập giá điện" />
                        </Form.Item>
                    </Col>

                    {/* Nước */}
                    <Col span={2}>
                        <h4 style={{ marginBottom: 0 }}>Nước:</h4>
                    </Col>
                    <Col span={9}>
                        <Form.Item
                            label="Đơn giá"
                            name={["water", "price"]}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            rules={[{ required: true, message: "Vui lòng nhập giá nước" }]}
                        >
                            <Input placeholder="Nhập giá nước" />
                        </Form.Item>
                    </Col>
                </Row>


                {/* Dịch vụ phòng */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Dịch vụ phòng" name="servicerooms">
                            {servicerooms.map((_, index) => (
                                <Row gutter={16} key={index} className="servicerooms">
                                    <Col span={6}>
                                        <Form.Item
                                            name={["servicerooms", index, "name"]}
                                            label="Tên dịch vụ"
                                            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}>
                                            <Input placeholder="Tên dịch vụ" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name={["servicerooms", index, "price"]}
                                            label="Giá dịch vụ"
                                            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}>
                                            <InputNumber min={1} placeholder="Giá dịch vụ" style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name={["servicerooms", index, "description"]}
                                            label="Mô tả dịch vụ">
                                            <Input placeholder="Mô tả dịch vụ" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Button
                                            type="danger"
                                            onClick={() => handleRemoveServiceRoom(index)}
                                            className={styles.removeServiceButton}>
                                            Xóa
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button type="dashed" onClick={handleAddServiceRoom}>
                                Thêm dịch vụ phòng
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Tiện nghi phòng */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Tiện nghi phòng" name="amenities">
                            <Checkbox.Group>
                                <Row>
                                    <Col span={6}>
                                        <Checkbox value="WiFi">Wi-Fi</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Điều hòa">Điều hòa</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Bãi đỗ xe thoáng rộng">Bãi đỗ xe</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Giờ giấc tự do">Giờ giấc tự do</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Bảo vệ 24/7">Bảo vệ 24/7</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Full nội thất hiện đại, sang trọng">Nội thất</Checkbox>
                                    </Col>
                                    <Col span={6}>
                                        <Checkbox value="Gần chợ, địa điểm ăn uống...">Gần chợ</Checkbox>
                                    </Col>

                                    <Col span={6}>
                                        <Checkbox value="Có tháng máy">Thang máy</Checkbox>
                                    </Col>

                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Hình ảnh phòng" name="images">
                            <Upload
                                name="image"
                                listType="picture-card"
                                multiple={true}  // Cho phép chọn nhiều ảnh
                                showUploadList={{ showRemoveIcon: true }}  // Hiển thị nút xóa
                                customRequest={handleImageChange}  // Đảm bảo customRequest được truyền đúng
                                // onChange={handleImageChange}
                                onRemove={handleRemove}  // Xử lý khi xóa ảnh
                            >
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Chọn hình ảnh</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Tạo phòng
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreateRoom;
