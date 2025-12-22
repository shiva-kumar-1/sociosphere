const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");

router.post("/", serviceController.createService);
router.get("/", serviceController.getAllServices);

module.exports = router;
