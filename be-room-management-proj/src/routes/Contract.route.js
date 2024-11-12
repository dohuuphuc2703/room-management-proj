const express = require("express");

const router = express.Router();
const ContractController = require("../app/controllers/Contract.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/create", verifyJwt, ContractController.createContract);
router.get("/detail/:id", ContractController.getContract);
router.delete("/delete", ContractController.deleteContract);
router.get("/byLandlord",verifyJwt, ContractController.getContractsByLandlord);


module.exports = router;