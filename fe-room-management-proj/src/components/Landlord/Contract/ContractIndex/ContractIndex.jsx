import { DeleteOutlined, EditOutlined } from '@ant-design/icons'; // Import icons từ Ant Design
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const { Option } = Select;

const ContractIndex = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(""); // Trạng thái bộ lọc
  const [titleFilter, setTitleFilter] = useState(""); // Tiêu đề bộ lọc
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal cho chỉnh sửa phòng
  const [currentRoom, setCurrentRoom] = useState(null); // Phòng hiện tại đang được chỉnh sửa
  const [form] = Form.useForm(); // Sử dụng form Ant Design để chỉnh sửa
  const nav = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/room/by-landlord`, {
          params: {
            status: statusFilter,
            title: titleFilter, // Thêm các bộ lọc vào params API
          },
          withCredentials: true,
        });
        setRooms(res.data.rooms);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [statusFilter, titleFilter]); // Gọi lại API khi bất kỳ bộ lọc nào thay đổi

  const handleStatusChange = (value) => {
    setStatusFilter(value); // Cập nhật trạng thái bộ lọc
  };

  const handleTitleChange = (e) => {
    setTitleFilter(e.target.value); // Cập nhật tiêu đề bộ lọc
  };

  const handleEdit = (roomId) => {
    // Lấy thông tin phòng để chỉnh sửa
    const room = rooms.find((r) => r._id === roomId);
    setCurrentRoom(room);
    form.setFieldsValue(room); // Đặt giá trị của form cho các trường đã có sẵn
    setIsModalVisible(true); // Mở modal
  };

  const handleDelete = async (roomId) => {
    try {
      await axios.delete(`http://localhost:8000/api/room/delete/${roomId}`, {
        withCredentials: true,
      });
      message.success("Đã xóa phòng thành công.");
      setRooms(rooms.filter((room) => room._id !== roomId));
    } catch (error) {
      console.error(error);
      message.error("Xóa phòng thất bại.");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(`http://localhost:8000/api/room/${currentRoom._id}`, values, {
        withCredentials: true,
      });
      message.success("Cập nhật phòng thành công.");
      setIsModalVisible(false);
      setRooms(
        rooms.map((room) => (room._id === currentRoom._id ? { ...room, ...values } : room))
      );
    } catch (error) {
      console.error(error);
      message.error("Cập nhật phòng thất bại.");
    }
  };

  const handleCreateContract = () => {
    nav("/landlord/createContract");
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Phòng",
      dataIndex: "title",
      key: "title",
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
        dataIndex: "title",
        key: "title",
      },

      {
        title: "Người thuê",
        dataIndex: "title",
        key: "title",
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
            onChange={handleStatusChange}
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
          onConfirm={() => handleDelete(record._id)}
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
  ];

  return (
    <div>
      <Button type="primary" onClick={handleCreateContract} style={{ marginBottom: 16 }}>
        Tạo hợp đồng
      </Button>
      <Table
        columns={columns}
        dataSource={rooms}
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
