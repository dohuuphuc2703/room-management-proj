const authRoute = require("./Auth.route");
const roomRoute = require("./Room.route");
const roomCategoryRoute = require("./RoomCategory.route");
const reviewRoute = require("./Review.route")
const contractRoute = require("./Contract.route")
const landlordRoute = require("./Landlord.route");
const tenantRoute = require("./Tenant.route");
const invoiceRoute = require("./Invoice.route");
const adminRoute = require("./Admin.route");


const { verifyJwt } = require("../app/middlewares/jwtMiddleware");
const { roleVerify } = require("../app/middlewares/roleMiddleware");

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/api/admin", verifyJwt, roleVerify("admin"), adminRoute);
  app.use("/api/room", roomRoute);
  app.use("/api/room-category", roomCategoryRoute);
  app.use("/api/review", reviewRoute);
  app.use("/api/contract", contractRoute);
  app.use("/api/landlord", verifyJwt, roleVerify("landlord"), landlordRoute);
  app.use("/api/tenant", verifyJwt, roleVerify("tenant"), tenantRoute);
  app.use("/api/invoice", verifyJwt, invoiceRoute);
  app.get("/", (req, res) => {
    res.json({
      message: "Initial backend for room mgt website",
    })
  })
};