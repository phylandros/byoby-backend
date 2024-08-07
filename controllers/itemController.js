const db = require("../config/db");

const getItems = (req, res) => {
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

      // console.log("Executing query:", query, values);

      db.query(query, values, (err, itemResults) => {
        if (err) {
          console.error("Error fetching items:", err);
          return res.status(500).json({ message: "Failed to retrieve items" });
        }
        // console.log("Query results:", itemResults);
        res.json(itemResults);
      });
    });
  } else {
    if (searchQuery) {
      query += " WHERE title LIKE ?";
      values = [`%${searchQuery}%`];
    }

    // console.log("Executing query:", query, values);

    db.query(query, values, (err, itemResults) => {
      if (err) {
        console.error("Error fetching items:", err);
        return res.status(500).json({ message: "Failed to retrieve items" });
      }
      // console.log("Query results:", itemResults);
      res.json(itemResults);
    });
  }
};

const getItemById = (req, res) => {
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
        return res
          .status(500)
          .json({ message: "Failed to retrieve item sizes" });
      }

      const colorQuery = `
        SELECT colors.id, colors.name, colors.hex_value FROM colors
        JOIN item_colors ON colors.id = item_colors.color_id
        WHERE item_colors.item_id = ?`;
      db.query(colorQuery, [itemId], (err, colorResults) => {
        if (err) {
          console.error("Error fetching colors:", err);
          return res
            .status(500)
            .json({ message: "Failed to retrieve item colors" });
        }

        item.sizes = sizeResults;
        item.colors = colorResults;

        res.json(item);
      });
    });
  });
};

module.exports = {
  getItems,
  getItemById,
};
