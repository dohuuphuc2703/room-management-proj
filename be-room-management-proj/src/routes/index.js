const authRoute = require("./Auth.route");
const roomRoute = require("./Room.route");
const roomCategoryRoute = require("./RoomCategory.route");
const reviewRoute = require("./Review.route")
const contractRoute = require("./Contract.route")
const landlordRoute = require("./Landlord.route");
const tenantRoute = require("./Tenant.route");
const maintenanceRequestRoute = require("./MaintenanceRequest.route");
const invoiceRoute = require("./Invoice.route");


const { verifyJwt } = require("../app/middlewares/jwtMiddleware");
const { roleVerify } = require("../app/middlewares/roleMiddleware");

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/api/room", roomRoute);
  app.use("/api/room-category", roomCategoryRoute);
  app.use("/api/review", reviewRoute);
  app.use("/api/contract", contractRoute);
  app.use("/api/landlord", landlordRoute);
  app.use("/api/tenant", tenantRoute);
  app.use("/api/maintenance-request", maintenanceRequestRoute);
  app.use("/api/invoice", invoiceRoute);

  app.get("/", (req, res) => {
    res.json({
      message: "Initial backend for room protal website",
    })
  })
};