import { CalendarOutlined, HomeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Select, Button, Col, Form, Table, Layout, message, Row, Tabs, Typography, Modal } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "../../../actions";
import styles from "./MyRoom.module.css";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;

const MyRoom = () => {
    const [loading, setLoading] = useState(false);
    const [roomInfo, setRoomInfo] = useState();
    const [pdfPath, setPdfPath] = useState();
    const [contractId, setContractId] = useState()
    const [hasContract, setHasContract] = useState(false);
    const [cancelRequest, setCancelRequest] = useState()
    useEffect(() => {
        const fetchContractInfo = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/contract/byTenant",
                    { withCredentials: true }
                );
                if (response.data && response.data.contract) {
                    setRoomInfo(response.data.contract.room);
                    setPdfPath(response.data.contract.pdfPath);
                    setContractId(response.data.contract._id);
                    setHasContract(true);
                    setCancelRequest(response.data.contract.cancelRequest.requestedBy ? response.data.contract.cancelRequest : null);
                } else {
                    setHasContract(false); // Nếu không có hợp đồng, không hiển thị TabPane
                }

            } catch (error) {
                message.error("Error fetching user info");
            }
        };

        fetchContractInfo();
    }, []);

    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <div>
                    {!hasContract ? (
                        <div> Bạn chưa thuê phòng </div> // Hiển thị thông báo nếu không có hợp đồng
                    ) : (
                        <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: 'bold' }}>
                            <TabPane tab="Thông tin phòng" key="1">
                                <RoomInfoForm roomInfo={roomInfo} />
                            </TabPane>
                            <TabPane tab="Hợp đồng" key="2">
                                <Contract pdfPath={pdfPath} />
                            </TabPane>
                            <TabPane tab="Hóa đơn" key="3">
                                <Invoice contractId={contractId} loading={loading} />
                            </TabPane>
                            <TabPane tab="Hủy hợp đồng" key="4">
                                <CancelRequest contractId={contractId} initialCancelRequest={cancelRequest} loading={loading} />
                            </TabPane>
                        </Tabs>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

const RoomInfoForm = ({ roomInfo }) => {
    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Text strong>Tên phòng:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.title || 'N/A'}</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <Text strong>Loại phòng:</Text>
                    <div>
                        <CalendarOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.price || 'N/A'} VND</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <Text strong>Địa chỉ:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.address.detail + ", " + roomInfo?.address.ward + ", " + roomInfo?.address.district + ", " + roomInfo?.address.province || 'N/A'}</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <Text strong>Diện tích:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.acreage || 'N/A'} m²</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <Text strong>Giá phòng:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.price || 'N/A'} VND</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <Text strong>Số người tối đa:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.maxSize || 'N/A'} người</Text>
                    </div>
                </Col>
                <Col span={12}>
                    <Text strong>Điện:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.electric.price || 'N/A'}/{roomInfo?.electric.description || 'N/A'}</Text>
                    </div>
                </Col>
                <Col span={12}>
                    <Text strong>Nước:</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.water.price || 'N/A'}/{roomInfo?.water.description || 'N/A'}</Text>

                    </div>
                </Col>
                <Col span={12}>
                    <Text strong>Dịch vụ khác:</Text>
                    {roomInfo?.servicerooms && roomInfo.servicerooms.length > 0 ? (
                        <div style={{ marginTop: '8px' }}>
                            {roomInfo.servicerooms.map((service, index) => (
                                <div key={service._id || index} style={{ marginBottom: '8px' }}>
                                    <HomeOutlined style={{ marginRight: '8px' }} />
                                    <Text>
                                        {service.name} - {service.price} VND ({service.description || 'Không có mô tả'})
                                    </Text>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text style={{ display: 'block', marginTop: '8px' }}>Không có dịch vụ nào</Text>
                    )}
                </Col>
                <Col span={12}>
                    <Text strong>Các tiện ích:</Text>
                    {roomInfo?.amenities && roomInfo.amenities.length > 0 ? (
                        <div style={{ marginTop: '8px' }}>
                            {roomInfo.amenities.map((amenitie, index) => (
                                <div key={amenitie._id || index} style={{ marginBottom: '8px' }}>
                                    <HomeOutlined style={{ marginRight: '8px' }} />
                                    <Text>
                                        {amenitie}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text style={{ display: 'block', marginTop: '8px' }}>Không có dịch vụ nào</Text>
                    )}
                </Col>
                <Col span={16}>
                    <Text strong>Mô tả :</Text>
                    <div>
                        <HomeOutlined style={{ marginRight: '8px' }} />
                        <Text>{roomInfo?.description || 'N/A'}</Text>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const Contract = ({ pdfPath }) => {

    return (
        <div style={{ width: "100%", height: "80vh" }}>
            <iframe
                src={pdfPath}
                title="Contract PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
            />
        </div>
    );
};

const Invoice = ({ contractId, loading }) => {
    const [invoices, setInvoices] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const fetchInvoices = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/invoice/byContract",
                {
                    params: {
                        status: statusFilter,
                        contractId: contractId,
                    },
                    withCredentials: true
                }
            );
            setInvoices(response.data);
        } catch (error) {
            message.error("Lỗi khi tải hóa đơn");
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [contractId, statusFilter]);

    const handleStatusChange = (value) => {
        setStatusFilter(value === "" ? null : value === "true");
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
            title: "Tổng tiền",
            dataIndex: "total",
            key: "total",
        },
        {
            title: "Trạng thái",
            render: (text, record) => (
                <span>
                    {record.status ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
            ),
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Select
                        value={statusFilter === null ? "" : String(statusFilter)}
                        onChange={handleStatusChange}
                        placeholder="Lọc theo trạng thái"
                        style={{ width: 188 }}
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="false">Chưa thanh toán</Option>
                        <Option value="true">Đã thanh toán</Option>
                    </Select>
                </div>
            ),
        },
        {
            title: "Action",
            render: (text, record) => (
                <Button
                    icon={<FilePdfOutlined />}
                    type="primary"
                    shape="circle"
                    onClick={() => handleViewInvoice(record)}
                />
            ),
        },
    ];

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalVisible(true);
        setQrCodeData(null); // reset qrCodeData khi mở modal
        generateQRCode(invoice); // tự động tạo mã QR khi mở modal
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedInvoice(null);
        setQrCodeData(null);
    };

    const handlePayment = async () => {
        setIsPaymentProcessing(true);
        try {
            message.success("Thanh toán thành công!");
        } catch (error) {
            message.error("Lỗi khi thanh toán");
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    const generateQRCode = async (invoice) => {
        try {
            const qrData = {
                accountNo: 113366668888,
                accountName: "QUY VAC XIN PHONG CHONG COVID",
                acqId: 970415,
                amount: invoice.total,
                addInfo: invoice.title,
                format: "text",
                template: "print"
            };

            const response = await axios.post("https://api.vietqr.io/v2/generate", qrData);

            if (response.data && response.data.data.qrDataURL) {
                setQrCodeData(response.data.data.qrDataURL);
            } else {
                message.error("Không thể tạo mã QR");
            }
        } catch (error) {
            message.error("Lỗi khi tạo mã QR");
        }
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={invoices}
                loading={loading}
                rowKey="_id"
                pagination={false}
            />

            <Modal
                title="Chi tiết hóa đơn"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="back" onClick={handleCloseModal}>
                        Đóng
                    </Button>,
                    <Button
                        key="payment"
                        type="primary"
                        onClick={handlePayment}
                        loading={isPaymentProcessing}
                    >
                        Thanh toán
                    </Button>,
                ]}

                width="70%"
                className={styles.modal}
            >
                {selectedInvoice && (
                    <div className={styles.modalContent}>
                        <div className={styles.invoiceInfo}>
                            <p><strong>Tiêu đề:</strong> {selectedInvoice.title}</p>
                            <div>
                                <strong>Danh sách dịch vụ:</strong>
                                <Table
                                    columns={[
                                        { title: "STT", render: (_, __, index) => index + 1 },
                                        { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
                                        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                                        { title: "Tổng tiền", dataIndex: "totalAmount", key: "totalAmount" },
                                    ]}
                                    dataSource={selectedInvoice.totalOfSv}
                                    pagination={false}
                                    rowKey="_id"
                                />
                            </div>
                            <p><strong>Tổng tiền:</strong> {selectedInvoice.total}</p>
                            <p><strong>Trạng thái:</strong> {selectedInvoice.status ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                        </div>

                        {/* Hiển thị mã QR bên phải thông tin hóa đơn */}
                        {qrCodeData && (
                            <div className={styles.qrContainer}>
                                <img src={qrCodeData} alt="QR Code" className={styles.qrCode} />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};


const CancelRequest = ({ contractId, initialCancelRequest, loading }) => {
    const [cancelRequest, setCancelRequest] = useState(initialCancelRequest); // Nhận cancelRequest từ prop
    const [reason, setReason] = useState(""); // Lý do hủy
    const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi yêu cầu

    const handleCancelRequest = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(
                `http://localhost:8000/api/contract/${contractId}/cancel-request`,
                { reason },
                { withCredentials: true }
            );
            message.success("Yêu cầu hủy hợp đồng đã được gửi!");
            setReason(""); // Reset lý do

            // Cập nhật trạng thái yêu cầu hủy
            setCancelRequest({
                ...cancelRequest,
                reason,
                status: "pending",
            });
        } catch (error) {
            message.error("Không thể gửi yêu cầu hủy hợp đồng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveOrReject = async (action) => {
        try {
            const response = await axios.put(
                `http://localhost:8000/api/contract/${contractId}/cancel-request/handle`,
                { action }, // action là "approve" hoặc "reject"
                { withCredentials: true }
            );

            if (response.data && response.data.success) {
                message.success(
                    action === "approve"
                        ? "Đã đồng ý hủy hợp đồng!"
                        : "Đã từ chối yêu cầu hủy hợp đồng!"
                );

                // Cập nhật trạng thái sau khi xử lý
                setCancelRequest((prev) => ({
                    ...prev,
                    status: action === "approve" ? "approved" : "rejected",
                }));
            }
        } catch (error) {
            message.error(
                action === "approve"
                    ? "Không thể đồng ý hủy hợp đồng"
                    : "Không thể từ chối yêu cầu hủy hợp đồng"
            );
        }
    };

    const columns = [
        {
            title: 'Người yêu cầu',
            dataIndex: 'requestedBy',
            key: 'requestedBy',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: (text) => text || 'Không có lý do',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span
                    style={{
                        color:
                            status === "approved"
                                ? "green"
                                : status === "rejected"
                                    ? "red"
                                    : "orange",
                    }}
                >
                    {status === "pending"
                        ? "Đang chờ xử lý"
                        : status === "approved"
                            ? "Đã được phê duyệt"
                            : "Đã bị từ chối"}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                cancelRequest && cancelRequest.status === "pending" ? (
                    <div className={styles.actionButtons}>
                        <Button
                            type="primary"
                            onClick={() => handleApproveOrReject("approve")}
                            loading={loading}
                        >
                            Đồng ý hủy
                        </Button>
                        <Button
                            type="default"
                            onClick={() => handleApproveOrReject("reject")}
                            loading={loading}
                        >
                            Từ chối hủy
                        </Button>
                    </div>
                ) : null
            ),
        },
    ];

    return (
        <div>
            {!cancelRequest ? (
                <div>
                    <Title level={4}>Yêu cầu hủy hợp đồng</Title>
                    <Form layout="vertical">
                        <Form.Item label="Lý do hủy hợp đồng">
                            <textarea
                                className={styles.textarea}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Nhập lý do hủy hợp đồng..."
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            onClick={handleCancelRequest}
                            loading={isSubmitting}
                            disabled={!reason.trim()}
                        >
                            Gửi yêu cầu hủy
                        </Button>
                    </Form>
                </div>
            ) : (
                <div>
                    <Table
                        columns={columns}
                        dataSource={cancelRequest ? [cancelRequest] : []}
                        pagination={false}
                        bordered
                        size="middle"
                    />
                </div>
            )}
        </div>
    );
};



export default MyRoom;
