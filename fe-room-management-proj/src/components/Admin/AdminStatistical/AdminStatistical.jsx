import { Card, Col, Row, Select } from "antd";
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
import styles from './AdminStatistical.module.css';

const { Option } = Select;

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, LineElement, PointElement);

const AdminStatistical = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyTenants, setMonthlyTenants] = useState([]);
  const [monthlyLandlords, setMonthlyLandlords] = useState([]);
  const [monthlyRooms, setMonthlyRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantResponse, landlordResponse, roomResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/admin/tenant-stats?year=${selectedYear}`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/admin/landlord-stats?year=${selectedYear}`, { withCredentials: true }),
          axios.get(`http://localhost:8000/api/admin/room-stats?year=${selectedYear}`, { withCredentials: true }),
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
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [selectedYear]);

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
                    defaultValue={selectedYear}
                    onChange={(value) => setSelectedYear(value)}
                    style={{ width: 120 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Option key={2020 + i} value={2020 + i}>
                        {2020 + i}
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
                    defaultValue={selectedYear}
                    onChange={(value) => setSelectedYear(value)}
                    style={{ width: 120 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Option key={2020 + i} value={2020 + i}>
                        {2020 + i}
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