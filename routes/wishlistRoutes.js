const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.get("/", wishlistController.getWishlistItems);
router.post("/add", wishlistController.addToWishlist);
router.post("/remove", wishlistController.removeFromWishlist);
router.get("/status", wishlistController.getWishlistStatus); // Tambahkan rute ini

module.exports = router;
