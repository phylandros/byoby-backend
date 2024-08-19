// const db = require("../config/db");
// const bcrypt = require('bcrypt');

// exports.getAllUsers = (req, res) => {
//   const query = `
//     SELECT *
//     FROM users;
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching users:", err);
//       return res.status(500).json({ message: "Failed to fetch users" });
//     }

//     res.json(results);
//   });
// };

// exports.updateUser = (req, res) => {
//   const { id } = req.params;
//   const { email, password } = req.body;

//   // Jumlah salt rounds untuk bcrypt (default yang baik adalah 10)
//   const saltRounds = 10;

//   // Enkripsi password sebelum menyimpannya ke database
//   bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
//     if (err) {
//       console.error("Error hashing password:", err);
//       return res.status(500).json({ message: "Failed to hash password" });
//     }

//     const query = `
//       UPDATE users
//       SET email = ?, password = ?
//       WHERE id = ?
//     `;

//     db.query(query, [email, hashedPassword, id], (err, result) => {
//       if (err) {
//         console.error("Error updating user:", err);
//         return res.status(500).json({ message: "Failed to update user" });
//       }

//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       res.json({ message: "User updated successfully" });
//     });
//   });
// };

// exports.deleteUser = (req, res) => {
//   const { id } = req.params;

//   const query = `
//     DELETE FROM users
//     WHERE id = ?
//   `;

//   db.query(query, [id], (err, result) => {
//     if (err) {
//       console.error("Error deleting user:", err);
//       return res.status(500).json({ message: "Failed to delete user" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully" });
//   });
// };


const db = require("../config/db");
const bcrypt = require('bcrypt');
const { verifyToken } = require("../config/middleware");


exports.getAllUsers = [verifyToken, (req, res) => {
  const query = `
    SELECT *
    FROM users;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    res.json(results);
  });
}];

exports.createUser = [verifyToken, (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
      console.log("Email, password, and role are required for creating a user.");
      return res.status(400).json({ message: "Email, password, and role are required." });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ message: "Failed to hash password" });
      }

      const query = `
          INSERT INTO users (email, password, role)
          VALUES (?, ?, ?)
      `;

      db.query(query, [email, hashedPassword, role], (err, result) => {
          if (err) {
              console.error("Error inserting user:", err);
              return res.status(500).json({ message: "Failed to create user" });
          }

          res.status(201).json({ message: "User created successfully", userId: result.insertId });
      });
  });
}];


exports.updateUser = [verifyToken, (req, res) => {
  const { id } = req.params;
  let { email, password, role } = req.body;

  // Logging semua parameter yang diterima
  console.log("Update request received for user ID:", id);
  console.log("Received data - Email:", email, "Password:", password ? "Provided" : "Not provided", "Role:", role);
  console.log("Full request body:", req.body);

  if (!email || !role) {
      console.error("No email or role provided for update.");
      return res.status(400).json({ message: "Email and role are required" });
  }

  const updateUser = (email, hashedPassword) => {
      const query = `
          UPDATE users
          SET email = ?, password = ?, role = ?
          WHERE id = ?
      `;

      db.query(query, [email, hashedPassword, role, id], (err, result) => {
          if (err) {
              console.error("Error updating user:", err);
              return res.status(500).json({ message: "Failed to update user" });
          }

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "User not found" });
          }

          res.json({ message: "User updated successfully" });
      });
  };

  if (password) {
      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) {
              console.error("Error hashing password:", err);
              return res.status(500).json({ message: "Failed to hash password" });
          }
          updateUser(email, hashedPassword);
      });
  } else {
      const query = `SELECT password FROM users WHERE id = ?`;
      db.query(query, [id], (err, results) => {
          if (err) {
              console.error("Error fetching password:", err);
              return res.status(500).json({ message: "Failed to fetch password" });
          }

          if (results.length === 0) {
              return res.status(404).json({ message: "User not found" });
          }

          const hashedPassword = results[0].password;
          updateUser(email, hashedPassword);
      });
  }
}];


exports.deleteUser = [verifyToken, (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM users
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Failed to delete user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
}];
