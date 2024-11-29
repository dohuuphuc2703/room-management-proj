const Review = require("../models/Review.model");
const Room = require("../models/Room.model");
const Tenant = require("../models/Tenant.model");
const { calculateRatingForRoom } = require("../services/ratingServices");

class ReviewController {
  async getReviewsByRoom(req, res) {
    const { roomId } = req.params;
    const { rating } = req.query; // Lấy rating từ query parameters
  
    try {
      // Tạo điều kiện tìm kiếm cho room với roomId cụ thể
      let query = { room: roomId };
  
      // Tìm tất cả các review cho room với roomId cụ thể
      const reviews = await Review.find(query)
        .populate({
          path: "tenant",
          populate: { path: "user" }, // Populate thêm thông tin user từ tenant
        })
        .sort({ createdAt: -1 });
  
      if (reviews.length === 0) {
        return res.status(404).json({
          message: "Không có đánh giá nào cho phòng này!",
        });
      }
  
      // Tính toán số lượng đánh giá cho từng rating
      const ratingCounts = {
        all: reviews.length // Thêm tổng số lượng đánh giá
      };
  
      // Khởi tạo ratingCounts cho các rating từ 1 đến 5
      for (let i = 1; i <= 5; i++) {
        ratingCounts[i] = 0; // Đặt giá trị mặc định cho mỗi rating là 0
      }
  
      reviews.forEach((review) => {
        if (ratingCounts[review.rating] !== undefined) {
          ratingCounts[review.rating]++; // Tăng số lượng đánh giá cho rating cụ thể
        }
      });
  
      // Nếu có rating được chỉ định, thêm điều kiện vào query để lọc theo rating
      let filteredReviews = reviews;
      if (rating) {
        filteredReviews = reviews.filter(review => review.rating === Number(rating)); // Lọc theo rating
      }
  
      return res.json({
        message: "Danh sách các đánh giá",
        reviews: filteredReviews,
        ratingCounts, // Trả về số lượng đánh giá cho từng rating
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
  
  

  // [POST] /api/review/create
  async createReview(req, res) {
    const { rating, comment, roomId } = req.body;
    const user = req.user; // Thông tin user từ token sau khi xác thực
    try {
      // Kiểm tra nếu role của người dùng không phải tenant
      if (user.role !== "tenant") {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền tạo review!" });
      }

      // Tìm tenant dựa trên user ID trong payload của token
      const tenant = await Tenant.findOne({ user: user.id });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant không tồn tại!" });
      }

      // Kiểm tra nếu tenant đã review cho room này
      const existingReview = await Review.findOne({
        tenant: tenant.id,
        room: roomId,
      });
      if (existingReview) {
        return res
          .status(409)
          .json({ message: "Bạn đã review cho phòng này rồi!" });
      }

      const newReview =await Review.create({
        rating,
        comment,
        tenant: tenant.id,
        room: roomId,
      });

      console.log('New review created:', newReview);

      await calculateRatingForRoom(roomId);
  

      return res.status(201).json({
        message: "Review đã được tạo thành công",
        review: newReview,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [POST] /api/reviews/:reviewId
  async updateReview(req, res) {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    try {
      // Kiểm tra nếu role của người dùng không phải tenant
      if (user.role !== "tenant") {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền sửa review!" });
      }

      // Tìm tenant dựa trên user ID trong payload của token
      const tenant = await Tenant.findOne({ user: user.id });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant không tồn tại!" });
      }

      // Tìm review và kiểm tra quyền sở hữu
      const review = await Review.findById(reviewId);
      if (!review || review.tenant.toString() !== tenant.id.toString()) {
        return res
          .status(403)
          .json({ message: "Bạn chỉ có thể sửa review do mình tạo!" });
      }

      review.rating = rating;
      review.comment = comment;
      await review.save();

      return res.json({
        message: "Review đã được cập nhật thành công",
        review,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [DELETE] /api/review/delete/:reviewId
  async deleteReview(req, res) {
    const { reviewId } = req.params;
    const user = req.user;

    try {
      // Kiểm tra nếu role của người dùng không phải tenant
      if (user.role !== "tenant") {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền xóa review!" });
      }

      // Tìm tenant dựa trên user ID trong payload của token
      const tenant = await Tenant.findOne({ user: user.id });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant không tồn tại!" });
      }

      // Tìm review và kiểm tra quyền sở hữu
      const review = await Review.findById(reviewId);
      if (!review || review.tenant.toString() !== tenant.id.toString()) {
        return res
          .status(403)
          .json({ message: "Bạn chỉ có thể xóa review do mình tạo!" });
      }

      await review.remove();

      return res.json({ message: "Review đã được xóa thành công" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.toString() });
    }
  }
}

module.exports = new ReviewController();
