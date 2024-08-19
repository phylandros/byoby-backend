const db = require("../config/db");
const { uploadProductImage, verifyToken } = require("../config/middleware");

const getItems = [verifyToken, (req, res) => {
  const searchQuery = req.query.search || "";
  const categoryName = req.query.category || "";

  let query = "SELECT * FROM items";
  
  let values = [];

  if (categoryName) {
    const categoryQuery = "SELECT id FROM categories WHERE name = ?";
    db.query(categoryQuery, [categoryName], (err, categoryResults) => {
      if (err) {
        console.error("Error fetching category:", err);
        return res.status(500).json({ message: "Failed to retrieve items" });
      }

      if (categoryResults.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      const categoryId = categoryResults[0].id;
      query = "SELECT * FROM items WHERE category_id = ?";
      values = [categoryId];

      if (searchQuery) {
        query += " AND title LIKE ?";
        values.push(`%${searchQuery}%`);
      }

      db.query(query, values, (err, itemResults) => {
        if (err) {
          console.error("Error fetching items:", err);
          return res.status(500).json({ message: "Failed to retrieve items" });
        }
        res.json(itemResults);
      });
    });
  } else {
    if (searchQuery) {
      query += " WHERE title LIKE ?";
      values = [`%${searchQuery}%`];
    }

    console.log('Executing SQL:', query, 'with values:', values);

    db.query(query, values, (err, itemResults) => {
      if (err) {
        console.error("Error fetching items:", err);
        return res.status(500).json({ message: "Failed to retrieve items" });
      }
      res.json(itemResults);
    });
  }
}];

const getItemById = [verifyToken, (req, res) => {
  const itemId = req.params.id;

  const itemQuery = "SELECT * FROM items WHERE id = ?";
  db.query(itemQuery, [itemId], (err, itemResults) => {
    if (err) {
      console.error("Error fetching item:", err);
      return res.status(500).json({ message: "Failed to retrieve item" });
    }

    if (itemResults.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = itemResults[0];

    const sizeQuery = `
      SELECT sizes.id, sizes.name FROM sizes
      JOIN item_sizes ON sizes.id = item_sizes.size_id
      WHERE item_sizes.item_id = ?`;
    db.query(sizeQuery, [itemId], (err, sizeResults) => {
      if (err) {
        console.error("Error fetching sizes:", err);
        return res.status(500).json({ message: "Failed to retrieve item sizes" });
      }

      const colorQuery = `
        SELECT colors.id, colors.name, colors.hex_value FROM colors
        JOIN item_colors ON colors.id = item_colors.color_id
        WHERE item_colors.item_id = ?`;
      db.query(colorQuery, [itemId], (err, colorResults) => {
        if (err) {
          console.error("Error fetching colors:", err);
          return res.status(500).json({ message: "Failed to retrieve item colors" });
        }

        item.sizes = sizeResults;
        item.colors = colorResults;

        res.json(item);
      });
    });
  });
}];

const createItem = [verifyToken, uploadProductImage.single('image'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  const imageUrl = req.file ? `/assets/img_produk/${req.file.filename}` : null;

  console.log("Image URL:", imageUrl); // Logging imageUrl untuk verifikasi
  console.log("Post Data:", req.body); // Logging data lainnya untuk verifikasi

  const { title, price, discount, rating, description, category_id } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL cannot be null" });
  }

  const insertQuery = `
    INSERT INTO items (title, imageUrl, price, discount, rating, description, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [title, imageUrl, price, discount, rating, description, category_id],
    (err, result) => {
      if (err) {
        console.error("Error inserting item:", err);
        return res.status(500).json({ message: "Failed to create item" });
      }

      res
        .status(201)
        .json({
          message: "Item created successfully",
          itemId: result.insertId,
        });
    }
  );
}];

const updateItem = [verifyToken, uploadProductImage.single('image'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  const { title, price, discount, rating, description, category_id } = req.body;
  const itemId = req.params.id;

  let imageUrl = req.body.imageUrl;

  if (req.file) {
    imageUrl = `/assets/img_produk/${req.file.filename}`;
  }

  const updateQuery = `
    UPDATE items 
    SET title = ?, imageUrl = ?, price = ?, discount = ?, rating = ?, description = ?, category_id = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [title, imageUrl, price, discount, rating, description, category_id, itemId], (err, result) => {
    if (err) {
      console.error("Error updating item:", err);
      return res.status(500).json({ message: "Failed to update item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully" });
  });
}];

const deleteItem = [verifyToken, (req, res) => {
  const itemId = req.params.id;

  const deleteQuery = "DELETE FROM items WHERE id = ?";

  db.query(deleteQuery, [itemId], (err, result) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res.status(500).json({ message: "Failed to delete item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  });
}];


module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
