const db = require("../config/db");

const getCartItems = (req, res) => {
  const userId = req.headers.userid;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `
    SELECT cart_items.id, cart_items.quantity, items.id AS item_id, items.title, items.price, items.imageUrl,
           sizes.id AS size_id, sizes.name AS size_name,
           colors.id AS color_id, colors.name AS color_name, colors.hex_value
    FROM cart_items
    JOIN items ON cart_items.item_id = items.id
    LEFT JOIN sizes ON cart_items.size_id = sizes.id
    LEFT JOIN colors ON cart_items.color_id = colors.id
    WHERE cart_items.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      return res.status(500).json({ message: "Failed to retrieve cart items" });
    }

    res.json(results);
  });
};

const addToCart = (req, res) => {
  const { userId, itemId, quantity, selectedSizeId, selectedColorId } = req.body;

  if (!userId || !itemId || !quantity) {
    return res.status(400).json({ message: "User ID, Item ID, and Quantity are required" });
  }

  const query = `
    INSERT INTO cart_items (user_id, item_id, quantity, size_id, color_id)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;

  db.query(query, [userId, itemId, quantity, selectedSizeId || null, selectedColorId || null], (err, results) => {
    if (err) {
      console.error("Error adding item to cart:", err);
      return res.status(500).json({ message: "Failed to add item to cart" });
    }
    res.json({ message: "Item added to cart" });
  });
};

const deleteCartItem = (req, res) => {
  const { cartItemId } = req.body;
  console.log(`Deleting cart item with cartItemId: ${cartItemId}`);

  const query = `
    DELETE FROM cart_items WHERE id = ?
  `;

  db.query(query, [cartItemId], (err, results) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return res.status(500).json({ message: "Failed to delete cart item" });
    }

    if (results.affectedRows === 0) {
      console.log(`No cart item found with id: ${cartItemId}`);
      return res.status(404).json({ message: "Cart item not found" });
    }

    console.log(`Deleted cart item with id: ${cartItemId}`);
    res.json({ message: "Cart item deleted" });
  });
};

const getTotalPrice = (req, res) => {
  const { userId } = req.body;
  console.log(`Calculating total price for userId: ${userId}`);

  const query = `
    SELECT SUM(items.price * cart_items.quantity) AS total
    FROM cart_items
    JOIN items ON cart_items.item_id = items.id
    WHERE cart_items.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error calculating total price:", err);
      return res.status(500).json({ message: "Failed to calculate total price" });
    }

    const total = results[0].total || 0;
    console.log(`Total price for userId ${userId}: ${total}`);
    res.json({ total });
  });
};

const updateCartItemQuantity = (req, res) => {
  const { cartItemId, quantity } = req.body;
  const query = "UPDATE cart_items SET quantity = ? WHERE id = ?";
  db.query(query, [quantity, cartItemId], (err, results) => {
    if (err) {
      console.error("Error updating cart item quantity:", err);
      return res.status(500).json({ message: "Failed to update cart item quantity" });
    }
    res.status(200).json({ message: "Cart item quantity updated successfully" });
  });
};

module.exports = {
  getCartItems,
  addToCart,
  deleteCartItem,
  getTotalPrice,
  updateCartItemQuantity,
};
