import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const { Option } = Select;

const CreateInvoiceForm = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [newElectricIndex, setNewElectricIndex] = useState(null);
  const [newWaterIndex, setNewWaterIndex] = useState(null);
  const [totalServices, setTotalServices] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/contract/byLandlord",
          {
            withCredentials: true,
          }
        );
        setContracts(response.data.contracts);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchContracts();
  }, []);

  const handleRoomChange = (roomId) => {
    const contract = contracts.find((c) => c.room._id === roomId);
    setSelectedContract(contract);
    form.resetFields();
    setNewElectricIndex(null);
    setNewWaterIndex(null);
    setTotalServices([]);
  };

  const calculateTotalAmount = () => {
    if (!selectedContract) return;

    const electricAmount =
      (newElectricIndex - selectedContract.room.electric.new) *
        selectedContract.room.electric.price || 0;
    const waterAmount =
      (newWaterIndex - selectedContract.room.water.new) *
        selectedContract.room.water.price || 0;

    const updatedServices = [
      {
        name: "Room",
        quantity: 1,
        totalAmount: selectedContract.room.price,
      },
      {
        name: "Electric",
        quantity: newElectricIndex - selectedContract.room.electric.new || 0,
        totalAmount: electricAmount,
      },
      {
        name: "Water",
        quantity: newWaterIndex - selectedContract.room.water.new || 0,
        totalAmount: waterAmount,
      },
      ...selectedContract.room.servicerooms.map((service) => ({
        name: service.name,
        quantity: 1,
        totalAmount: service.price,
      })),
    ];

    setTotalServices(updatedServices);
  };

  const handleSubmit = async () => {
    if (!selectedContract || totalServices.length === 0) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin và tính tổng trước khi tạo hóa đơn!"
      );
      return;
    }

    const invoiceData = {
      contractID: selectedContract._id,
      totalOfSv: totalServices,
    };

    try {
      // Tạo hóa đơn
      await axios.post(
        "http://localhost:8000/api/invoice/create",
        invoiceData,
        {
          withCredentials: true,
        }
      );

      // Cập nhật chỉ số điện/nước
      const updateData = {
        electric: {
          old: selectedContract.room.electric.new,
          new: newElectricIndex,
          price: selectedContract.room.electric.price,
          description: selectedContract.room.electric.description,
        },
        water: {
          old: selectedContract.room.water.new,
          new: newWaterIndex,
          price: selectedContract.room.water.price,
          description: selectedContract.room.water.description,
        },
      };

      await axios.post(
        `http://localhost:8000/api/room/update/${selectedContract.room._id}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      message.success("Hóa đơn được tạo và chỉ số điện/nước đã được cập nhật!");
      setSelectedContract(null);
      form.resetFields();
      setTotalServices([]);
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error(`Lỗi khi tạo hóa đơn ${error.response?.data.message || ""}, vui lòng thử lại!`);
    }
  };

  return (
    <Form layout="vertical" form={form}>
      <Form.Item
        label="Chọn phòng"
        name="room"
        rules={[{ required: true, message: "Please select a room!" }]}
      >
        <Select placeholder="Select a room" onChange={handleRoomChange}>
          {contracts.map((contract) => (
            <Option key={contract.room._id} value={contract.room._id}>
              {contract.room.title}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {selectedContract && (
        <>
          <Form.Item label="Tên phòng">
            <Input value={selectedContract.room.title} disabled />
          </Form.Item>

          <Form.Item label="Giá phòng">
            <InputNumber
              value={selectedContract.room.price}
              disabled
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Divider>Chỉ số điện</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Số điện cũ">
                <InputNumber
                  value={selectedContract.room.electric.new ?? 0}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Số điện mới">
                <InputNumber
                  placeholder="Nhập số điện mới"
                  style={{ width: "100%" }}
                  onChange={(value) => setNewElectricIndex(value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Đơn giá">
                <InputNumber
                  value={selectedContract.room.electric.price}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Chỉ số nước</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Số nước cũ">
                <InputNumber
                  value={selectedContract.room.water.new ?? 0}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Số nước mới">
                <InputNumber
                  placeholder="Nhập số nước mới"
                  style={{ width: "100%" }}
                  onChange={(value) => setNewWaterIndex(value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Đơn giá">
                <InputNumber
                  value={selectedContract.room.water.price}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Dịch vụ phòng</Divider>
          {selectedContract.room.servicerooms.map((service, index) => (
            <Row key={index} gutter={16} style={{ marginBottom: "16px" }}>
              <Col span={8}>
                <Form.Item label="Tên dịch vụ">
                  <Input value={service.name} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Giá dịch vụ">
                  <InputNumber
                    value={service.price}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Mô tả">
                  <Input value={service.description || "Không có"} disabled />
                </Form.Item>
              </Col>
            </Row>
          ))}

          <Button type="primary" style={{ marginRight: "10px" }} onClick={calculateTotalAmount}>
            Tính tổng
          </Button>

          {totalServices.length > 0 && (
            <div>
              <Divider>Tổng chi tiết</Divider>
              {totalServices.map((service, index) => (
                <Typography.Paragraph key={index} style={{ margin: 0 }}>
                  {service.name}: {service.totalAmount} VNĐ
                </Typography.Paragraph>
              ))}
              <Divider />
              <Typography.Text strong>
                Tổng cộng:{" "}
                {totalServices.reduce((sum, s) => sum + s.totalAmount, 0)} VNĐ
              </Typography.Text>
            </div>
          )}

          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ marginTop: "16px" }}
          >
            Tạo hóa đơn
          </Button>
        </>
      )}
    </Form>
  );
};

export default CreateInvoiceForm;
