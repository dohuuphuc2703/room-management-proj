const express = require("express");

const router = express.Router();
const ContractController = require("../app/controllers/Contract.controller")

router.post("/create", ContractController.createContract);
router.get("/:id", ContractController.getContract);
router.delete("/delete", ContractController.deleteContract);
router.post("/mine", ContractController.getMyContracts);

module.exports = router;