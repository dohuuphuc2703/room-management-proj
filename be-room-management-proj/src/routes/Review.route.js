const express = require("express");

const router = express.Router();

const ReviewController = require("../app/controllers/Review.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");

router.get("/room/:roomId", ReviewController.getReviewsByRoom);
router.post("/create",roleVerify("tenant"), ReviewController.createReview);
router.post("/update/:reviewId",roleVerify("tenant"), ReviewController.updateReview);
router.delete("/delete/:reviewId",roleVerify("tenant"), ReviewController.deleteReview);

module.exports = router;