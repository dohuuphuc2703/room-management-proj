import { CalendarOutlined, HomeOutlined, LockOutlined, PhoneOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Form, Input, Layout, message, Row, Tabs, Typography  } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "../../../actions";
import styles from "./MyRoom.module.css";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const MyRoom = () => {
    const [loading, setLoading] = useState(false);
    const [roomInfo, setRoomInfo] = useState();
    const [pdfPath, setPdfPath] = useState();

    useEffect(() => {
        const fetchContractInfo = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/contract/byTenant",
                    { withCredentials: true }
                );
                setRoomInfo(response.data.contract.room)
                setPdfPath(response.data.contract.pdfPath)
         
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
                    <Tabs defaultActiveKey="1" tabBarStyle={{ fontWeight: 'bold' }}>
                        <TabPane tab="Thông tin phòng" key="1">
                            <RoomInfoForm  roomInfo={roomInfo}/>
                        </TabPane>
                        <TabPane tab="Hợp đồng" key="2">
                            <Contract pdfPath={pdfPath} />
                        </TabPane>
                        <TabPane tab="Hóa đơn" key="3">
                            <Invoice  loading={loading} />
                        </TabPane>
                        <TabPane tab="Hóa đơn" key="4">
                            <MaintenanceRequest loading={loading} />
                        </TabPane>
                    </Tabs>
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
                        <Text>{roomInfo?.address.detail+", " + roomInfo?.address.ward +", "+roomInfo?.address.district+", " +roomInfo?.address.province || 'N/A'}</Text>
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
    const fullPdfUrl = `http://localhost:8000${pdfPath}`;

    return (
        <div style={{ width: "100%", height: "80vh" }}>
            <iframe
                src={fullPdfUrl}
                title="Contract PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
            />
        </div>
    );
};

const Invoice = ({ onFinish, loading }) => {

    return (
      `d`
    );
};

const MaintenanceRequest = ({ onFinish, loading }) => {
    const [form] = Form.useForm();

    return (
        "d"
    );
};

export default MyRoom;
