const express = require("express");

const router = express.Router();
const InvoiceController = require("../app/controllers/Invoice.controller");
const { roleVerify } = require("../app/middlewares/roleMiddleware");
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");


router.post("/create", verifyJwt ,roleVerify("landlord"), InvoiceController.createInvoice); 
router.get("invoiceInfo/:invoiceId", InvoiceController.getInvoiceById);
router.get("/allInvoice", InvoiceController.getInvoices);
router.put("/update/:invoiceId", InvoiceController.updateInvoice);
router.delete("/delete/:invoiceId", InvoiceController.deleteInvoice);
router.get("/byContract", InvoiceController.getInvoiceByContract);
router.post('/create_payment_url', InvoiceController.createPaymentUrl);
router.get('/vnpay_return', InvoiceController.vnpayReturn);
module.exports = router;
