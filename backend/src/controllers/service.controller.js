const Service = require("../models/Service.model");

/**
 * Create a new service (Admin use)
 */
exports.createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: "Service already exists" });
    }

    const service = await Service.create({ name, description });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all active services
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
