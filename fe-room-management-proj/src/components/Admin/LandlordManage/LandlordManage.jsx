import { DeleteOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons"; // Import icons từ Ant Design
import { Button, message, Popconfirm, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandlordManage = () => {
  const [loading, setLoading] = useState(true);
  const [landlords, setLandlords] = useState([]); // Dữ liệu landlord
  const [total, setTotal] = useState(0); // Tổng số landlord

  const nav = useNavigate();

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/admin/landlords", {
            withCredentials: true,
        });
        if (res.data.success) {
          const { data } = res.data;
          setLandlords(data);
          setTotal(data.length); // Gán tổng số landlord
        } else {
          message.error("Không thể tải danh sách landlord.");
        }
      } catch (error) {
        console.error(error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []); // Chỉ gọi API 1 lần khi component mount

  const handleToggleStatus = async (record) => {
    try {
      const action = record.user.hidden ? "unlock" : "block"; // Kiểm tra trạng thái để quyết định hành động
      const response = await axios.put(`http://localhost:8000/api/admin/landlord/${action}/${record.user._id}`, {}, { withCredentials: true });
      if (response.data.success) {
        message.success(`${action === "block" ? "Khóa" : "Mở khóa"} tài khoản thành công!`);
        setLandlords((prev) => prev.map((item) => 
          item._id === record._id ? { ...item, user: { ...item.user, hidden: !item.user.hidden } } : item
        ));
      } else {
        message.error("Thao tác không thành công!");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi trong quá trình khóa/mở khóa tài khoản.");
    }
  };
  
  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/admin/landlords/${record._id}`); // API xóa landlord
      message.success("Xóa thành công!");
      setLandlords((prev) => prev.filter((item) => item._id !== record._id)); // Cập nhật danh sách
    } catch (error) {
      console.error(error);
      message.error("Xóa thất bại!");
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: ["user", "fullName"],
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["user", "phone"],
      key: "phone",
    },
    {
      title: "Tổng số phòng",
      dataIndex: "roomCount",
      key: "roomCount",
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Button
          onClick={() => handleToggleStatus(record)}
          type={record.user.hidden === true ? "default" : "danger"}
          icon={record.user.hidden === true ? <UnlockOutlined /> : <LockOutlined />} // Thay đổi icon
        >
        </Button>
      ),
    },
    {
      title: "Xóa",
      render: (text, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa landlord này không?"
          onConfirm={() => handleDelete(record)}
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
      <Table
        columns={columns}
        dataSource={landlords}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 1,
          total: total,
          onChange: (page) => {
            // Xử lý phân trang nếu cần
            console.log("Trang hiện tại:", page);
          },
        }}
      />
    </div>
  );
};

export default LandlordManage;
