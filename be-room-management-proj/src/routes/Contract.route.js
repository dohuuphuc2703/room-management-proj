const express = require("express");

const router = express.Router();
const ContractController = require("../app/controllers/Contract.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/create", verifyJwt, ContractController.createContract);
router.get("/detail/:id", ContractController.getContract);
router.delete("/delete", ContractController.deleteContract);
router.get("/byLandlord",verifyJwt, ContractController.getContractsByLandlord);
router.get("/byTenant",verifyJwt, ContractController.getContractsByTenant);
router.get("/pdf/:contractId", ContractController.getContractPDF);
router.get('/verify', ContractController.verifyContract);
router.post("/:contractId/cancel-request", verifyJwt, ContractController.cancelRequest);
router.put("/:contractId/cancel-request/handle", verifyJwt, ContractController.cancelRequestHandle);

module.exports = router;