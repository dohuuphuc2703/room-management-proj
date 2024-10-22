const express = require("express");

const router = express.Router();

const ReviewController = require("../app/controllers/Review.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");

router.get("/room/:roomId", ReviewController.getReviewsByRoom);
router.post("/create", ReviewController.createReview);
router.post("/update/:reviewId", ReviewController.updateReview);
router.delete("/delete/:reviewId", ReviewController.deleteReview);

module.exports = router;