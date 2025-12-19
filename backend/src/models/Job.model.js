const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      unique: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    agreedPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ASSIGNED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
