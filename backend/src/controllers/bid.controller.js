const Bid = require("../models/Bid.model");
const Job = require("../models/Job.model");
const ServiceRequest = require("../models/ServiceRequest.model");

exports.selectBid = async (req, res) => {
  try {
    const { bidId } = req.body;

    // 1️⃣ Find the bid
    const bid = await Bid.findById(bidId).populate("serviceRequest");
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const requestId = bid.serviceRequest._id;

    // 2️⃣ Accept selected bid
    bid.status = "ACCEPTED";
    await bid.save();

    // 3️⃣ Reject other bids
    await Bid.updateMany(
      { serviceRequest: requestId, _id: { $ne: bidId } },
      { status: "REJECTED" }
    );

    // 4️⃣ Update service request
    await ServiceRequest.findByIdAndUpdate(requestId, {
      status: "ASSIGNED",
      selectedProvider: bid.provider,
    });

    // 5️⃣ Create Job
    const job = await Job.create({
      serviceRequest: requestId,
      provider: bid.provider,
      user: bid.serviceRequest.user,
      agreedPrice: bid.amount,
    });

    res.status(200).json({
      message: "Bid selected & job created",
      job,
    });
  } catch (error) {
    console.error("❌ Select bid error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
