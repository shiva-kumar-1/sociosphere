const User = require("../models/User.model");

/**
 * Create new user (OTP / OAuth placeholder)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, authProvider } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(200).json(user);
    }

    user = await User.create({
      name,
      email,
      phone,
      authProvider,
      isVerified: true,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all users (admin/debug)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
