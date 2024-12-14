import { Avatar, Button, List, message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaHeartBroken } from 'react-icons/fa';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ListSavedRooms.module.css";

function ListSavedRooms() {
  const user = useSelector(state => state.userReducer)
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2; // Number of items per page
  const nav = useNavigate();

  const fetchSavedRooms = async (page = 5) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/tenant/all-saved-rooms`, {
        params: { page, limit: pageSize },
        withCredentials: true,
      });
      setSavedRooms(res.data.saveRooms);
      setCurrentPage(res.data.currentPage);
      setLoading(false);
    } catch (error) {
      message.error("Failed to load saved rooms.");
      setLoading(false);
    }
  };

  const handleRemoveSavedRoom = async (roomId) => {
    try {
      await axios.post(`http://localhost:8000/api/tenant/remove-saved-room`, {roomId}, {
        withCredentials: true,
      });
      setSavedRooms(savedRooms.filter(room => room._id !== roomId));
      message.success("Room removed from saved list.");
    } catch (error) {
      message.error("Failed to remove room from saved list");
      console.error(error);
    }
  };
  

  const handleChat = (phone) => {
    window.open(`https://zalo.me/${phone}`, "_blank");
  };

  useEffect(() => {
    fetchSavedRooms(currentPage);
  }, [currentPage]);
  if (!user?.role) { 
      return nav('/login');
    };

  return (
    <div className={styles.savedRoomsContainer}>
      <h2>Phòng đã lưu</h2>
      {loading ? (
        <Spin />
      ) : (
        <>
          <List
            dataSource={savedRooms}
            renderItem={(room) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleChat(room.phone)}
                  >
                    Chat
                  </Button>,
                  <Button
                    type="link"
                    icon={<FaHeartBroken size={20} color="red" />}
                    onClick={() => handleRemoveSavedRoom(room._id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar size={80} shape="square" src={room.images[0] || "logo192.png"} />}
                  title={
                    <>
                      <span
                        className={styles.title_room}
                        onClick={() => {
                          nav(`/detail-room/${room._id}`);
                        }}
                      >
                        {room.title}
                      </span>
                      
                      <div>{`${room.price.toLocaleString()} VND/tháng`}</div>
                    </>
                  }
                  description={
                    <div>
                      {`Địa chỉ: ${room.address.detail}, ${room.address.ward}, ${room.address.district}, ${room.address.province}`}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
}

export default ListSavedRooms;
