import { LikeOutlined, StarOutlined } from "@ant-design/icons";
import { Avatar, List, Space, Typography } from "antd";
import axios from "axios";
import React, { useEffect } from "react";
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

const ListRoom = ({
  handleSearchRoom,
  isSearch,
  rooms,
  setRooms,
  messageApi,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  setTotalItems,
}) => {
  const nav = useNavigate();
  const user = useSelector((state) => state.userReducer);

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

  useEffect(() => {
    getRoomsSuggestion();
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
                actions={[
                  <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                  <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                ]}
              >
                <div className={styles.roomContent}>
                  <img
                    src={item.image || "/logo512.png"}
                    alt="room"
                    className={styles.roomImage}
                  />
                  <div className={styles.roomDetails}>
                    <List.Item.Meta
                      avatar={<Avatar src={landlord.avatar || "https://www.w3schools.com/howto/img_avatar.png"} />}
                      title={
                        <span
                          className={styles.title_room}
                          onClick={() => {
                            nav(user.role ? `/user/view-detail-room/${item._id}` : `/view-detail-room/${item._id}`);
                          }}
                        >
                          {item.title}
                        </span>
                      }
                      description={<Text type="secondary">{landlord.introduction}</Text>}
                    />
                    <Text strong className={styles.price}>
                      Giá: {item.price}
                    </Text>
                    <Text className={styles.area}>
                      Diện tích: 30m²
                    </Text>
                    <p>Địa chỉ: {item.address[0].detail}, {item.address[0].ward}, {item.address[0].district}, {item.address[0].province}</p>
                    Chủ phòng: {item.landlord.name}
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
      {rooms.map((item, index) => (
        <div className={styles.featuredItem} key={index}>
          <img src={item.image || "/logo192.png"} alt="Featured room" className={styles.featuredImage} />
          <div className={styles.featuredDetails}>
            <Text className={styles.featuredTitle}>{item.title}</Text>
            <div className={styles.featuredInfo}>
              <Text className={styles.featuredPrice}>Giá: {item.price}</Text>
              <Text className={styles.featuredTime}>2 giờ trước</Text>
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
      {rooms.map((item, index) => (
        <div className={styles.latestItem} key={index}>
          <img src={item.image || "/logo192.png"} alt="Latest room" className={styles.featuredImage} />
          <div className={styles.latestDetails}>
            <Text className={styles.latestTitle}>{item.title}</Text>
            <div className={styles.latestInfo}>
              <Text className={styles.latestPrice}>Giá: {item.price}</Text>
              <Text className={styles.latestTime}>2 giờ trước</Text>
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
