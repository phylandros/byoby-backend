// const multer = require('multer');
// const path = require('path');
// const db = require("../config/db");

// // Konfigurasi penyimpanan untuk multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'assets/img_kategori'); // Tentukan folder penyimpanan
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Simpan file dengan nama yang unik berdasarkan timestamp
//   }
// });

// const upload = multer({ storage: storage });

// // Fungsi untuk mengambil semua kategori
// const getCategories = (req, res) => {
//   const query = "SELECT * FROM categories";

//   db.query(query, (err, categoryResults) => {
//     if (err) {
//       console.error("Error fetching categories:", err);
//       return res.status(500).json({ message: "Failed to retrieve categories" });
//     }

//     res.json(categoryResults);
//   });
// };

// // Fungsi untuk mengambil kategori berdasarkan ID
// const getCategoryById = (req, res) => {
//   const categoryId = req.params.id;
//   const query = "SELECT * FROM categories WHERE id = ?";

//   db.query(query, [categoryId], (err, categoryResults) => {
//     if (err) {
//       console.error("Error fetching category:", err);
//       return res.status(500).json({ message: "Failed to retrieve category" });
//     }

//     if (categoryResults.length === 0) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // Menyembunyikan `category_id` dari hasil
//     const { id, ...categoryData } = categoryResults[0];
//     res.json(categoryData);
//   });
// };


// const createCategory = (req, res) => {
//   upload.single('image')(req, res, function (err) {
//     if (err) {
//       console.error("Error uploading file:", err);
//       return res.status(500).json({ message: "Failed to upload image" });
//     }

//     // Dapatkan URL gambar dari lokasi penyimpanan
//     const imageUrl = req.file ? `/assets/img_kategori/${req.file.filename}` : null;

//     console.log("Image URL:", imageUrl); // Logging imageUrl untuk verifikasi
//     console.log("Post Data:", req.body); // Logging data lainnya untuk verifikasi

//     const { name } = req.body;

//     // Cek apakah imageUrl null sebelum disimpan ke database
//     if (!imageUrl) {
//       return res.status(400).json({ message: "Image URL cannot be null" });
//     }

//     const insertQuery = `
//       INSERT INTO categories (name, imageUrl)
//       VALUES (?, ?)
//     `;

//     db.query(
//       insertQuery,
//       [name, imageUrl],
//       (err, result) => {
//         if (err) {
//           console.error("Error inserting category:", err);
//           return res.status(500).json({ message: "Failed to create category" });
//         }

//         res.status(201).json({ message: "Category created successfully", categoryId: result.insertId });
//       }
//     );
//   });
// };



// module.exports = {
//   getCategories,
//   getCategoryById,
//   createCategory,
// };

const db = require("../config/db");
const { uploadCategoryImage, verifyToken } = require("../config/middleware");

// Fungsi untuk mengambil semua kategori
const getCategories = [verifyToken, (req, res) => {
  const query = "SELECT * FROM categories";

  db.query(query, (err, categoryResults) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: "Failed to retrieve categories" });
    }

    res.json(categoryResults);
  });
}];

// Fungsi untuk mengambil kategori berdasarkan ID
const getCategoryById = [verifyToken, (req, res) => {
  const categoryId = req.params.id;
  const query = "SELECT * FROM categories WHERE id = ?";

  db.query(query, [categoryId], (err, categoryResults) => {
    if (err) {
      console.error("Error fetching category:", err);
      return res.status(500).json({ message: "Failed to retrieve category" });
    }

    if (categoryResults.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Menyembunyikan `category_id` dari hasil
    const { id, ...categoryData } = categoryResults[0];
    res.json(categoryData);
  });
}];

// Fungsi untuk membuat kategori baru
const createCategory = [verifyToken, uploadCategoryImage.single('image'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  // Dapatkan URL gambar dari lokasi penyimpanan
  const imageUrl = req.file ? `/assets/img_kategori/${req.file.filename}` : null;

  console.log("Image URL:", imageUrl); // Logging imageUrl untuk verifikasi
  console.log("Post Data:", req.body); // Logging data lainnya untuk verifikasi

  const { name } = req.body;

  // Cek apakah imageUrl null sebelum disimpan ke database
  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL cannot be null" });
  }

  const insertQuery = `
    INSERT INTO categories (name, imageUrl)
    VALUES (?, ?)
  `;

  db.query(insertQuery, [name, imageUrl], (err, result) => {
    if (err) {
      console.error("Error inserting category:", err);
      return res.status(500).json({ message: "Failed to create category" });
    }

    res.status(201).json({ message: "Category created successfully", categoryId: result.insertId });
  });
}];

// Fungsi untuk mengupdate kategori berdasarkan ID
const updateCategory = [verifyToken, uploadCategoryImage.single('image'), (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  // Cek jika ada file yang diunggah dan valid
  let imageUrl = req.body.imageUrl;

  if (req.file) {
    imageUrl = `/assets/img_kategori/${req.file.filename}`;
  }

  const updateQuery = `
    UPDATE categories 
    SET name = ?, imageUrl = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, imageUrl, categoryId], (err, result) => {
    if (err) {
      console.error("Error updating category:", err);
      return res.status(500).json({ message: "Failed to update category" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated successfully" });
  });
}];

const deleteCategory = [verifyToken, (req, res) => {
  const categoryId = req.params.id;

  const deleteQuery = "DELETE FROM categories WHERE id = ?";

  db.query(deleteQuery, [categoryId], (err, result) => {
      if (err) {
          console.error("Error deleting category:", err);
          return res.status(500).json({ message: "Failed to delete category" });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
  });
}];


module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,  
  deleteCategory,
};
