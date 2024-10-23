const express = require("express");

const router = express.Router();
const InvoiceController = require("../app/controllers/Invoice.controller");

router.post("/create", InvoiceController.createInvoice); 
router.get("/:invoiceId", InvoiceController.getInvoiceById);
router.get("/allInvoice", InvoiceController.getInvoices);
router.put("/update/:invoiceId", InvoiceController.updateInvoice); 
router.delete("/delete/:invoiceId", InvoiceController.deleteInvoice);

module.exports = router;
