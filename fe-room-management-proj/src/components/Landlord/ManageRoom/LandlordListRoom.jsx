import { List, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./LandlordListRoom.module.css";

const { Text } = Typography;

const LandlordListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const landlordId = useSelector(state => state.userReducer)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/room/by-landlord/${landlordId._id}`);
        setRooms(res.data.rooms);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [landlordId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Danh sách phòng của bạn</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={rooms}
          renderItem={(item) => {
            return (
              <List.Item
                key={item._id}
                className={styles.roomItem}
              >
                <div className={styles.roomContent}>
                  <div className={styles.roomDetails}>
                    <Text strong className={styles.price}>
                      {item.title}
                    </Text>
                    <span>Địa chỉ: {item.address.detail}</span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default LandlordListRoom;
