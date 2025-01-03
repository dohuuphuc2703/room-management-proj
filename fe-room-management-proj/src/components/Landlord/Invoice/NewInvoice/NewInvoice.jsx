import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./NewInvoice.module.css";

const { Option } = Select;

const CreateInvoiceForm = ({socket}) => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [newElectricIndex, setNewElectricIndex] = useState(null);
  const [newWaterIndex, setNewWaterIndex] = useState(null);
  const [totalServices, setTotalServices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/contract/room",
          {
            withCredentials: true,
          }
        );
        setContracts(response.data.data);
      } catch (error) {
        message.error("Error fetching rooms:", error);
      }
    };

    fetchContracts();
  }, []);

  const handleRoomChange = (roomId) => {
    const contract = contracts.find((c) => c.room._id === roomId);
    setSelectedContract(contract);
    setUser(contract.tenant.user);
    form.resetFields();
    setNewElectricIndex(null);
    setNewWaterIndex(null);
    setTotalServices([]);
  };

  const calculateTotalAmount = () => {
    if (!selectedContract) return;
    if (newElectricIndex === null) {
      message.error("Vui lòng nhập số điện mới!");
      return;
    }

    if (newWaterIndex === null) {
      message.error("Vui lòng nhập số nước mới!");
      return;
    }

    if (newElectricIndex < selectedContract.room.electric.new) {
      message.error("Số điện mới không thể nhỏ hơn số điện cũ!");
      return;
    }

    if (newWaterIndex < selectedContract.room.water.new) {
      message.error("Số nước mới không thể nhỏ hơn số nước cũ!");
      return;
    }
    const electricAmount =
      (newElectricIndex - selectedContract.room.electric.new) *
      selectedContract.room.electric.price;
    const waterAmount =
      (newWaterIndex - selectedContract.room.water.new) *
      selectedContract.room.water.price;

    const updatedServices = [
      {
        name: "Room",
        quantity: 1,
        totalAmount: selectedContract.room.price,
      },
      {
        name: "Electric",
        quantity: newElectricIndex - selectedContract.room.electric.new || 0,
        totalAmount: electricAmount ,
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
    setIsModalVisible(true);
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

      await axios.put(
        `http://localhost:8000/api/room/update/${selectedContract.room._id}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      message.success("Hóa đơn được tạo và chỉ số điện/nước đã được cập nhật!");
      console.log(socket, user);
      if (socket && user) {
        const notification = {
          type: `invoice`,
          message: `Bạn có hóa đơn mới cần thanh toán.`,
          recipient: user._id, // ID người thuê
        };

        socket.emit("send_notification", notification);
      }
      setSelectedContract(null);
      form.resetFields();
      setTotalServices([]);
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error(
        `Lỗi khi tạo hóa đơn ${error.response?.data.message || ""
        }, vui lòng thử lại!`
      );
    }
  };

  return (
    <div className={styles.container}>
      <Form layout="vertical" form={form}>
        <h2>Tạo hóa đơn mới</h2>
        <Form.Item
          label="Chọn phòng"
          name="room"
          rules={[{ required: true, message: "Please select a room!" }]}
        >
          <Select placeholder="Select a room" onChange={handleRoomChange}>
            {contracts?.map((contract) => (
              <Option key={contract.room._id} value={contract.room._id}>
                {contract.room.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedContract && (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Tên phòng">
                  <Input value={selectedContract.room.title} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giá phòng">
                  <InputNumber
                    value={selectedContract.room.price}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

            </Row>
            <Divider>Chỉ số điện, nước</Divider>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item label="Số điện cũ">
                  <InputNumber
                    value={selectedContract.room.electric.new ?? 0}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Số điện mới"
                  name="newElectricIndex"
                  rules={[
                    { required: true, message: "Vui lòng nhập số nước mới!" },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập số điện mới"
                    style={{ width: "100%" }}
                    onChange={(value) => setNewElectricIndex(value)}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Đơn giá">
                  <InputNumber
                    value={selectedContract.room.electric.price}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>


              <Col span={4}>
                <Form.Item label="Số nước cũ">
                  <InputNumber
                    value={selectedContract.room.water.new ?? 0}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Số nước mới"
                  name="newWaterIndex"
                  rules={[
                    { required: true, message: "Vui lòng nhập số nước mới!" },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập số nước mới"
                    style={{ width: "100%" }}
                    onChange={(value) => setNewWaterIndex(value)}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
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

            <Button
              type="primary"
              style={{ marginRight: "10px" }}
              onClick={calculateTotalAmount}
            >
              Tính tổng
            </Button>

            <Modal
              title="Chi tiết hóa đơn"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={null}
              className={styles.invoiceModal}
            >
              {totalServices.length > 0 && (
                <div className={styles.invoiceContent}>
                  <table className={styles.invoiceTable}>
                    <thead>
                      <tr>
                      <th>STT</th>
                        <th>Tên dịch vụ</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalServices.map((service, index) => (
                        <tr key={index}>
                          <td>{index+1}</td>
                          <td>{service.name}</td>
                          <td>{service.quantity}</td>
                          <td>{service.totalAmount} VNĐ</td>
                        </tr>
                      ))}
                      <tr className={styles.totalRow}>
                        <td colSpan="3" style={{ textAlign: "right" }}>
                          <strong>Tổng cộng</strong>
                        </td>
                        <td>
                          <strong>
                            {totalServices.reduce((sum, s) => sum + s.totalAmount, 0)}{" "}
                            VNĐ
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    className={styles.invoiceButton} // Apply the CSS class for button
                  >
                    Tạo hóa đơn
                  </Button>
                </div>
              )}
            </Modal>
          </>
        )}
      </Form>
    </div>
  );
};

export default CreateInvoiceForm;
