const Bid = require("../models/Bid.model");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /* ---------------- USER ROOM ---------------- */
    socket.on("join_user", (userId) => {
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`👤 User joined room: ${room}`);
    });

    /* ---------------- PROVIDER ROOM ---------------- */
    socket.on("join_provider", (providerId) => {
      const room = `provider_${providerId}`;
      socket.join(room);
      console.log(`🧑‍🔧 Provider joined room: ${room}`);
    });

    /* ---------------- REQUEST ROOM ---------------- */
    socket.on("join_request", (requestId) => {
      const room = `request_${requestId}`;
      socket.join(room);
      console.log(`📦 Joined request room: ${room}`);
    });

    /* ---------------- NEW SERVICE REQUEST ---------------- */
    socket.on("new_service_request", ({ requestId, location }) => {
      console.log("📢 New service request:", requestId, location);

      // broadcast to all providers (later we filter by location)
      socket.broadcast.emit("broadcast_request", {
        requestId,
        location,
      });
    });

    /* ---------------- PLACE BID ---------------- */
   /* ---------------- PLACE BID (CREATE OR UPDATE) ---------------- */
socket.on("place_bid", async ({ requestId, providerId, amount }) => {
  try {
    console.log("💰 Bid attempt:", requestId, providerId, amount);

    // 1️⃣ Check if bid already exists
    let bid = await Bid.findOne({
      serviceRequest: requestId,
      provider: providerId,
    });

    if (bid) {
      // 2️⃣ Update existing bid
      bid.amount = amount;
      bid.status = "PENDING";
      await bid.save();

      console.log("🔄 Bid updated");
    } else {
      // 3️⃣ Create new bid
      bid = await Bid.create({
        serviceRequest: requestId,
        provider: providerId,
        amount,
      });

      console.log("🆕 New bid created");
    }

    // 4️⃣ Emit updated bid to request room
    io.to(`request_${requestId}`).emit("new_bid", {
      bidId: bid._id,
      providerId,
      amount: bid.amount,
      updatedAt: bid.updatedAt,
    });

  } catch (error) {
    console.error("❌ Error placing bid:", error.message);
  }
});



    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};
