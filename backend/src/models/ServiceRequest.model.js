const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
      },
    },

    preferredTime: {
      type: String,
    },

    status: {
      type: String,
      enum: ["OPEN", "BIDDING", "ASSIGNED", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },

    selectedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
