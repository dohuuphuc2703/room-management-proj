import { DeleteOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Button, message, Modal, Popconfirm, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InvoiceIndex.module.css";
const { Option } = Select;

const InvoiceIndex = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null); // Bộ lọc trạng thái hóa đơn
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Hóa đơn được chọn để xem chi tiết
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/invoice/allInvoice`,
          {
            withCredentials: true,
            params: {
              status: statusFilter,
              page,
              size,
            },
          }
        );
        setInvoices(res.data.data || []);
        setTotal(res.data.pagination.total || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/invoice/delete/${invoiceId}`,
        {
          withCredentials: true,
        }
      );
      message.success("Hóa đơn đã được xóa.");
      setInvoices(invoices?.filter((invoice) => invoice._id !== invoiceId));
    } catch (error) {
      console.error(error);
      message.error("Xóa hóa đơn thất bại.");
    }
  };

  const handleViewInvoice = (invoiceId) => {
    // Lấy chi tiết hóa đơn từ API và hiển thị trong modal
    const selected = invoices.find((invoice) => invoice._id === invoiceId);
    setSelectedInvoice(selected);
    setIsModalVisible(true); // Mở modal
  };

  const handleNewInvoice = () => {
    nav("/landlord/newInvoice");
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPage(1);
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => (page - 1) * size + index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => `${total.toLocaleString()} VNĐ`,
    },
    {
      title: "Trạng thái",
      render: (text, record) => (
        <span>{record.status ? "Đã thanh toán" : "Chưa thanh toán"}</span>
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
            <Option value={null}>Tất cả</Option>
            <Option value={true}>Đã thanh toán</Option>
            <Option value={false}>Chưa thanh toán</Option>
          </Select>
        </div>
      ),
    },
    {
      title: "Xem",
      render: (text, record) => (
        <Button
          icon={<FilePdfOutlined />}
          onClick={() => handleViewInvoice(record._id)}
          type="primary"
          shape="circle"
        />
      ),
    },
    {
      title: "Xóa",
      render: (text, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa hóa đơn này không?"
          onConfirm={() => handleDeleteInvoice(record._id)}
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
        onClick={handleNewInvoice}
        style={{ marginBottom: 16 }}
      >
        Tạo hóa đơn mới
      </Button>
      <Table
        columns={columns}
        dataSource={invoices?.filter((invoice) => {
          if (statusFilter === null) return true; 
          return invoice.status === statusFilter;
        })}
        rowKey="_id"
        loading={loading}
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
      {selectedInvoice && (
        <Modal
          title="Chi tiết hóa đơn"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          className={styles.invoiceModal}
        >
          <h3>Thông tin hợp đồng</h3>
          <p><strong>Người thuê:</strong> {selectedInvoice.contract.tenant?.user?.fullName}</p>
          <p><strong>Email:</strong> {selectedInvoice.contract.tenant.user.email}</p>
          <p><strong>Số điện thoại:</strong> {selectedInvoice.contract.tenant.user.phone}</p>
          <h4>Phòng: {selectedInvoice.contract.room.title}</h4>
          <h4>Thành viên trong phòng:</h4>
          <ul>
            {selectedInvoice.contract.members.map((member, index) => (
              <li key={index}>
                {member.memberName} - {member.memberPhone}
              </li>
            ))}
          </ul>
          <h4>Các khoản thanh toán chi tiết:</h4>
          <ul>
            {selectedInvoice.totalOfSv.map((item, index) => (
              <li key={index}>
                {item.name}: {item.totalAmount.toLocaleString()} VNĐ (Số lượng: {item.quantity})
              </li>
            ))}
          </ul>
          <h2><strong>Tổng tiền:</strong> {selectedInvoice.total.toLocaleString()} VNĐ</h2>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceIndex;
