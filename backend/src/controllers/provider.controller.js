const ProviderProfile = require("../models/ProviderProfile.model");
const User = require("../models/User.model");

/**
 * CREATE Provider Profile (ONE TIME ONLY)
 * services = [{ name, price }]
 */
exports.createProviderProfile = async (req, res) => {
  try {
    const { email, services, bio, basePrice, location } = req.body;

    if (!email || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "Email and at least one service with price are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await ProviderProfile.findOne({ user: user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Provider profile already exists" });
    }

    const provider = await ProviderProfile.create({
      user: user._id,
      services,
      bio,
      basePrice,
      location,
    });

    user.role = "PROVIDER";
    await user.save();

    res.status(201).json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET all providers
 */
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate("user", "-__v")
      .select("-__v");

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE Provider Profile USING EMAIL
 * - Add new services
 * - Update existing service price
 * - Update bio, basePrice, location
 */
exports.updateProviderProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const { services, bio, basePrice, location } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const provider = await ProviderProfile.findOne({ user: user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    /**
     * services = [{ name, price }]
     * - update price if exists
     * - add if new
     */
    if (Array.isArray(services)) {
      services.forEach((incoming) => {
        const existing = provider.services.find(
          (s) => s.name.toLowerCase() === incoming.name.toLowerCase()
        );

        if (existing) {
          existing.price = incoming.price; // update price
        } else {
          provider.services.push(incoming); // add new service
        }
      });
    }

    if (bio !== undefined) provider.bio = bio;
    if (basePrice !== undefined) provider.basePrice = basePrice;
    if (location) provider.location = location;

    await provider.save();
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * REMOVE a service by name USING EMAIL
 */
exports.removeServiceByEmail = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const { serviceName } = req.body;

    if (!serviceName) {
      return res.status(400).json({ message: "serviceName is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const provider = await ProviderProfile.findOne({ user: user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.services = provider.services.filter(
      (s) => s.name.toLowerCase() !== serviceName.toLowerCase()
    );

    await provider.save();

    res.status(200).json({
      message: "Service removed successfully",
      services: provider.services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
