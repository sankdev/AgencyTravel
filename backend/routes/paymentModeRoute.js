const express = require("express");
const router = express.Router();
const paymentModeController = require("../controllers/paymentMode");

router.post("/", paymentModeController.create);
router.get("/", paymentModeController.getAll);
router.get("/modes", paymentModeController.getPaymentModes);



module.exports = router;
