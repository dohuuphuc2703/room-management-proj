import { StarOutlined, StarFilled } from "@ant-design/icons";
import { Avatar, List, Space, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ListRoom.module.css";

const { Text } = Typography;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

// Hàm tạo ngôi sao dựa trên rating
const renderStars = (rating) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      // Sao đầy đủ cho mỗi giá trị nguyên của rating
      stars.push(
        <StarFilled
          key={i}
          style={{ color: 'rgb(250, 219, 20)', fontSize: '16px' }}
        />
      );
    } else if (i - rating <= 0.5) {
      // Nửa sao khi rating có giá trị thập phân >= .5
      stars.push(
        <StarFilled
          key={i}
          style={{
            color: 'rgb(250, 219, 20)',
            fontSize: '16px',
            clipPath: 'inset(0 50% 0 0)', // Cắt nửa sao bằng CSS
          }}
        />
      );
    } else {
      // Sao rỗng nếu rating thấp hơn vị trí này
      stars.push(
        <StarOutlined
          key={i}
          style={{ color: '#eaeaea', fontSize: '16px' }}
        />
      );
    }
  }

  return stars;
};


// Function to calculate the time difference
const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return `${interval} năm trước`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} tháng trước`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} ngày trước`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} giờ trước`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} phút trước`;
  return `Vừa xong`;
};


const ListRoom = ({
  handleSearchRoom,
  isSearch,
  page,
  rooms,
  setRooms,
  setPage,

  pageSize,
  setPageSize,
  totalItems,
  setTotalItems,
  messageApi,
}) => {
  const nav = useNavigate();
  const user = useSelector((state) => state.userReducer); // To hold all rooms
  const [featuredRooms, setFeaturedRooms] = useState([]); // Top-rated rooms
  const [latestRooms, setLatestRooms] = useState([]); // Latest rooms

  const getRoomsSuggestion = async (page = 1, pageSize = 3) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/room/suggestion?page=${page}&size=${pageSize}`,
        { withCredentials: true }
      );
      const data = await res.data;
      setRooms(data.rooms);
      setTotalItems(data.info.total);
      setPage(data.info.page);
      setPageSize(data.info.size);
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };

  // Function to get top-rated rooms
  const getTopRatedRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/room/top-rated");
      const data = await res.data;
      setFeaturedRooms(data.rooms);
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };

  // Function to get latest rooms
  const getLatestRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/room/latest");
      const data = await res.data;
      setLatestRooms(data.rooms);
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };

  useEffect(() => {
    getRoomsSuggestion();
    getTopRatedRooms();
    getLatestRooms();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalItems,
            onChange: async (page, pageSize) => {
              if (isSearch) await handleSearchRoom(page, pageSize);
              else await getRoomsSuggestion(page, pageSize);
            },
          }}
          dataSource={rooms}
          renderItem={(item) => {
            const landlord = item.landlord;
            return (
              <List.Item
                key={item.title}
                className={styles.roomItem}
              >
                <div className={styles.roomContent}>
                  <img
                    src={item.images[0] || "/logo512.png"}
                    alt="room"
                    onClick={() => {
                      nav(`/detail-room/${item._id}`);
                    }}
                    className={styles.roomImage}
                  />
                  <div className={styles.roomDetails}>
                    <List.Item.Meta

                      title={
                        <span
                          className={styles.title_room}
                          onClick={() => {
                            nav(`/detail-room/${item._id}`);
                          }}
                        >
                          {renderStars(item.rating)}{item.title}
                        </span>
                      }
                      description={<Text type="secondary">{landlord.introduction}</Text>}
                    />
                    <Text strong className={styles.price}>
                      Giá: {item.price.toLocaleString()}VNĐ/Tháng
                    </Text>
                    <Text className={styles.area}>
                      Diện tích: {item.acreage}m²
                    </Text>
                    <p>Địa chỉ: {item.address.detail}, {item.address.ward}, {item.address.district}, {item.address.province}</p>
                    Chủ phòng: {item.landlord.fullName}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      <div className={styles.sidebar}>
        {/* Featured Section */}
        <div className={styles.featuredSection}>
          <h3>Tin nổi bật</h3>
          <div className={styles.featuredList}>
            {/* Featured Items */}
            {featuredRooms.map((item, index) => (
              <div className={styles.featuredItem} key={index}
                onClick={() => {
                  nav(`/detail-room/${item._id}`);
                }}>
                <img src={item.images[0] || "/logo192.png"} alt="Featured room" className={styles.featuredImage} />
                <div className={styles.featuredDetails}>
                  <Text className={styles.featuredTitle}>{renderStars(item.rating)}{item.title}</Text>
                  <div className={styles.featuredInfo}>
                    <Text className={styles.featuredPrice}>Giá: {item.price.toLocaleString()}</Text>
                    <Text className={styles.featuredTime}>{timeAgo(item.createdAt)}</Text> {/* Update to show time since creation */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Section */}
        <div className={styles.latestSection}>
          <h3>Tin mới nhất</h3>
          <div className={styles.latestList}>
            {/* Latest Items */}
            {latestRooms.map((item, index) => (
              <div className={styles.latestItem} key={index}
                onClick={() => {
                  nav(`/detail-room/${item._id}`);
                }}>
                <img src={item.images[0] || "/logo192.png"} alt="Latest room" className={styles.featuredImage} />
                <div className={styles.latestDetails}>
                  <Text className={styles.latestTitle}>{item.title}</Text>
                  <div className={styles.latestInfo}>
                    <Text className={styles.latestPrice}>Giá: {item.price.toLocaleString()}</Text>
                    <Text className={styles.latestTime}>{timeAgo(item.createdAt)}</Text> {/* Update to show time since creation */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListRoom;
