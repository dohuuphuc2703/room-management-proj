import { LikeOutlined, StarOutlined } from "@ant-design/icons";
import { Avatar, List, Space } from "antd";
import axios from "axios";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ListRoom.module.css";

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const ListRoom = ({ handleSearchRoom, isSearch, rooms, setRooms, messageApi,
  page, setPage, pageSize, setPageSize, totalItems, setTotalItems }) => {
  const nav = useNavigate();

  const user = useSelector(state => state.userReducer);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        current: page, // Current page
        pageSize: pageSize, // Page size
        total: totalItems, // Total items
        onChange: async (page, pageSize) => {
          if (isSearch)
            await handleSearchRoom(page, pageSize);
          else
            await getRoomsSuggestion(page, pageSize);
        },
      }}
      dataSource={rooms}
      renderItem={(item) => {
        const landlord = item.landlord;
        return (
          <List.Item
            key={item.title}
            actions={[
              <IconText
                style={{ cursor: "pointer" }}
                icon={StarOutlined}
                text="156"
                key="list-vertical-star-o"
              />,
              <IconText
                icon={LikeOutlined}
                text="156"
                key="list-vertical-like-o"
              />,
            ]}
            extra={
              <img
                width={240}
                height={150}
                style={{ marginLeft: "500px", position: "absolute" }}
                alt="room"
                src={item.image || "/default-room.png"}
              />
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar src={landlord.avatar || "https://www.w3schools.com/howto/img_avatar.png"} />
              }
              title={
                <span className={styles.title_room}
                  onClick={() => {
                    nav(user.role ? `/user/view-detail-room/${item._id}` : `/view-detail-room/${item._id}`);
                  }}
                >{item.title}</span>
              }
              description={landlord.introduction}
            />
            {item.description}
            <p>Price: {item.price} </p>
            <p>Address: {item.address[0].detail}, {item.address[0].ward}, {item.address[0].district}, {item.address[0].province}</p>
            Landlord: {item.landlord.name}
          </List.Item>
        );
      }}
    />
  );
};

export default ListRoom;
