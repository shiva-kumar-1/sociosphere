const express = require("express");
const router = express.Router();
const providerController = require("../controllers/provider.controller");

router.post("/", providerController.createProviderProfile);
router.get("/", providerController.getAllProviders);

module.exports = router;
