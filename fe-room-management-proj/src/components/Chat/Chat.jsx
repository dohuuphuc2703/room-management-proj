import { ConfigProvider, message as notify, Skeleton, Spin } from "antd";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

import axios from "axios";
import clsx from "clsx";

import { LoadingOutlined } from "@ant-design/icons";

import { useEffect, useRef, useState } from "react";
import InputTexting from "../InputTexting/InputTexting";
import styles from "./Chat.module.css";

const primaryColor = "#00b14f";

function timeDifference(startDate) {
  const start = new Date(startDate);
  const end = new Date();
  const diffInMs = Math.abs(end - start);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 12 * month;

  if (diffInMs < hour) {
    const minutes = Math.floor(diffInMs / minute);
    return `${minutes} phút`;
  } else if (diffInMs < day) {
    const hours = Math.floor(diffInMs / hour);
    return `${hours} giờ`;
  } else if (diffInMs < month) {
    const days = Math.floor(diffInMs / day);
    return `${days} ngày`;
  } else if (diffInMs < year) {
    const months = Math.floor(diffInMs / month);
    return `${months} tháng`;
  } else {
    const years = Math.floor(diffInMs / year);
    return `${years} năm`;
  }
}

function Chat({ socket }) {
  const { user } = useOutletContext();
  const location = useLocation();
  const { landlord } = location.state || {};

  const nav = useNavigate();

  const [listFriends, setListFriends] = useState([]);
  const [chatWith, setChatWith] = useState(null);

  const [sentMessages, setSentMessages] = useState([]);

  const chatFrameRef = useRef(null);

  const [messageApi, contextHolder] = notify.useMessage();

  const handleSendMessage = (message) => {
    const text = message.trim();
    if (text) {
      const payload = {
        senderId: user._id,
        receiverId: chatWith._id,
        content: text,
      };

      socket.emit("sender", payload);
      setSentMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          ...payload,
          sentAt: Date.now(),
        },
      ]);
    }
  };

  const handleReceiveMessage = (data) => {
    // console.log(data, chatWith?.member._id);
    if (data.load) setSentMessages(data.messages);
    else {
      // console.log(data);
      setSentMessages((prev) => [...prev, ...data]);
    }
  };

  const handleLoadMessage = ({ owner, friend }) => {
    socket.emit("leave");
    setSentMessages(null);
    socket.emit("load", { owner, friend: friend._id });
  };

  useEffect(() => {
    // Gọi API để lấy danh sách bạn bè
    axios
      .get("http://localhost:8000/api/tenant/list-friends", {
        withCredentials: true,
      })
      .then((res) => {
        socket.on("receiver", handleReceiveMessage);

        // Kết hợp danh sách bạn bè từ API với landlord nếu cần
        setListFriends(() => {
          const fetchedFriends = res.data.users;

          if (landlord) {
            const existsInFetched = fetchedFriends.some(
              (friend) => friend._id === landlord._id
            );

            if (existsInFetched) {
              // Nếu landlord đã nằm trong danh sách bạn bè, setChatWith là người bạn này
              const existingFriend = fetchedFriends.find(
                (friend) => friend._id === landlord._id
              );
              setChatWith(existingFriend);
              return fetchedFriends; // Không cần thêm landlord vì đã tồn tại
            } else {
              // Nếu landlord chưa tồn tại, thêm vào danh sách
              setChatWith(landlord);
              return [...fetchedFriends, landlord];
            }
          }

          return fetchedFriends; // Nếu không có landlord, giữ nguyên danh sách từ API
        });
      })
      .catch((err) => {
        console.error(err);
        messageApi.error(
          `Đã có lỗi xảy ra: ${
            err?.response?.data?.message || "Không xác định"
          }`
        );
        const code = err?.response?.status;
        if (code === 401 || code === 403) nav("/login");
      });

    // Cleanup để loại bỏ listener
    return () => {
      socket.off("receiver", handleReceiveMessage);
      socket.emit("leave");
    };
  }, [landlord]); // Phụ thuộc vào landlord

  useEffect(() => {
    if (chatWith) {
      // Gửi yêu cầu tới server để tải lịch sử tin nhắn với người bạn hiện tại
      socket.emit("leave"); // Rời khỏi cuộc trò chuyện cũ
      socket.emit("load", { owner: user._id, friend: chatWith._id }); // Yêu cầu lịch sử tin nhắn với bạn mới
      setSentMessages([]); // Xóa khung tin nhắn tạm thời trong khi chờ dữ liệu
    }
  }, [chatWith]); // Chạy khi chatWith thay đổi

  useEffect(() => {
    if (chatFrameRef && chatFrameRef?.current)
      chatFrameRef.current.scrollTop = chatFrameRef.current.scrollHeight;
  }, [sentMessages]);

  return (
    <div className={styles.chat}>
      {contextHolder}
      <ConfigProvider
        theme={{
          components: {
            Button: {
              defaultActiveBg: "#00b15060",
              defaultActiveColor: primaryColor,
              defaultHoverColor: primaryColor,
              defaultColor: "#02c95b",
            },
            Input: {
              primaryColor: primaryColor,
              hoverBorderColor: "#02c95b",
              activeBorderColor: primaryColor,
            },
          },
        }}
      >
        <div className={styles.friends}>
          {/* Friends
          <Button onClick={() => { socket.io.engine.close();}} >Disconnect</Button> */}
          {listFriends
            ? listFriends.map((friend) => (
                <div
                  className={clsx([
                    styles.friend,
                    friend._id === chatWith?._id ? styles.select : null,
                  ])}
                  key={friend._id}
                  onClick={() => {
                    if (user?._id) {
                      setChatWith(friend);
                      handleLoadMessage({ owner: user._id, friend });
                    } else {
                      console.error("Dữ liệu user chưa sẵn sàng");
                    }
                  }}
                >
                  <div
                    className={clsx([
                      styles.avatarWrapper,
                      friend.online ? styles.active : null,
                    ])}
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.fullName}
                      className={styles.avatar}
                    />
                  </div>
                  <div className={styles.info}>
                    <h4>{friend.fullName}</h4>
                    <p>Hãy gửi lời chào trước khi bắt đầu nhắn tin nhé!</p>
                  </div>
                </div>
              ))
            : [...Array(3)].map((_, index) => (
                <div className={styles.friend} key={index}>
                  <Skeleton.Avatar active shape="circle" size="large" />
                  <div className={styles.info}>
                    <Skeleton.Input active size="default" />
                  </div>
                </div>
              ))}
        </div>

        <div className={styles.content}>
          {chatWith ? (
            <>
              <div className={styles.header}>
                <div
                  className={clsx([
                    styles.avatarWrapper,
                    chatWith?.online ? styles.active : null,
                  ])}
                >
                  <img
                    src={chatWith.avatar}
                    alt={chatWith.fullName}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.info}>
                  <h4>{chatWith.fullName}</h4>
                  <p>
                    {chatWith.online
                      ? "Đang hoạt động"
                      : chatWith.onlineAt
                      ? `Hoạt động ${timeDifference(chatWith.onlineAt)} trước`
                      : "Không xác định"}
                  </p>
                </div>
              </div>
              <div className={styles.contentWrapper}>
                <div className={styles.messages} ref={chatFrameRef}>
                  {sentMessages !== null ? (
                    sentMessages.length > 0 ? (
                      sentMessages.map((message) =>
                        message.senderId === user?._id ? (
                          <div className={styles.yourMessage} key={message._id}>
                            <div className={styles.messageWrapper}>
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={styles.friendMessage}
                            key={message._id}
                          >
                            <div className={styles.messageWrapper}>
                              {message.content}
                            </div>
                          </div>
                        )
                      )
                    ) : chatWith ? (
                      <div className={styles.firstMessage}>
                        <div className={styles.avatarWrapper}>
                          <img
                            src={chatWith.avatar}
                            alt={chatWith.fullName}
                            className={styles.avatar}
                          />
                        </div>
                        <h3>{chatWith.fullName}</h3>
                        <p>Hãy bắt đầu cuộc trò chuyện bằng một lời chào 😍</p>
                      </div>
                    ) : (
                      <></>
                    )
                  ) : (
                    <div className={styles.loading}>
                      <Spin
                        indicator={
                          <LoadingOutlined
                            style={{ fontSize: "32px", color: "#00b14f" }}
                            spin
                          />
                        }
                      />
                    </div>
                  )}
                </div>

                <InputTexting handleSendMessage={handleSendMessage} />
              </div>
            </>
          ) : (
            <div className={styles.requireChooseConversation}>
              <img
                src="/no-conversation.png"
                alt="Không có cuộc trò chuyện nào"
                className={styles.imgNoConversation}
              />
              <p>Bạn hiện không chọn cuộc trò chuyện nào...</p>
            </div>
          )}
        </div>
      </ConfigProvider>
    </div>
  );
}

export default Chat;
