import { Card, Col, message, Row, Select } from "antd";
import axios from "axios";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import styles from './AdminStatistical.module.css';
const { Option } = Select;

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, LineElement, PointElement);

const AdminStatistical = () => {
  const admin = useSelector(state => state.userReducer);
  const currentYear = new Date().getFullYear();
  const [selectedYear1, setSelectedYear1] = useState(currentYear);
  const [selectedYear2, setSelectedYear2] = useState(currentYear);
  const [monthlyTenants, setMonthlyTenants] = useState([]);
  const [monthlyLandlords, setMonthlyLandlords] = useState([]);
  const [monthlyRooms, setMonthlyRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantResponse, landlordResponse, roomResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/admin/tenant-stats?year=${selectedYear1}`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/admin/landlord-stats?year=${selectedYear1}`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/admin/room-stats?year=${selectedYear2}`, { withCredentials: true }),
        ]);

        const tenantCountByMonth = Array(12).fill(0);
        tenantResponse.data.data.forEach(item => {
          tenantCountByMonth[item.month - 1] = item.count;
        });
        setMonthlyTenants(tenantCountByMonth);

        const landlordCountByMonth = Array(12).fill(0);
        landlordResponse.data.data.forEach(item => {
          landlordCountByMonth[item.month - 1] = item.count;
        });
        setMonthlyLandlords(landlordCountByMonth);

        const roomCountByMonth = Array(12).fill(0);
        roomResponse.data.data.forEach(item => {
          roomCountByMonth[item.month - 1] = item.count;
        });
        setMonthlyRooms(roomCountByMonth);
      } catch (error) {
        message.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [selectedYear1, selectedYear2]);
  
  return (
    <div className="main-content">
      <Row gutter={[16, 16]} className={styles.row}>
        <Col span={12}>
          <Card
            title={
              <Row justify="space-between" align="middle">
                <Col>
                  <span style={{ fontWeight: 'bold', fontSize: 16 }}>Thống kê khách hàng và chủ phòng mới</span>
                </Col>
                <Col>
                  <Select
                    defaultValue={selectedYear1}
                    onChange={(value) => setSelectedYear1(value)}
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
            <Line
              data={{
                labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
                datasets: [
                  {
                    label: "Số lượng tenant",
                    data: monthlyTenants,
                    borderColor: "#36A2EB",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    fill: true,
                    tension: 0.1,
                  },
                  {
                    label: "Số lượng landlord",
                    data: monthlyLandlords,
                    borderColor: "#FF6384",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    fill: true,
                    tension: 0.1,
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
                    title: { display: true, text: "Số lượng mới" },
                    ticks: { stepSize: 1 },
                  },
                },
              }}
              height={160}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Row justify="space-between" align="middle">
                <Col>
                  <span style={{ fontWeight: 'bold', fontSize: 16 }}>Thống kê phòng mới</span>
                </Col>
                <Col>
                  <Select
                    defaultValue={selectedYear2}
                    onChange={(value) => setSelectedYear2(value)}
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
            <Line
              data={{
                labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
                datasets: [
                  {
                    label: "Số lượng phòng",
                    data: monthlyRooms,
                    borderColor: "#36A2EB",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    fill: true,
                    tension: 0.1,
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
                    title: { display: true, text: "Số lượng mới" },
                    ticks: { stepSize: 1 },
                  },
                },
              }}
              height={160}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminStatistical;