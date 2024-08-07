const express = require("express");
const { getPaymentMethods } = require("../controllers/paymentMethodController");

const router = express.Router();

router.get("/", getPaymentMethods);

module.exports = router;
