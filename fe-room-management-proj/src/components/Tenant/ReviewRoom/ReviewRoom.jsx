// ReviewRoom.jsx
import React, { useState } from "react";
import { Button, Input, Rate, message } from "antd";
import styles from "./ReviewRoom.module.css";

const ReviewRoom = ({ roomId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!rating || !comment) {
      message.error("Vui lòng nhập đánh giá và chọn số sao!");
      return;
    }
    onReviewSubmit({ rating, comment, roomId });
    setRating(0);
    setComment("");
  };

  return (
    <div className={styles.reviewContainer}>
      <h3>Đánh giá phòng</h3>
      <Rate value={rating} onChange={setRating} />
      <Input.TextArea
        rows={3}
        placeholder="Nhập đánh giá của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="primary" onClick={handleSubmit} className={styles.submitButton}>
        Gửi đánh giá
      </Button>
    </div>
  );
};

export default ReviewRoom;
