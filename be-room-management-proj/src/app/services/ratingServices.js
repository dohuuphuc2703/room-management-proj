// services/ratingService.js
const Room = require("../models/Room.model");
const Review = require("../models/Review.model");

async function calculateRoomRatings() {
    try {
        const ratings = await Review.aggregate([
            { $match: { rating: { $ne: null } } },
            { $group: { _id: "$room", avgRating: { $avg: "$rating" } } }
        ]);
        
        await Promise.all(ratings.map(async ({ _id, avgRating }) => {
            await Room.findByIdAndUpdate(_id, { rating: avgRating }, { new: true });
        }));

        console.log("Room ratings updated successfully.");
    } catch (error) {
        console.error("Error updating room ratings:", error);
    }
}

// Hàm tính rating cho một phòng cụ thể
async function calculateRatingForRoom(roomId) {
    try {
        // Tính trung bình rating của các review cho roomId
        const ratingData = await Review.aggregate([
            { $match: { room: roomId, rating: { $ne: null } } },
            { $group: { _id: "$room", avgRating: { $avg: "$rating" } } }
        ]);

        if (ratingData.length > 0) {
            const avgRating = ratingData[0].avgRating;
            // Cập nhật rating cho phòng theo roomId
            await Room.findByIdAndUpdate(roomId, { rating: avgRating }, { new: true });
            console.log(`Rating updated for room ${roomId}: ${avgRating}`);
        } else {
            console.log(`No reviews found for room ${roomId}`);
        }
    } catch (error) {
        console.error(`Error updating rating for room ${roomId}:`, error);
    }
}

module.exports = {
    calculateRoomRatings,
    calculateRatingForRoom
};
