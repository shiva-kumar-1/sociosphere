const express = require("express");
const router = express.Router();
const controller = require("../controllers/provider.controller");

router.post("/", controller.createProviderProfile);
router.get("/", controller.getAllProviders);
router.put("/:email", controller.updateProviderProfile);
router.patch("/remove-service/:email", controller.removeServiceByEmail);

module.exports = router;
