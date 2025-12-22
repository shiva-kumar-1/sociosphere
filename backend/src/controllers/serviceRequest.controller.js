const ServiceRequest = require("../models/ServiceRequest.model");

/**
 * Create a new service request
 */
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      userId,
      serviceId,
      user,        // 👈 allow this also
      service,     // 👈 allow this also
      description,
      images,
      location,
      preferredTime,
    } = req.body;

    const request = await ServiceRequest.create({
      user: userId || user,           // ✅ works for both
      service: serviceId || service,  // ✅ works for both
      description,
      images,
      location,
      preferredTime,
      status: "OPEN",
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Get all service requests
 */
exports.getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("user")
      .populate("service")
      .populate("selectedProvider");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
