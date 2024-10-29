const Invoice = require('../models/Invoice.model');

class InvoiceController {
    // [POST] /api/invoices/ - Tạo hóa đơn mới (Create)
    async createInvoice(req, res) {
        try {
            const newInvoice = new Invoice(req.body);
            const savedInvoice = await newInvoice.save();
            return res.status(201).json(savedInvoice);
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
                path: 'contract', // Giả sử bạn có một bảng Contract liên quan
                select: '-__v', // Loại bỏ các trường không cần thiết
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
                path: 'contract',
                select: '-__v',
            });
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
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
            const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, req.body, {
                new: true,
                runValidators: true,
            }).populate({
                path: 'contract',
                select: '-__v',
            });
            if (!updatedInvoice) {
                return res.status(404).json({ message: 'Invoice not found' });
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
                return res.status(404).json({ message: 'Invoice not found' });
            }
            return res.status(200).json({ message: 'Invoice deleted successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: error.toString(),
            });
        }
    }
}

module.exports = new InvoiceController();
