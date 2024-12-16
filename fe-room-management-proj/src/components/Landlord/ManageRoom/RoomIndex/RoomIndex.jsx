import { DeleteOutlined, EditOutlined } from "@ant-design/icons"; // Import icons từ Ant Design
import { Button, message, Popconfirm, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalUpdateRoom from "../UpdateRoom/ModalUpdateRoom";

const { Option } = Select;

const LandlordListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(""); // Trạng thái bộ lọc
  const [provinces, setProvinces] = useState([]);
  const [province, setProvince] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal cho chỉnh sửa phòng
  const [currentRoom, setCurrentRoom] = useState(null); // Phòng hiện tại đang được chỉnh sửa
  const [imageUrls, setImageUrls] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/room/by-landlord`,
          {
            params: {
              status: statusFilter,
              province: province === "Tất cả tỉnh" ? "" : province,
            },
            withCredentials: true,
          }
        );
        setRooms(res.data.rooms);
        setTotal(res.data.info.total || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    Promise.all([
      axios.get("https://vapi.vnappmob.com/api/province/"),
      axios.get("http://localhost:8000/api/room-category/all"),
    ]).then(([resCities]) => {
      resCities.data.results.unshift({
        province_name: "Tất cả tỉnh",
        province_id: "",
      });
      setProvinces(
        resCities.data.results.map((city) => ({
          label: city.province_name,
          value: city.province_id,
        }))
      );
    });
    fetchRooms();
  }, [statusFilter, province]); // Gọi lại API khi bất kỳ bộ lọc nào thay đổi

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleChangeProvince = async (value) => {
    const selectedProvince = provinces.find((prov) => prov.value === value);
    setProvince(selectedProvince ? selectedProvince.label : "Tất cả tỉnh");
  };

  const handleEdit = (roomId) => {
    // Lấy thông tin phòng để chỉnh sửa
    const room = rooms.find((r) => r._id === roomId);
    setCurrentRoom(room);

    setIsModalVisible(true); // Mở modal
    // Đặt giá trị của form cho các trường đã có sẵn
  };

  const handleCloseModal = () => {
    setCurrentRoom(null);
    setIsModalVisible(false); // Đóng modal
  };

  const handleDelete = async (roomId) => {
    try {
      await axios.delete(`http://localhost:8000/api/room/delete/${roomId}`, {
        withCredentials: true,
      });
      message.success("Đã xóa phòng thành công.");
      setRooms(rooms.filter((room) => room._id !== roomId));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      message.error(errorMessage);
    }
  };

  const handleCreateRoom = () => {
    nav("/landlord/createRoom");
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },

    {
      title: "Tỉnh/Thành phố",
      render: (text, record) => record.address.province,
      filterDropdown: ({ setSelectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch
            placeholder="Lọc theo thành phố"
            value={province}
            onChange={handleChangeProvince}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          >
            {provinces.map((loc) => (
              <Select.Option key={loc.value} value={loc.value}>
                {loc.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      render: (text, record) => (
        <span>
          {record.status === "available"
            ? "Còn trống"
            : "Đã thuê"
          }
        </span>
      ),
      filterDropdown: ({ setSelectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          >
            <Option value="">Tất cả</Option>
            <Option value="available">Còn trống</Option>
            <Option value="rented">Đã thuê</Option>
          </Select>
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
          <Button icon={<DeleteOutlined />} type="danger" shape="circle" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={handleCreateRoom}
        style={{ marginBottom: 16 }}
      >
        Thêm phòng mới
      </Button>
      <Table
        columns={columns}
        dataSource={rooms}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: size,
          total: total,
          onChange: (currentPage, pageSize) => {
            setPage(currentPage);
            setSize(pageSize);
          },
        }}
      />

      <ModalUpdateRoom
        visible={isModalVisible}
        onCancel={handleCloseModal}
        currentRoom={currentRoom}
        setImageUrls={setImageUrls}
        imageUrls={imageUrls}
        setIsModalVisible={setIsModalVisible}
        setRooms={setRooms}
        rooms={rooms}
      />
    </div>
  );
};

export default LandlordListRoom;
