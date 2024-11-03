import { StarFilled } from "@ant-design/icons";
import { List, Typography, Space, Avatar, Button } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./ListReviewRoom.module.css";

const { Text } = Typography;

// Hàm tạo ngôi sao dựa trên rating
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarFilled key={i} style={{ color: i <= rating ? '#fa8c16' : '#eaeaea', fontSize: '16px' }} />
    );
  }
  return stars;
};

const ListReviewRoom = ({ roomId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchReviews = async (rating = '') => {
    try {
      setLoading(true);
      // Gọi API với rating là query parameter
      const response = await axios.get(`http://localhost:8000/api/review/room/${roomId}?rating=${rating}`);
      const { reviews: reviewsData, ratingCounts: counts } = response.data;
      setReviews(reviewsData);
      setRatingCounts(counts);
      
      // Tính điểm trung bình
      const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (rating) => {
    setActiveFilter(rating);
    fetchReviews(rating === 'all' ? '' : rating);
  };

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  return (
    <div className={styles.reviewContainer}>
      <h2>Đánh giá</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ marginRight: '30px', marginLeft: '30px' }}>
          <Text style={{ display: 'block', fontSize: '18px', fontWeight: "bold" }}>
            {averageRating}/5
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {renderStars(averageRating)}
          </Text>
        </div>
        <div>
          {['all', 5, 4, 3, 2, 1].map(rating => (
            <Button
              key={rating}
              type={activeFilter === rating ? 'primary' : 'default'}
              onClick={() => handleFilterChange(rating)}
              style={{ marginRight: '8px' }}
            >
              {rating === 'all' ? 'Tất cả' : rating} ({ratingCounts[rating] || 0})
            </Button>
          ))}
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={38}
                    src={review.tenant.user.avatar || "/logo192.png"}
                  />
                }
                title={
                  <Text style={{ fontSize: '12px', fontWeight: "normal" }}>
                    {review.tenant.user.fullName} - {` ${new Date(review.updatedAt).toLocaleString()}`}
                  </Text>
                }
                description={
                  <div>
                    <Space>{renderStars(review.rating)}</Space>
                    <Text className={styles.comment} style={{ display: 'block', fontSize: '16px', fontWeight: 'bold' }}>
                      {review.comment}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default ListReviewRoom;
