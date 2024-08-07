// routes/cartRoutes.js
const express = require("express");
const {
  getCartItems,
  addToCart,
  deleteCartItem,
  updateCartItemQuantity,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", getCartItems);
router.post("/add", addToCart);
router.post("/delete", deleteCartItem);
router.post("/update-quantity", updateCartItemQuantity);

module.exports = router;
