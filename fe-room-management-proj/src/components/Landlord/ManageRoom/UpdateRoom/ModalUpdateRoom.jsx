import {
  AreaChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./ModalUpdateRoom.module.css";

function ModalUpdateRoom({
  visible,
  onCancel,
  currentRoom,
  setIsModalVisible,
  setRooms,
  rooms,
  imageUrls,
  setImageUrls,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [servicerooms, setServicerooms] = useState([{}]);

  useEffect(() => {
    if (currentRoom?.servicerooms) {
      setServicerooms(currentRoom.servicerooms); 
    }
    if (currentRoom) {
      form.setFieldsValue(currentRoom);
      setImageUrls(Array.isArray(currentRoom.images) ? currentRoom.images : []);
    }
    
  }, [currentRoom, form, setImageUrls]);

  const onFinish = async (values) => {
    setLoading(true);
    const images = imageUrls;
    // Gửi dữ liệu phòng
    try {
      const response = await axios.put(
        `http://localhost:8000/api/room/update/${currentRoom._id}`,
        {
          ...values,
          images: images,
        },
        {
          withCredentials: true,
        }
      );

      message.success("Cập nhật phòng thành công.");
      setIsModalVisible(false);
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === currentRoom._id ? { ...room, ...values, images } : room
        )
      );
    } catch (error) {
      message.error("Cập nhật phòng thất bại.");
    }
  };

  const handleImageChange = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      const formData = new FormData();
      formData.append("image", file); // Thêm ảnh vào formData

      // Gửi ảnh lên server
      const response = await axios.post(
        "http://localhost:8000/api/room/uploadImage",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Kiểm tra phản hồi từ server
      if (response.data && response.data.roomImageUrl) {
        setImageUrls((prevUrls) => {
          const updatedUrls = prevUrls
            ? [...prevUrls, response.data.roomImageUrl]
            : [response.data.roomImageUrl];
          return updatedUrls;
        });

        if (onSuccess) {
          onSuccess("Upload thành công");
        }
      } else {
        throw new Error("Không nhận được URL ảnh từ server");
      }
    } catch (error) {
      message.error(
        "Lỗi khi tải ảnh lên: ",
        error.response ? error.response.data : error.message
      );
      if (onError) {
        onError(error);
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
    const updatedServiceRooms = [...servicerooms];
    updatedServiceRooms.splice(index, 1);
    setServicerooms(updatedServiceRooms);
    form.setFieldsValue({
      servicerooms: updatedServiceRooms,
    });
  };
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Cập nhật thông tin phòng"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={"80%"}
      style={{ top: 0, height: "100vh" }}
      bodyStyle={{ height: "calc(100% - 55px)", overflowY: "auto" }}
    >
      <Form
        form={form}
        initialValues={currentRoom}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tiêu đề phòng"
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề phòng!" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề phòng"
                prefix={<FileTextOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loại phòng"
              name="category"
              rules={[{ required: true }]}
            >
              <span
                style={{
                  border: "1px solid #d9d9d9",
                  padding: "6px",
                  borderRadius: "5px",
                }}
              >
                {currentRoom?.category?.category}
              </span>
            </Form.Item>
          </Col>
        </Row>

        {/* Địa chỉ */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Tỉnh"
              name={["address", "province"]}
              rules={[{ required: true }]}
            >
              <Input disabled></Input>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Quận"
              name={["address", "district"]}
              rules={[{ required: true }]}
            >
              <Input disabled></Input>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Phường"
              name={["address", "ward"]}
              rules={[{ required: true }]}
            >
              <Input disabled></Input>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={["address", "detail"]}
              label="Địa chỉ"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Diện tích (m²)"
              name="acreage"
              rules={[
                { required: true, message: "Vui lòng nhập diện tích phòng!" },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập diện tích"
                prefix={<AreaChartOutlined />}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Giá phòng (VND)"
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá phòng!" }]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập giá phòng"
                prefix="VNĐ"
                formatter={(value) =>
                  value ? `${parseInt(value).toLocaleString("vi-VN")}` : ""
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Số người tối đa"
              name="maxSize"
              rules={[
                { required: true, message: "Vui lòng nhập số người tối đa!" },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập số người tối đa"
                prefix={<TeamOutlined />}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Mô tả phòng"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả phòng!" },
              ]}
            >
              <Input.TextArea placeholder="Mô tả phòng" rows={4} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Điện */}
          <Col span={2}>
            <h4 style={{ marginBottom: 0 }}>Điện:</h4>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Đơn giá"
              name={["electric", "price"]}
              rules={[{ required: true, message: "Vui lòng nhập giá điện" }]}
            >
              <InputNumber
                min={1}
                placeholder="Giá điện"
                formatter={(value) =>
                  value ? `${parseInt(value).toLocaleString("vi-VN")}` : ""
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Đơn vị tính"
              name={["electric", "description"]}
              rules={[{ required: true, message: "Vui lòng nhập đơn vị tính" }]}
            >
              <Input placeholder="Đơn vị tính" />
            </Form.Item>
          </Col>

          {/* Khoảng cách giữa Điện và Nước */}
          <Col span={2}></Col>

          {/* Nước */}
          <Col span={2}>
            <h4 style={{ marginBottom: 0 }}>Nước:</h4>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Đơn giá"
              name={["water", "price"]}
              rules={[{ required: true, message: "Vui lòng nhập giá nước" }]}
            >
              <InputNumber
                min={1}
                placeholder="Giá nước"
                formatter={(value) =>
                  value ? `${parseInt(value).toLocaleString("vi-VN")}` : ""
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Đơn vị tính"
              name={["water", "description"]}
              rules={[{ required: true, message: "Vui lòng nhập đơn vị tính" }]}
            >
              <Input placeholder="Đơn vị tính" />
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên dịch vụ!",
                        },
                      ]}
                    >
                      <Input placeholder="Tên dịch vụ" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={["servicerooms", index, "price"]}
                      label="Giá dịch vụ"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập giá dịch vụ!",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Giá dịch vụ"
                        formatter={(value) =>
                          value ? `${parseInt(value).toLocaleString("vi-VN")}` : ""
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={["servicerooms", index, "description"]}
                      label="Mô tả dịch vụ"
                    >
                      <Input placeholder="Mô tả dịch vụ" />
                    </Form.Item>
                  </Col>
                  <Col span={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                      type="primary"
                      onClick={() => handleRemoveServiceRoom(index)}
                      className={styles.removeServiceButton}
                    >
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
                    <Checkbox value="Full nội thất hiện đại, sang trọng">
                      Nội thất
                    </Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="Gần chợ, địa điểm ăn uống...">
                      Gần chợ
                    </Checkbox>
                  </Col>

                  <Col span={6}>
                    <Checkbox value="Có thang máy">Thang máy</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Hình ảnh phòng" name="images">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {imageUrls && imageUrls.length > 0 ? (
                  imageUrls.map((url, index) => (
                    <div
                      key={index}
                      style={{
                        width: "100px",
                        height: "100px",
                      }}
                    >
                      <img
                        src={url}
                        alt={`room-${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p>Chưa có ảnh nào được tải lên.</p>
                )}
              </div>
              <Upload
                name="image"
                listType="picture-card"
                multiple={true}
                customRequest={handleImageChange}
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
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalUpdateRoom;
