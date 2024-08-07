const db = require("../config/db");

exports.getWishlistItems = (req, res) => {
  const userId = req.headers.userid;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `
    SELECT items.id, items.title, items.price, items.imageUrl
    FROM wishlist
    JOIN items ON wishlist.item_id = items.id
    WHERE wishlist.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching wishlist items:", err);
      return res.status(500).json({ message: "Failed to retrieve wishlist items" });
    }

    res.json(results);
  });
};

exports.addToWishlist = (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ message: "User ID and Item ID are required" });
  }

  const query = `
    INSERT INTO wishlist (user_id, item_id)
    VALUES (?, ?)
  `;

  db.query(query, [userId, itemId], (err, results) => {
    if (err) {
      console.error("Error adding item to wishlist:", err);
      return res.status(500).json({ message: "Failed to add item to wishlist" });
    }

    res.json({ message: "Item added to wishlist" });
  });
};

exports.removeFromWishlist = (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ message: "User ID and Item ID are required" });
  }

  const query = `
    DELETE FROM wishlist WHERE user_id = ? AND item_id = ?
  `;

  db.query(query, [userId, itemId], (err, results) => {
    if (err) {
      console.error("Error removing item from wishlist:", err);
      return res.status(500).json({ message: "Failed to remove item from wishlist" });
    }

    res.json({ message: "Item removed from wishlist" });
  });
};

exports.getWishlistStatus = (req, res) => {
  const userId = req.query.userId;
  const itemId = req.query.itemId;

  if (!userId || !itemId) {
    return res.status(400).json({ message: "User ID and Item ID are required" });
  }

  const query = `
    SELECT 1 FROM wishlist WHERE user_id = ? AND item_id = ?
  `;

  db.query(query, [userId, itemId], (err, results) => {
    if (err) {
      console.error("Error fetching wishlist status:", err);
      return res.status(500).json({ message: "Failed to fetch wishlist status" });
    }

    const isInWishlist = results.length > 0;
    res.json({ isInWishlist });
  });
};
