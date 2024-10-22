const Review = require('../models/Review.model');
const Room = require('../models/Room.model');
const Tenant = require('../models/Tenant.model');

class ReviewController {
    // [GET] /api/review/room/:roomId
    async getReviewsByRoom(req, res) {
        const { roomId } = req.params;

        try {
            // Tìm tất cả các review cho room với roomId cụ thể
            const reviews = await Review.find({ room: roomId }).populate('tenant', 'name').sort({ createdAt: -1 });; // Populate để lấy thêm thông tin tenant (nếu cần)

            if (reviews.length === 0) {
                return res.status(404).json({
                    message: "Không có đánh giá nào cho phòng này!"
                });
            }

            return res.json({
                message: "Danh sách các đánh giá",
                reviews,
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
            if (user.role !== 'tenant') {
                return res.status(403).json({ message: "Bạn không có quyền tạo review!" });
            }

            // Tìm tenant dựa trên user ID trong payload của token
            const tenant = await Tenant.findOne({ user: user.id });
            if (!tenant) {
                return res.status(404).json({ message: "Tenant không tồn tại!" });
            }

            // Kiểm tra nếu tenant đã review cho room này
            const existingReview = await Review.findOne({ tenant: tenant.id, room: roomId });
            if (existingReview) {
                return res.status(409).json({ message: "Bạn đã review cho phòng này rồi!" });
            }

            const newReview = new Review({
                rating,
                comment,
                tenant: tenant.id,
                room: roomId
            });

            await newReview.save();
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
            if (user.role !== 'tenant') {
                return res.status(403).json({ message: "Bạn không có quyền sửa review!" });
            }

            // Tìm tenant dựa trên user ID trong payload của token
            const tenant = await Tenant.findOne({ user: user.id });
            if (!tenant) {
                return res.status(404).json({ message: "Tenant không tồn tại!" });
            }

            // Tìm review và kiểm tra quyền sở hữu
            const review = await Review.findById(reviewId);
            if (!review || review.tenant.toString() !== tenant.id.toString()) {
                return res.status(403).json({ message: "Bạn chỉ có thể sửa review do mình tạo!" });
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
            if (user.role !== 'tenant') {
                return res.status(403).json({ message: "Bạn không có quyền xóa review!" });
            }

            // Tìm tenant dựa trên user ID trong payload của token
            const tenant = await Tenant.findOne({ user: user.id });
            if (!tenant) {
                return res.status(404).json({ message: "Tenant không tồn tại!" });
            }

            // Tìm review và kiểm tra quyền sở hữu
            const review = await Review.findById(reviewId);
            if (!review || review.tenant.toString() !== tenant.id.toString()) {
                return res.status(403).json({ message: "Bạn chỉ có thể xóa review do mình tạo!" });
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
