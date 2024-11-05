import { HeartFilled } from "@ant-design/icons";
import { Avatar, Button, List, message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./ListSavedRooms.module.css";

function ListSavedRooms() {
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedRooms = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/tenant/all-saved-rooms`, {
        withCredentials: true,
      });
      setSavedRooms(res.data.saveRooms.saveRooms);
      setLoading(false);
    } catch (error) {
      message.error("Failed to load saved rooms.");
      setLoading(false);
    }
  };

  const handleRemoveRoom = async (roomId) => {
    try {
      await axios.post(`http://localhost:8000/api/tenant/remove-saved-room/${roomId}`, {
        withCredentials: true,
      });
      setSavedRooms(savedRooms.savedRooms.filter(room => room._id !== roomId));
      message.success("Room removed from saved list.");
    } catch (error) {
      message.error("Failed to remove room from saved list.");
    }
  };

  const handleChat = (phone) => {
    window.open(`https://zalo.me/${phone}`, "_blank");
  };

  useEffect(() => {
    fetchSavedRooms();
  }, []);

  return (
    <div className={styles.savedRoomsContainer}>
      <h2>Phòng đã lưu</h2>
      {loading ? (
        <Spin />
      ) : (
        <List
          dataSource={savedRooms}
          renderItem={room => (
            <List.Item
              actions={[
                <Button type="primary" onClick={() => handleChat(room.contactPhone)}>
                  Chat
                </Button>,
                <Button
                  type="link"
                  icon={<HeartFilled style={{ color: "red" }} />}
                  onClick={() => handleRemoveRoom(room._id)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={room.images[0] || "logo192.png"} />}
                title={room.title}
                description={`${room.price} - ${room.address}`}
              />
            </List.Item>
          )}
        />
      )
    }
    </div>
  );
}

export default ListSavedRooms;
