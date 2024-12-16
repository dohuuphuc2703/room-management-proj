const Invoice = require("../models/Invoice.model");
const Contract = require("../models/Contract.model");

class InvoiceController {
  // [POST] /api/invoices/create
  async createInvoice(req, res) {
    const { contractID, totalOfSv } = req.body;
    if (
      !contractID ||
      !totalOfSv ||
      !Array.isArray(totalOfSv) ||
      totalOfSv.length === 0
    ) {
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

      if (contract.status === "waiting" || contract.status === "canceled") {
        return res.status(400).json({
          message: "Contract chưa/không có hiệu lực",
        });
      }
      const total = totalOfSv.reduce((sum, service) => {
        if (
          !service.name ||
          service.quantity == null ||
          service.totalAmount == null
        ) {
          throw new Error("Dữ liệu dịch vụ không hợp lệ");
        }
        return sum + (Number(service.totalAmount) || 0);
      }, 0);

      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toLocaleString("vi-VN", {
        month: "long",
        year: "numeric",
      });

      // Tạo hóa đơn mới dựa trên thông tin hợp đồng
      const newInvoice = new Invoice({
        contract: contract._id,
        title: `Hóa đơn tháng ${lastMonth} phòng "${contract.room.title}"`,
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

  // [GET] /api/invoices/allInvoice
  async getInvoices(req, res) {
    const landlordId = req.user.uid;
    const { status, page = 1, size = 10 } = req.query;
    try {
      const limit = parseInt(size, 10) || 10;
      const skip = (parseInt(page, 10) - 1) * limit;
      const filter = status !== undefined ? { status: status === 'true' } : {}; 
      const invoices = await Invoice.find(filter)
        .populate({
          path: "contract",
          match: { landlord: landlordId },
          select: "-__v -pdfPath",
          populate: [
            {
              path: "room",
              select: "title address",
            },
            {
              path: "tenant",
              select: "user",
              populate: {
                path: "user",
                select: "fullName email phone",
              },
            },
          ],
        })
        .lean();

      const filteredInvoices = invoices.filter((invoice) => invoice.contract);
      const total = filteredInvoices.length;
      const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);
      return res.status(200).json({
        data: filteredInvoices,
        pagination: {
          total,
          currentPage: parseInt(paginatedInvoices, 10),
          pageSize: limit,
      },

      });
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

  async getInvoiceByContract(req, res) {
    const { contractId, status, page = 1, size = 10 } = req.query;
    try {
      const filter = { contract: contractId };
      if (status !== undefined && status !== null) {
        // Kiểm tra nếu `status` không null/undefined
        filter.status = status;
      }
      const limit = parseInt(size, 10) || 10;
      const skip = (parseInt(page, 10) - 1) * limit;
      const invoices = await Invoice
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      const total = await Invoice.countDocuments(filter);
      return res.status(200).json({
        data: invoices,
        pagination: {
          total,
          currentPage: parseInt(page, 10),
          pageSize: limit,
      },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.toString() });
    }
  }
}

module.exports = new InvoiceController();
