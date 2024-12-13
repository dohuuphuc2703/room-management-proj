import { HeartOutlined, LeftOutlined, MessageOutlined, PhoneOutlined, RightOutlined, StarFilled, StarOutlined, WechatOutlined } from "@ant-design/icons";
import { Avatar, Button, Carousel, Space, Typography, message, notification } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ListReviewRoom from "../ListReviewRoom/ListReviewRoom";
import styles from "./RoomDetail.module.css";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import ReviewRoom from "../ReviewRoom/ReviewRoom";

// Thiết lập lại hình ảnh marker mặc định
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const { Text } = Typography;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

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

const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} năm trước`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} tháng trước`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} ngày trước`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} giờ trước`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} phút trước`;
  return `Vừa xong`;
};

function RoomDetail() {
  const user = useSelector((state) => state.userReducer);
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [roomByAddress, setRoomByAddress] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [landlord, setLandlord] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const nav = useNavigate();

  const handleReviewSubmit = async (review) => {
    try {
      await axios.post(`http://localhost:8000/api/review/create`, review, {
        withCredentials: true,
      });
      messageApi.success("Đánh giá đã được gửi!");
    } catch (err) {
      messageApi.error(`Thông báo. ${err.response?.data.message || ""}`);
    }
  };

  const getCoordinates = async (address) => {
    try {
      const { province, district, ward, detail } = address;
      const fullAddress = `${detail}, ${ward}, ${district}, ${province}`;
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const location = res.data[0];
      if (location) {
        setCoordinates({ lat: parseFloat(location.lat), lng: parseFloat(location.lon) });
      } else {
        messageApi.error("Không tìm thấy tọa độ cho địa chỉ này.");
      }
    } catch (error) {
      console.error(error);
      messageApi.error("Có lỗi xảy ra khi lấy tọa độ.");
    }
  };

  const getDetailRoomInfo = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/room/info/${roomId}`, {
        withCredentials: true,
      });
      const data = res.data;
      setRoomInfo(data.info);
      setLandlord(data.info.landlord.user);
      setAverageRating(data.info.rating);
      if (data.info && data.info.address) {
        await getCoordinates(data.info.address);
        await getRoomByAddress(data.info.address.province, data.info.address.district, data.info.category._id);
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };

  const getRoomByAddress = async (province, district, category) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/room/byAddress?province=${province}&district=${district}&category=${category}`);
      const data = res.data;
      setRoomByAddress(data.rooms);
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };
  const handleFavoriteRoom = async () => {
    setIsFavorite(!isFavorite);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
    if (!user || !user.role) {
      // Hiển thị thông báo nếu người dùng chưa đăng nhập
      notification.warning({
        message: 'Bạn cần đăng nhập trước',
        description: 'Hãy đăng nhập để thêm phòng vào danh sách yêu thích.',
        placement: 'topRight', // Vị trí thông báo ở góc trên bên phải
      });

      // Điều hướng về trang đăng nhập sau khi thông báo
      setTimeout(() => {
        nav('/login');
      }, 2000); // Sau 2 giây, chuyển hướng đến trang đăng nhập

      return;  // Dừng việc thêm vào yêu thích nếu chưa đăng nhập
    }
    try {
      const response = await axios.post('http://localhost:8000/api/tenant/save-room', { roomId },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        messageApi.success('Phòng đã được lưu thành công');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        messageApi.warning('Phòng này đã được lưu trước đó');
      } else {
        messageApi.error('Đã xảy ra lỗi khi lưu phòng');
      }
    }
  };

  const handleZaloMessage = (phone) => {
    const zaloLink = `https://zalo.me/${phone}`;
    window.open(zaloLink, "_blank");
  };

  const handleDirectMessage = () => {
    if (!user || !user.role) {
      notification.warning({
        message: 'Bạn cần đăng nhập trước',
        description: 'Hãy đăng nhập để sử dụng tính năng nhắn tin.',
      });
      setTimeout(() => nav('/login'), 2000);
      return;
    }
    // Điều hướng đến giao diện chat với landlordId
    nav(`/chat`, {
      state: { landlord },
    });
  };
  
  useEffect(() => {
    getDetailRoomInfo();
    // getRoomByAddress();
  }, [roomId]);



  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.mainContent}>
        {roomInfo && (
          <>
            <div className={styles.carouselContainer}>
              <Carousel
                arrows
                prevArrow={<Button icon={<LeftOutlined />} />}
                nextArrow={<Button icon={<RightOutlined />} />}
                dots
              >
                {roomInfo.images &&
                  roomInfo.images.map((img, index) => (
                    <div key={index}>
                      <img
                        src={img} 
                        alt={`Room image ${index + 1}`}
                        className={styles.roomImage}
                      />
                    </div>
                  ))}
              </Carousel>
            </div>

            <div className={styles.textContent}>
              <p className={styles.roomTitle}>{roomInfo.title}</p>
              <Button className={styles.favoriteRoom}
                type="link"
                block
                onClick= {handleFavoriteRoom}
              >
                {<HeartOutlined />}Yêu thích
              </Button>
              <p className={styles.roomAddress}>
                <span role="img" aria-label="location">
                  📍
                </span>{" "}
                {roomInfo.address.detail}, {roomInfo.address.ward},{" "}
                {roomInfo.address.district}, {roomInfo.address.province}
              </p>

              <div className={styles.roomDetails}>
                <Text className={styles.roomPrice}>
                  Giá: {roomInfo.price.toLocaleString()} VNĐ
                </Text>
                <Text className={styles.roomArea}>Diện tích: {roomInfo.acreage} m²</Text>
                <Text className={styles.roomRating}>Đánh giá: {renderStars(roomInfo.rating)}</Text>
                <Text className={styles.roomStatus}>Trạng thái: {roomInfo.status}</Text>
                <Text>{timeAgo(roomInfo.createdAt)}</Text>
              </div>

              <div className={styles.roomDescription}>
                <h3>Thông tin mô tả</h3>
                <p>- {roomInfo.description}</p>
              </div>

              <div className={styles.roomAmenities}>
                <h3>Tiện nghi</h3>
                <ul>
                  {roomInfo.amenities &&
                    roomInfo.amenities.map((amenity, index) => (
                      <li key={index}>- {amenity}</li>
                    ))}
                </ul>
              </div>

              <div className={styles.roomServiceRooms}>
                <h3>Dịch vụ kèm theo</h3>
                <ul>
                  {roomInfo.servicerooms &&
                    roomInfo.servicerooms.map((service, index) => (
                      <li key={index}>
                        - {service.name}: {service.price.toLocaleString()} VNĐ/
                        {service.description}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className={styles.mapContainer}>
              <h3>Bản đồ</h3>
              <p>Địa chỉ: {roomInfo.address.detail}, {roomInfo.address.ward},{" "}
                {roomInfo.address.district}, {roomInfo.address.province}</p>
              {coordinates ? (
                <MapContainer center={coordinates} zoom={13} style={{ height: "400px", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={coordinates}>
                    <Popup>{roomInfo.title}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p>Không có dữ liệu bản đồ.</p>
              )}
            </div>
          </>
        )}
        <div>
          <ReviewRoom roomId={roomId} onReviewSubmit={handleReviewSubmit} />
          <ListReviewRoom roomId={roomId} averageRating={averageRating} />

        </div>
      </div>

      {/* Sidebar for Featured and Latest Rooms */}
      <div className={styles.sidebar}>
        <div className={styles.infoLandlordRoom}>
          {roomInfo && roomInfo.landlord && (
            <div className={styles.landlordInfo}>
              <Avatar
                className={styles.landlordAvatar}
                size={64}
                src={roomInfo.landlord.user.avatar || "/logo192.png"}
              />
              <div className={styles.landlordDetails}>
                <Text className={styles.landlordName}>{roomInfo.landlord.user.fullName}</Text>
                <div className={styles.landlordStatus}>
                  <span className={styles.statusIndicator} style={{ backgroundColor: roomInfo.landlord.active ? '#4caf50' : '#999' }}></span>
                  {roomInfo.landlord.active ? 'Hoạt động' : 'Không hoạt động'}
                </div>

                <div >
                  <Button className={styles.phoneButton} type="primary" block>{<PhoneOutlined />} {roomInfo.landlord.user.phone}</Button>
                  <Button
                    className={styles.favoriteButton}
                    type="link"
                    block
                    onClick={() => handleZaloMessage(roomInfo.landlord.user.phone)}
                  >
                    {<MessageOutlined />} Nhắn Zalo
                  </Button>
                  <Button className={styles.favoriteButton} type="link" block onClick={handleDirectMessage}>{<WechatOutlined />} Nhắn tin trực tiếp</Button>
                </div>

              </div>
            </div>
          )}

        </div>

        <div className={styles.featuredSection}>
          <h3>
            Cho thuê {roomInfo?.category?.category || 'phòng'} ở {roomInfo?.address?.district || 'quận'}, {roomInfo?.address?.province || 'tỉnh'}
          </h3>
          <div className={styles.featuredList}>
            {roomByAddress && roomByAddress.length > 0 ? (
              roomByAddress.map((item, index) => (
                <div className={styles.featuredItem} key={index}
                  onClick={() => {
                    nav(`/detail-room/${item._id}`);
                  }}>
                  <img src={item.images[0] || "/logo192.png"} alt="Featured room" className={styles.featuredImage} />
                  <div className={styles.featuredDetails}>
                    <Text className={styles.featuredTitle}>{renderStars(item.rating)}{item.title}</Text>
                    <div className={styles.featuredInfo}>
                      <Text className={styles.featuredPrice}>Giá: {item.price.toLocaleString()}</Text>
                      <Text className={styles.featuredTime}>{timeAgo(item.createdAt)}</Text>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có tin nổi bật</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;
