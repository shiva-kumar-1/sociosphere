const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bid.controller");

router.post("/select", bidController.selectBid);

module.exports = router;
