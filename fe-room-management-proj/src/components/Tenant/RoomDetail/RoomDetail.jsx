import { HeartOutlined, LeftOutlined, PhoneOutlined, RightOutlined, WechatOutlined } from "@ant-design/icons";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Avatar, Button, Carousel, Space, Typography, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./RoomDetail.module.css";

const { Text } = Typography;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

// Function to calculate the time difference
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
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [latestRooms, setLatestRooms] = useState([]);

  const handleZaloMessage = (phone) => {
    const zaloLink = `https://zalo.me/${phone}`;
    window.open(zaloLink, '_blank');
  };

  // Function to convert address to coordinates using Google Geocoding API
  const getCoordinates = async (address) => {
    const { province, district, ward, detail } = address[0]; // Assuming the first address is the main one
    const fullAddress = `${detail}, ${ward}, ${district}, ${province}`;
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=YOUR_API_KEY`);
    const location = res.data.results[0]?.geometry.location;
    return location ? { lat: location.lat, lng: location.lng } : null; // Return coordinates as an object
  };

  const getDetailRoomInfo = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/room/info/${roomId}`,
        { withCredentials: true }
      );
      const data = await res.data;
      setRoomInfo(data.info);
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra: " + err.toString());
    }
  };

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
    getDetailRoomInfo();
    getLatestRooms();
    getTopRatedRooms();
  }, []);

  const mapContainerStyle = {
    height: "400px",
    width: "100%",
  };

  const center = {
    lat: 10.7769, // Default latitude
    lng: 106.6951 // Default longitude
  };

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
              <h1 className={styles.roomTitle}>{roomInfo.title}</h1>
              <p className={styles.roomAddress}>
                <span role="img" aria-label="location">📍</span> {roomInfo.address[0].detail}, {roomInfo.address[0].ward}, {roomInfo.address[0].district}, {roomInfo.address[0].province}
              </p>

              <div className={styles.roomDetails}>
                <Text className={styles.roomPrice}>Giá: {roomInfo.price.toLocaleString()} VNĐ</Text>
                <Text className={styles.roomArea}>Diện tích: {roomInfo.acreage} m²</Text>
                <Text className={styles.roomRating}>Đánh giá: {roomInfo.rating} ⭐</Text>
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
                  {roomInfo.amenities && roomInfo.amenities.map((amenity, index) => (
                    <li key={index}>- {amenity}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.roomServiceRooms}>
                <h3>Dịch vụ kèm theo</h3>
                <ul>
                  {roomInfo.servicerooms && roomInfo.servicerooms.map((service, index) => (
                    <li key={index}>
                      - {service.name}: {service.price.toLocaleString()} VNĐ/{service.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

                     {/* Map Section */}
            <div className={styles.mapContainer}>
              <h3>Bản đồ</h3>
              {roomInfo.address && (
                <LoadScript googleMapsApiKey="AIzaSyCB4hy5uO5jbx3AUe0MT8k6y1o6sKz5HP4"> {/* Thay YOUR_API_KEY bằng API key của bạn */}
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={getCoordinates(roomInfo.address)}
                    zoom={13}
                  >
                    <Marker position={getCoordinates(roomInfo.address)} />
                  </GoogleMap>
                </LoadScript>
              )}
            </div>
          </>
        )}
      </div>


      <div className={styles.sidebar}>
        <div className={styles.infoLandlordRoom}>
          {roomInfo && roomInfo.landlord && (
            <div className={styles.landlordInfo}>
              <Avatar
                className={styles.landlordAvatar}
                size={64}
                src={roomInfo.landlord.avatar || "/logo192.png"}
              />
              <div className={styles.landlordDetails}>
                <Text className={styles.landlordName}>{roomInfo.landlord.fullName}</Text>
                <div className={styles.landlordStatus}>
                  <span className={styles.statusIndicator} style={{ backgroundColor: roomInfo.landlord.active ? '#4caf50' : '#999' }}></span>
                  {roomInfo.landlord.active ? 'Hoạt động' : 'Không hoạt động'}
                </div>

                <div >

                  <Button className={styles.phoneButton} type="primary" block>{<PhoneOutlined />} {roomInfo.landlord.phone}</Button>
                  <Button
                    className={styles.favoriteButton}
                    type="link"
                    block
                    onClick={() => handleZaloMessage(roomInfo.landlord.phone)}
                  >
                    {<HeartOutlined />} Nhắn Zalo
                  </Button>
                  <Button className={styles.favoriteButton} type="link" block>{<WechatOutlined />} Nhắn tin trực tiếp</Button>
                  <Button className={styles.favoriteButton} type="link" block>{<HeartOutlined />} Yêu thích</Button>

                </div>

              </div>
            </div>
          )}
        </div>


        <div className={styles.featuredSection}>
          <h3>Tin nổi bật</h3>
          <div className={styles.featuredList}>
            {featuredRooms && featuredRooms.length > 0 ? (
              featuredRooms.map((item, index) => (
                <div className={styles.featuredItem} key={index}>
                  <img
                    src={item.images[0] || "/logo192.png"}
                    alt="Featured room"
                    className={styles.featuredImage}
                  />
                  <div className={styles.featuredDetails}>
                    <Text className={styles.featuredTitle}>{item.title}</Text>
                    <div className={styles.featuredInfo}>
                      <Text className={styles.featuredPrice}>Giá: {item.price}</Text>
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

        <div className={styles.latestSection}>
          <h3>Tin mới nhất</h3>
          <div className={styles.latestList}>
            {latestRooms && latestRooms.length > 0 ? (
              latestRooms.map((item, index) => (
                <div className={styles.latestItem} key={index}>
                  <img
                    src={item.images[0] || "/logo192.png"}
                    alt="Latest room"
                    className={styles.featuredImage}
                  />
                  <div className={styles.latestDetails}>
                    <Text className={styles.latestTitle}>{item.title}</Text>
                    <div className={styles.latestInfo}>
                      <Text className={styles.latestPrice}>Giá: {item.price}</Text>
                      <Text className={styles.latestTime}>{timeAgo(item.createdAt)}</Text>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có tin mới nhất</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;
