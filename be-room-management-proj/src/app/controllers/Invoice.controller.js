const Invoice = require("../models/Invoice.model");
const Contract = require("../models/Contract.model");

class InvoiceController {
  // [POST] /api/invoices/create
  async createInvoice(req, res) {
    const { contractID, totalOfSv, title } = req.body;
    if (!contractID || !totalOfSv || !Array.isArray(totalOfSv) || totalOfSv.length === 0) {
      return res.status(400).json({
        message: "Thiếu dữ liệu cần thiết hoặc dữ liệu không hợp lệ",
      });
    }
    try {
      const contract = await Contract.findById(contractID).populate(
        "tenant landlord room"
      );

      if (!contract) {
        return res.status(404).json({
          message: "Contract not found",
        });
      }

      if (contract.status ==="waiting" || contract.status ==="canceled") {
        return res.status(400).json({
          message: "Contract chưa/không có hiệu lực",
        });
      }
      const total = totalOfSv.reduce((sum, service) => {
        if (!service.name || service.quantity == null || service.totalAmount == null) {
          throw new Error("Dữ liệu dịch vụ không hợp lệ");
        }
        return sum + (Number(service.totalAmount) || 0);
      }, 0);
      
      // Create a new invoice based on the contract details
      const newInvoice = new Invoice({
        contract: contract._id,
        title: title || `Hóa đơn cho phòng ${contract.room.title}`,
        totalOfSv,
        status: false,
        total, // Tổng tiền đã tính
      });

      const savedInvoice = await newInvoice.save();
      return res.status(201).json({
        message: "Hóa đơn được tạo thành công",
        invoice: savedInvoice,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] /api/invoices/ - Lấy danh sách hóa đơn (Read all)
  async getInvoices(req, res) {
    try {
      const invoices = await Invoice.find().populate({
        path: "contract", // Giả sử bạn có một bảng Contract liên quan
        select: "-__v", // Loại bỏ các trường không cần thiết
      });
      return res.status(200).json(invoices);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] /api/invoices/:id - Lấy hóa đơn theo ID (Read by ID)
  async getInvoiceById(req, res) {
    const { invoiceId } = req.params;
    try {
      const invoice = await Invoice.findById(invoiceId).populate({
        path: "contract",
        select: "-__v",
      });
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      return res.status(200).json(invoice);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [PUT] /api/invoices/:id - Cập nhật hóa đơn (Update)
  async updateInvoice(req, res) {
    const { invoiceId } = req.params;
    try {
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate({
        path: "contract",
        select: "-__v",
      });
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      return res.status(200).json(updatedInvoice);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [DELETE] /api/invoices/:id - Xóa hóa đơn (Delete)
  async deleteInvoice(req, res) {
    const { invoiceId } = req.params;
    try {
      const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);
      if (!deletedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      return res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
}

module.exports = new InvoiceController();
