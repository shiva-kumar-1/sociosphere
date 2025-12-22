const express = require("express");
const router = express.Router();
const controller = require("../controllers/serviceRequest.controller");

router.post("/", controller.createServiceRequest);
router.get("/", controller.getAllServiceRequests);

module.exports = router;
