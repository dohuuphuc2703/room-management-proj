const Contract = require("../models/Contract.model");
const Tenant = require("../models/Tenant.model");
const Room = require("../models/Room.model");
const Landlord = require("../models/Landlord.model");

class ContractController {
  // [POST] /api/contract/create
  async createContract(req, res) {
    const landlord = req.user.uid;
    const { tenant, room, size, start_date, members } = req.body;

    try {
      // Kiểm tra xem tenant có tồn tại không
      const foundTenant = await Tenant.findById(tenant);
      if (!foundTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Kiểm tra xem landlord có tồn tại không
      const foundLandlord = await Landlord.findById(landlord);
      if (!foundLandlord) {
        return res.status(404).json({ message: "Landlord not found" });
      }

      // Kiểm tra xem room có tồn tại không
      const foundRoom = await Room.findById(room);
      if (!foundRoom) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Tạo hợp đồng nếu tất cả đều tồn tại
      const newContract = new Contract({
        tenant,
        landlord,
        room,
        size,
        start_date,
        members,
      });

      await newContract.save();

      return res.status(201).json({
        message: "Contract created successfully",
        contract: newContract,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [GET] /api/contract/:id
  async getContract(req, res) {
    const { id } = req.params;

    try {
      const contract = await Contract.findById(id)
        .populate("tenant", "-__v")
        .populate("landlord", "-__v")
        .populate("room", "-__v");

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      return res.status(200).json({ contract });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [DELETE] /api/contract/delete/:id
  async deleteContract(req, res) {
    const { id } = req.params;

    try {
      const contract = await Contract.findById(id);

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      await contract.remove();

      return res.status(200).json({ message: "Contract deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [GET] /api/contract/byLandlord
  async getContractsByLandlord(req, res) {
    const landlordId = req.user.uid; // Lấy landlordId từ thông tin user đã đăng nhập

    try {
      const contracts = await Contract.find({ landlord: landlordId }) // Tìm hợp đồng của landlord đó
        .populate({
          path: "tenant",
          populate: {
            path: "user",
            select: "email fullName", // Chỉ lấy các trường mong muốn
          },
        })
        .populate("landlord", "-__v")
        .populate("room", "-__v");

      return res.status(200).json({ contracts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }
}

module.exports = new ContractController();
