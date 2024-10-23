const express = require("express");

const router = express.Router();
const MaintenanceRequestController = require("../app/controllers/MaintenanceRequest.controller")

router.post("/create", MaintenanceRequestController.createMaintenanceRequest);
router.get("/:id", MaintenanceRequestController.getMaintenanceRequest);
router.delete("/delete", MaintenanceRequestController.deleteMaintenanceRequest);
router.post("/update/:id", MaintenanceRequestController.updateMaintenanceRequest);
router.get("/", MaintenanceRequestController.getAllMaintenanceRequests);

module.exports = router;