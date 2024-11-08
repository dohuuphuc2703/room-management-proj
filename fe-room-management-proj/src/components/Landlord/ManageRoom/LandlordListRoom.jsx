import { Button, Card } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandlordListRoom.module.css';

const LandlordListRoom = ({user}) => {
  const [rooms, setRooms] = useState([]);
  //const landlordId = useSelector((state) => state.user.landlordId); // Assuming landlordId is stored in Redux state

  useEffect(() => {
    // Fetch the rooms of the logged-in landlord
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/room/by-landlord/${user}`);
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    if (user) {
      fetchRooms();
    }
  }, [user]);
  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`/api/landlord/room/${roomId}`);
      setRooms(rooms.filter((room) => room._id !== roomId)); // Remove the deleted room from the state
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Danh sách phòng của bạn</h2>
      <div className={styles.roomList}>
        {rooms.length === 0 ? (
          <p>Chưa có phòng nào được đăng.</p>
        ) : (
          rooms.map((room) => (
            <Card
              key={room._id}
              hoverable
              cover={<img alt={room.name} src={room.image[0]} />}
              className={styles.roomCard}
            >
              <Card.Meta
                title={room.name}
                description={`Diện tích: ${room.size} m², Giá: ${room.price} VND`}
              />
              <div className={styles.cardActions}>
                <Link to={`/room/${room._id}`}>
                  <Button type="primary">Xem chi tiết</Button>
                </Link>
                <Button type="danger" onClick={() => handleDeleteRoom(room._id)}>
                  Xóa phòng
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LandlordListRoom;
