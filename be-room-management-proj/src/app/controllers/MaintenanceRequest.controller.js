const MaintenanceRequest = require('../models/MaintenanceRequest.model');
const Contract = require('../models/Contract.model');

class MaintenanceRequestController {
    // [POST] /api/maintenance-request/create
    async createMaintenanceRequest(req, res) {
        const { contract, title, price, request_status, progress_status, payment_status } = req.body;

        try {
            // Kiểm tra xem hợp đồng có tồn tại không
            const foundContract = await Contract.findById(contract);
            if (!foundContract) {
                return res.status(404).json({ message: "Contract not found" });
            }

            // Tạo phiếu bảo trì
            const newMaintenanceRequest = new MaintenanceRequest({
                contract,
                title,
                price,
                request_status,
                progress_status,
                payment_status
            });
            
            await newMaintenanceRequest.save();
            
            return res.status(201).json({
                message: "Maintenance request created successfully",
                maintenanceRequest: newMaintenanceRequest,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.toString() });
        }
    }

    // [GET] /api/maintenance-request/:id
    async getMaintenanceRequest(req, res) {
        const { id } = req.params;

        try {
            const maintenanceRequest = await MaintenanceRequest.findById(id)
                .populate('contract', '-__v');

            if (!maintenanceRequest) {
                return res.status(404).json({ message: "Maintenance request not found" });
            }

            return res.status(200).json({ maintenanceRequest });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.toString() });
        }
    }

    // [DELETE] /api/maintenance-request/delete/:id
    async deleteMaintenanceRequest(req, res) {
        const { id } = req.params;

        try {
            const maintenanceRequest = await MaintenanceRequest.findById(id);

            if (!maintenanceRequest) {
                return res.status(404).json({ message: "Maintenance request not found" });
            }

            await maintenanceRequest.remove();

            return res.status(200).json({ message: "Maintenance request deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.toString() });
        }
    }

    // [POST] /api/maintenance-request/update/:id
    async updateMaintenanceRequest(req, res) {
        const { id } = req.params;
        const { title, price, request_status, progress_status, payment_status } = req.body;

        try {
            const maintenanceRequest = await MaintenanceRequest.findById(id);

            if (!maintenanceRequest) {
                return res.status(404).json({ message: "Maintenance request not found" });
            }

            // Cập nhật thông tin phiếu bảo trì
            maintenanceRequest.title = title || maintenanceRequest.title;
            maintenanceRequest.price = price || maintenanceRequest.price;
            maintenanceRequest.request_status = request_status || maintenanceRequest.request_status;
            maintenanceRequest.progress_status = progress_status || maintenanceRequest.progress_status;
            maintenanceRequest.payment_status = payment_status || maintenanceRequest.payment_status;

            await maintenanceRequest.save();

            return res.status(200).json({
                message: "Maintenance request updated successfully",
                maintenanceRequest
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.toString() });
        }
    }

    // [GET] /api/maintenance-request
    async getAllMaintenanceRequests(req, res) {
        try {
            const maintenanceRequests = await MaintenanceRequest.find()
                .populate('contract', '-__v');

            return res.status(200).json({ maintenanceRequests });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.toString() });
        }
    }
}

module.exports = new MaintenanceRequestController();
