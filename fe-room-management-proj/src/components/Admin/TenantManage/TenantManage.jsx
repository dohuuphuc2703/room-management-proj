import { DeleteOutlined, EditOutlined, CheckCircleFilled, CloseCircleFilled,UnlockOutlined, LockOutlined } from "@ant-design/icons"; // Import icons từ Ant Design
import { Button, message, Popconfirm, Select, Table, Avatar } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const { Option } = Select;

const TenantManage = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchTenants();
    }, [page, size]);


    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8000/api/admin/list-tenant", {
                params: {
                    hidden: statusFilter,
                    page,
                    size,
                },
                withCredentials: true,
            });
            setTenants(res.data.data || []);
            setTotal(res.data.pagination.total || 0); // Tổng số tenant từ backend
        } catch (error) {
            console.error(error);
            message.error("Không thể tải dữ liệu người thuê.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value)
        setPage(1); 
    };

    const handleToggleStatus = async (record) => {
        try {
          const action = record.hidden ? "unlock" : "block"; // Kiểm tra trạng thái để quyết định hành động
          const response = await axios.put(`http://localhost:8000/api/admin/user/${action}/${record._id}`, {}, { withCredentials: true });
          if (response.data.success) {
            message.success(`${action === "block" ? "Khóa" : "Mở khóa"} tài khoản thành công!`);
            setTenants((prev) => prev.map((item) => 
              item._id === record._id ? { ...item, hidden: !item.hidden } : item
            ));
          } else {
            message.error("Thao tác không thành công!");
          }
        } catch (error) {
          console.error(error);
          message.error("Đã xảy ra lỗi trong quá trình khóa/mở khóa tài khoản.");
        }
      };
    const columns = [
        {
            title: "STT",
            render: (_, __, index) => (page - 1) * size + index + 1,
        },
        {
            title: "Avatar",
            dataIndex: "avatar",
            key: "avatar",
            render: (avatar) => (
                avatar ? (
                    <Avatar size={50} src={avatar} />
                ) : (
                    <span>Không có</span>
                )
            ),
        },
        {
            title: "Tên",
            dataIndex: "fullName",
            key: "fullName",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "SĐT",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "DOB",
            dataIndex: "dob",
            key: "dob",
            render: (dob) =>
                dob ? new Date(dob).toLocaleDateString("vi-VN") : "",
        },
        {
            title: "Giới tính",
            render: (_, record) => (
                <span>{record.gender === "male" ? "Nam" : "Nữ"}</span>
            ),
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Xác thực",
            dataIndex: "verifiedAt",
            key: "verifiedAt",
            render: (verifiedAt) =>
                verifiedAt ? (
                    <CheckCircleFilled style={{ color: "green" , fontSize: "20px"}} />
                ) : (
                    <CloseCircleFilled style={{ color: "red" ,  fontSize: "20px"}} />
                ),
        },
        
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                switch (role) {
                    case "tenant":
                        return "Người thuê";
                    case "landlord":
                        return "Chủ nhà";
                    case "admin":
                        return "Quản trị viên";
                    default:
                        return "Không xác định";
                }
            },
        },
        {
            title: "Thao tác",
            render: (text, record) => (
              <Button
                onClick={() => handleToggleStatus(record)}
                type={record.hidden === true ? "default" : "danger"}
                icon={record.hidden === true ? <UnlockOutlined /> : <LockOutlined />} // Thay đổi icon
              >
              </Button>
            ),
          },
        {
            title: "Xóa",
            render: (text, record) => (
                <Popconfirm
                    title="Bạn có chắc chắn muốn xóa tài khoản này không?"
                    // onConfirm={() => handleDelete(record._id)}
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
                dataSource={tenants}
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
        </div>
    );
};

export default TenantManage;
