import React, { useState, useEffect } from "react";
import { Button, Col, Form, Input, Row, Upload, message, Select, InputNumber, Checkbox } from "antd";
import { UploadOutlined, HomeOutlined, AreaChartOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from "axios";
import styles from "./CreateRoom.module.css";

const { Option } = Select;

const CreateRoom = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null); // State to store the uploaded image URL
    const [servicerooms, setServicerooms] = useState([{}]); // State to store service rooms
    const [categories, setCategories] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [category, setCategory] = useState();

    const handleChangeProvince = async (value) => {
        const selectedProvince = provinces.find(prov => prov.value === value);
        setProvince(selectedProvince ? selectedProvince.label : "");
        setDistrict("");
        setWard("");

        // Lấy danh sách quận dựa trên tỉnh đã chọn
        try {
            const res = await axios.get(`https://vapi.vnappmob.com/api/province/district/${value}`);
            setDistricts(res.data.results.map(d => ({ label: d.district_name, value: d.district_id })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeDistrict = async (value) => {
        const selectedDistrict = districts.find(d => d.value === value);
        setDistrict(selectedDistrict ? selectedDistrict.label : "");
        setWard("");

        // Lấy danh sách phường dựa trên quận đã chọn
        try {
            const res = await axios.get(`https://vapi.vnappmob.com/api/province/ward/${value}`);
            setWards(res.data.results.map(w => ({ label: w.ward_name, value: w.ward_id })));
        } catch (error) {
            console.error(error);

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
        try {
            const response = await axios.post("http://localhost:8000/api/room/create", values, {
                withCredentials: true,
            });
            message.success("Phòng đã được tạo thành công!");
        } catch (error) {
            message.error("Có lỗi xảy ra khi tạo phòng.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async ({ file }) => {
        if (file.status === "uploading") {
            try {
                const formData = new FormData();
                formData.append("image", file.originFileObj);
                const response = await axios.post("http://localhost:8000/api/room/upload-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setImageUrl(response.data.imageUrl); // Update image URL
            } catch (error) {
                message.error("Lỗi khi tải ảnh lên.");
            }
        }
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
            axios.get("https://vapi.vnappmob.com/api/province/"),
            axios.get("http://localhost:8000/api/room-category/all"),
        ]).then(([resCities, resRoomCates]) => {
            setProvinces(resCities.data.results.map(city => ({ label: city.province_name, value: city.province_id })));
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
                    <Col span={12}>
                        <Form.Item
                            label="Diện tích (m²)"
                            name="acreage"
                            rules={[{ required: true, message: "Vui lòng nhập diện tích phòng!" }]}>
                            <InputNumber min={1} placeholder="Nhập diện tích" prefix={<AreaChartOutlined />} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Giá phòng (VND)"
                            name="price"
                            rules={[{ required: true, message: "Vui lòng nhập giá phòng!" }]}>
                            <InputNumber min={1} placeholder="Nhập giá phòng" prefix="₫" style={{ width: "100%" }} />
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
                                            <Input.TextArea placeholder="Mô tả dịch vụ" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
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
                                    <Col span={8}>
                                        <Checkbox value="WiFi">Wi-Fi</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="AirConditioner">Điều hòa</Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="Parking">Bãi đỗ xe</Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Ảnh đại diện" name="image">
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                showUploadList={false}
                                customRequest={handleImageChange}>
                                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                            </Upload>
                            {imageUrl && <img src={imageUrl} alt="avatar" className={styles.avatarPreview} />}
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
