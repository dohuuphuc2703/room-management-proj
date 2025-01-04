import { Card, Col, message, Row, Select, Table } from "antd";
import axios from "axios";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import styles from './Statistical.module.css';

const { Option } = Select;

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const Statistical = () => {
  const [stats, setStats] = useState({
    roomStatus: 0,
    roomAvailable: 0,
    emptyRooms: [],
    revenue: [],  // Doanh thu mặc định (có thể thay thế bằng giá trị từ API)
    unpaidInvoices: [],
  });
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearlyRevenue, setYearlyRevenue] = useState(stats.revenue);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/landlord/statistics", {
          withCredentials: true,
        });
        setStats({
          roomStatus: data.statusStats.rented || 0,
          roomAvailable: data.statusStats.available || 0,
          emptyRooms: data.roomsAvailable || [],
          unpaidInvoices: data.invoicesFalse || [],
        });
      } catch (error) {
        message.error("Failed to fetch statistics:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const revenueData = await axios.get(`http://localhost:8000/api/landlord/revenueStats?year=${selectedYear}`, {
          withCredentials: true,
        });

        // Chỉnh sửa dữ liệu doanh thu theo tháng để phù hợp với biểu đồ
        const revenueByMonth = revenueData.data.revenueStats.map(item => item.totalRevenue);

        setYearlyRevenue(revenueByMonth);
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
      }
    };

    fetchRevenue();
  }, [selectedYear]); // Chỉ gọi khi năm thay đổi

  const columnsRooms = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,  // Hiển thị số thứ tự
    },
    {
      title: "Phòng",
      dataIndex: "title",
      key: "title",
      render: (text, record) => record.title || "N/A",  // Hiển thị tên phòng, sử dụng record thay vì room
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text, record) =>
        record.address ?
          `${record.address.detail}, ${record.address.ward}, ${record.address.district}, ${record.address.province}` :
          "N/A",  // Hiển thị địa chỉ phòng nếu có
    },
  ];

  const columnsInvoices = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,  // Hiển thị số thứ tự
    },
    {
      title: "Phòng",
      dataIndex: "contract",
      key: "room",
      render: (contract) => contract.room.title || "Chưa có tên phòng", // Hiển thị tên phòng
    },
    {
      title: "Khách",
      dataIndex: "contract",
      key: "tenant",
      render: (contract) => contract.tenant?.user?.fullName || "Không có thông tin khách",  // Hiển thị tên khách
    },
    {
      title: "Tháng",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => {
        if (!createdAt) return "N/A";
        const date = new Date(createdAt);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${year}`;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => total.toLocaleString() + " ₫",
    },
  ];

  return (
    <div className="main-content">
      <Row gutter={[16, 16]} className={styles.row}>
        <Col span={12}>
          <Card title="Trạng thái phòng" className={styles.card}>
            <Pie
              data={{
                labels: ["Phòng đã cho thuê", "Phòng trống"],
                datasets: [
                  {
                    data: [stats.roomStatus, stats.roomAvailable],
                    backgroundColor: ["#36A2EB", "#FF6384"],
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: false,
                plugins: { legend: { position: "left" } },
              }}
              height={300}
              width={500}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Row justify="space-between" align="middle">
                <Col>
                  <span style={{ fontWeight: 'bold', fontSize: 16 }}>Doanh thu</span>
                </Col>
                <Col>
                  <Select
                    defaultValue={selectedYear}
                    onChange={(value) => {
                      setSelectedYear(value); // Cập nhật năm đã chọn
                    }}
                    style={{ width: 120 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Option key={currentYear - i} value={currentYear - i}>
                        {currentYear - i}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            }
            className={styles.card}
          >
            <Bar
              data={{
                labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                datasets: [
                  {
                    label: "Doanh thu(₫)",
                    data: yearlyRevenue,  // Dữ liệu doanh thu theo tháng
                    backgroundColor: "#36A2EB",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: true, position: "top" } },
                scales: {
                  x: { title: { display: true, text: "Tháng" } },
                  y: {
                    title: { display: true, text: "Doanh thu (₫)" },
                    ticks: { callback: (value) => value.toLocaleString() },
                  },
                },
              }}
              height={160}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Danh sách phòng trống" className={styles.card}>
            <Table
              dataSource={stats.emptyRooms}
              columns={columnsRooms}
              pagination={false}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Hóa đơn chưa thanh toán" className={styles.card}>
            <Table
              dataSource={stats.unpaidInvoices}
              columns={columnsInvoices}
              pagination={false}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistical;
