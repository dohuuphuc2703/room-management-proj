import { DeleteOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons'; // Import icons từ Ant Design
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const { Option } = Select;

const ContractIndex = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(""); // Trạng thái bộ lọc
  const [titleFilter, setTitleFilter] = useState(""); // Tiêu đề bộ lọc
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal cho chỉnh sửa phòng
  const [currentContract, setCurrentContract] = useState(null); // Phòng hiện tại đang được chỉnh sửa
  const [form] = Form.useForm(); // Sử dụng form Ant Design để chỉnh sửa
  const nav = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/contract/byLandlord`, {
         
          withCredentials: true,
        });
        console.log(res.data.contracts)
        setContracts(res.data.contracts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []); // Gọi lại API khi bất kỳ bộ lọc nào thay đổi

  // const handleStatusChange = (value) => {
  //   setStatusFilter(value); // Cập nhật trạng thái bộ lọc
  // };

  // const handleTitleChange = (e) => {
  //   setTitleFilter(e.target.value); // Cập nhật tiêu đề bộ lọc
  // };

  const handleEdit = (contractId) => {
    // Lấy thông tin phòng để chỉnh sửa
    const contracst = contracts.find((r) => r._id === contractId);
    setCurrentContract(contracst);
    form.setFieldsValue(contracst); // Đặt giá trị của form cho các trường đã có sẵn
    setIsModalVisible(true); // Mở modal
  };

  // const handleDelete = async (roomId) => {
  //   try {
  //     await axios.delete(`http://localhost:8000/api/room/delete/${roomId}`, {
  //       withCredentials: true,
  //     });
  //     message.success("Đã xóa phòng thành công.");
  //     setRooms(rooms.filter((room) => room._id !== roomId));
  //   } catch (error) {
  //     console.error(error);
  //     message.error("Xóa phòng thất bại.");
  //   }
  // };

  const handleUpdateRoom = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(`http://localhost:8000/api/room/${currentContract._id}`, values, {
        withCredentials: true,
      });
      message.success("Cập nhật phòng thành công.");
      setIsModalVisible(false);
      setContracts(
        contracts.map((contract) => (contract._id === currentContract._id ? { ...contract, ...values } : contract))
      );
    } catch (error) {
      console.error(error);
      message.error("Cập nhật phòng thất bại.");
    }
  };

  const handleCreateContract = () => {
    nav("/landlord/createContract");
  };

  const handleViewPDF = (contractId) => {
    // Mở PDF trong tab mới
    const url = `http://localhost:8000/api/contract/pdf/${contractId}`;
    window.open(url, "_blank");
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
      render: (room) => room.title,
      filterDropdown: ({ setSelectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder="Lọc theo tiêu đề"
            onChange={(e) => setTitleFilter(e.target.value)} // Cập nhật bộ lọc theo tiêu đề
            value={titleFilter}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<EditOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Lọc
          </Button>
        </div>
      ),
    },
    {
        title: "Địa chỉ",
        dataIndex: "room",
        key: "room",
        render: (room) => room.address.province,
      },

      {
        title: "Người thuê",
        dataIndex: "tenant",
        key: "tenant",
        render: (tenant) => tenant.user.fullName+ "-"+tenant.user.email,
      },
      {
        title: "Số lượng TV",
        dataIndex: "size",
        key: "size",
        
      },
    {
      title: "Trạng thái",
      render: (text, record) => (
        <span>{record.status === "available" ? "Còn trống" : record.status === "rented" ? "Đã thuê" : "Đang bảo trì"}</span>
      ),
      filterDropdown: ({ setSelectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            // onChange={handleStatusChange}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          >
            <Option value="">Tất cả</Option>
            <Option value="available">Còn trống</Option>
            <Option value="rented">Đã thuê</Option>
            <Option value="maintenance">Đang bảo trì</Option>
          </Select>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<EditOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Lọc
          </Button>
        </div>
      ),
    },
    {
      title: "Sửa",
      render: (text, record) => (
        <Button 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record._id)} 
          type="primary" 
          shape="circle" 
        />
      ),
    },
    {
      title: "Xóa",
      render: (text, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa phòng này không?"
          // onConfirm={() => handleDelete(record._id)}
          okText="Có"
          cancelText="Không"
        >
          <Button 
            icon={<DeleteOutlined />} 
            type="danger" 
            shape="circle" 
          />
        </Popconfirm>
      ),
    },
    {
      title: "Xem PDF",
      render: (text, record) => (
        <Button
          icon={<FilePdfOutlined />} // Sử dụng icon PDF
          onClick={() => handleViewPDF(record._id)}
          type="primary"
          shape="circle"
        />
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleCreateContract} style={{ marginBottom: 16 }}>
        Tạo hợp đồng
      </Button>
      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Chỉnh sửa phòng"
        visible={isModalVisible}
        onOk={handleUpdateRoom}
        onCancel={() => setIsModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tiêu đề phòng" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề phòng!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ quận" name="address.district" rules={[{ required: true, message: 'Vui lòng nhập quận!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ thành phố" name="address.province" rules={[{ required: true, message: 'Vui lòng nhập thành phố!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="available">Còn trống</Option>
              <Option value="rented">Đã thuê</Option>
              <Option value="maintenance">Đang bảo trì</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractIndex;
