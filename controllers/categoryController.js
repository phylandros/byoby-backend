const db = require("../config/db");

const getCategories = (req, res) => {
  const query = "SELECT * FROM categories";

  db.query(query, (err, categoryResults) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: "Failed to retrieve categories" });
    }

    res.json(categoryResults);
  });
};

module.exports = {
  getCategories,
};
