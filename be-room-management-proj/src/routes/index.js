const authRoute = require("./Auth.route");
const roomRoute = require("./Room.route");
const roomCategoryRoute = require("./RoomCategory.route");

const { verifyJwt } = require("../app/middlewares/jwtMiddleware");
const { roleVerify } = require("../app/middlewares/roleMiddleware");

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/api/room", roomRoute);
  app.use("/api/room-category", roomCategoryRoute);
  app.get("/", (req, res) => {
    res.json({
      message: "Initial backend for job protal website",
    })
  })
};