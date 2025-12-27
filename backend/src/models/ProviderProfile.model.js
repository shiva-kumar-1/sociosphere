const mongoose = require("mongoose");

/**
 * Each provider can offer multiple services
 * Each service has its own price
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /**
     * Services with per-service pricing
     * Example:
     * [
     *   { name: "Plumbing", price: 300 },
     *   { name: "Electrician", price: 400 }
     * ]
     */
    services: {
      type: [serviceSchema],
      required: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    /**
     * Optional fallback / starting price
     * (NOT used for bidding logic)
     */
    basePrice: {
      type: Number,
      min: 0,
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalJobs: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
