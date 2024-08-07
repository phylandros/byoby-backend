const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create", orderController.createOrder);
router.post("/update-transaction-status", orderController.updateTransactionStatus);
router.get("/", orderController.getOrdersByStatus);
router.post("/submit-review", orderController.submitReview);

module.exports = router;
