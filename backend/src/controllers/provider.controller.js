const ProviderProfile = require("../models/ProviderProfile.model");
const User = require("../models/User.model");

/**
 * Create Provider Profile
 */
exports.createProviderProfile = async (req, res) => {
  try {
    const { userId, services, bio, basePrice, location } = req.body;

    // check if provider profile already exists
    const existingProfile = await ProviderProfile.findOne({ user: userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Provider profile already exists" });
    }

    // create provider profile
    const providerProfile = await ProviderProfile.create({
      user: userId,
      services,
      bio,
      basePrice,
      location,
    });

    // update user role to PROVIDER
    await User.findByIdAndUpdate(userId, { role: "PROVIDER" });

    res.status(201).json(providerProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all provider profiles
 */
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find().populate("user");
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
