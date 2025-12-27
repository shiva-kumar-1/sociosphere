module.exports = (io, socket) => {
  console.log("🔗 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
};
