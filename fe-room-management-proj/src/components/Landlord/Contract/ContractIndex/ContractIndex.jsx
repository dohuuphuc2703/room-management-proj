import { EditOutlined, FilePdfOutlined } from '@ant-design/icons'; // Import icons từ Ant Design
import { Button, Form, Input, message, Modal, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const { Option } = Select;

const ContractIndex = () => {
  const user = useSelector(state => state.userReducer);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [cancelRequestModal, setCancelRequestModal] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [reason, setReason] = useState();
  const [cancelRequestModalVisible, setCancelRequestModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);
  const [total, setTotal] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/contract/byLandlord`, {

          withCredentials: true,
          params: {
            status: statusFilter,
            page,
            size,
          },
        });

        setContracts(res.data.data || []);
        setTotal(res.data.pagination.total || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [statusFilter, page, size]);

  const handleCancelRequest = async (contractId) => {
    setIsSubmitting(true);
    try {
      await axios.post(
        `http://localhost:8000/api/contract/${contractId}/cancel-request`,
        { reason },
        { withCredentials: true }
      );
      message.success("Yêu cầu hủy hợp đồng đã được gửi!");
      setContracts((prev) =>
        prev.map((contract) =>
          contract._id === contractId
            ? { ...contract, cancelRequest: { status: "pending", reason } }
            : contract
        )
      );

    } catch (error) {
      console.error(error);
      message.error("Không thể gửi yêu cầu hủy hợp đồng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCancelModal = (contractId) => {
    setSelectedContractId(contractId);
    setCancelRequestModalVisible(true); 
  };

  const handleCancelModalOk = () => {
    if (reason.trim()) {
      handleCancelRequest(selectedContractId);
      setCancelRequestModalVisible(false);
    } else {
      message.error("Vui lòng nhập lý do hủy.");
    }
  };

  const handleCancelModalCancel = () => {
    setCancelRequestModalVisible(false);
  };

  const handleApproveOrReject = async (contractId, action) => {
    try {
      await axios.put(
        `http://localhost:8000/api/contract/${contractId}/cancel-request/handle`,
        { action },
        { withCredentials: true }
      );
      message.success(
        action === "approve"
          ? "Đã đồng ý hủy hợp đồng!"
          : "Đã từ chối yêu cầu hủy hợp đồng!"
      );
      setContracts((prev) =>
        prev.map((contract) =>
          contract._id === contractId
            ? {
              ...contract,
              status: action === "approve" ? "canceled" : contract.status,
              cancelRequest: {
                ...contract.cancelRequest,
                status: action === "approve" ? "approved" : "rejected",
              },
            }
            : contract
        )
      );
      setCancelRequestModal(false);
    } catch (error) {
      console.error(error);
      message.error(
        action === "approve"
          ? "Không thể đồng ý hủy hợp đồng"
          : "Không thể từ chối yêu cầu hủy hợp đồng"
      );
    }
  };
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };


  const handleCreateContract = () => {
    nav("/landlord/createContract");
  };

  const handleViewPDF = (pdfPath) => {
    // Mở PDF trực tiếp từ đường dẫn
    window.open(pdfPath, "_blank");
  };



  const columns = [
    {
      title: "STT",
      render: (_, __, index) => (page - 1) * size + index + 1,
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
      render: (room) => room?.title?room?.title:"Trống"
    },
    {
      title: "Địa chỉ",
      dataIndex: "room",
      key: "room",
      render: (room) => room?.address.province?room.address.province:"Trống",
    },

    {
      title: "Người thuê",
      dataIndex: "tenant",
      key: "tenant",
      render: (tenant) => tenant?.user.fullName + "-" + tenant?.user.email,
    },
    {
      title: "Số lượng TV",
      dataIndex: "size",
      key: "size",

    },
    {
      title: "Trạng thái",
      render: (text, record) => (
        <span>{record.status === "waiting" ? "Chờ xác nhận" : record.status === "canceled" ? "Đã hủy" : "Đang hiệu lực"}</span>
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
            <Option value="waiting">Chờ xác nhận</Option>
            <Option value="canceled">Đã hủy</Option>
            <Option value="confirmed">Đang hiệu lực</Option>
          </Select>
        </div>
      ),
    },
    {
      title: "Xem PDF",
      render: (text, record) => (
        <Button
          icon={<FilePdfOutlined />} // Sử dụng icon PDF
          onClick={() => handleViewPDF(record.pdfPath)}
          type="primary"
          shape="circle"
        />
      ),
    },
    {
      title: "Hủy hợp đồng",
      render: (text, record) => {
        if (!record.cancelRequest || record.cancelRequest.status === "rejected") {
          return (
            <Button
              type="primary"
              onClick={() => {
                if (record.status === "confirmed") {
                  handleOpenCancelModal(record._id)
                }
              }}
              loading={isSubmitting}
              disabled={record.status !== "confirmed"} 
            >
              Tạo yêu cầu hủy
            </Button>
          );
        }
        if (record.cancelRequest.status === "pending") {
          return (
            <Button
              type="default"
              onClick={() => {
                setSelectedCancelRequest(record.cancelRequest);
                setSelectedContractId(record._id);
                setCancelRequestModal(true);
              }}
            >
              Xem yêu cầu hủy
            </Button>
          );
        }
        return null;
      },
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

      <Modal
        title="Chi tiết yêu cầu hủy"
        visible={cancelRequestModal}
        onCancel={() => setCancelRequestModal(false)}
        footer={user?._id === selectedCancelRequest?.requestedBy._id ? [] : [
          <Button
            key="approve"
            type="primary"
            onClick={() => handleApproveOrReject(selectedContractId, "approve")}
          >
            Đồng ý
          </Button>,
          <Button
            key="reject"
            onClick={() => handleApproveOrReject(selectedContractId, "reject")}
          >
            Từ chối
          </Button>,
        ]}
      >
        <p><strong>Lý do:</strong> {selectedCancelRequest?.reason}</p>
        <p><strong>Người yêu cầu:</strong> {selectedCancelRequest?.requestedBy?.fullName}-{selectedCancelRequest?.requestedBy?.email} </p>
      </Modal>

      <Modal
        title="Nhập lý do hủy hợp đồng"
        visible={cancelRequestModalVisible}
        onOk={handleCancelModalOk}
        onCancel={handleCancelModalCancel}
        confirmLoading={isSubmitting}
      >
        <Form>
          <Form.Item label="Lý do hủy" required>
            <Input.TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hủy hợp đồng"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractIndex;
