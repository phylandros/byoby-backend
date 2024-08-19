const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    db.query(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Error during query:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [email, hashedPassword, role],
          (err, results) => {
            if (err) {
              console.error("Error during query:", err);
              return res.status(500).json({ message: "Internal server error" });
            }
            res.status(201).json({ message: "User registered successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Error during query:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        if (results.length === 0) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.json({ token, userId: user.id, email: user.email });
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error("Error during query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // Set the default password
      const defaultPassword = '12345678';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Update the user's password in the database
      db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email],
        (err, results) => {
          if (err) {
            console.error("Error during query:", err);
            return res.status(500).json({ message: "Internal server error" });
          }
          res.status(200).json({ message: `Password has been reset to ${defaultPassword}` });
        }
      );
    });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.status(500).json({ message: "An error occurred, please try again later" });
  }
};

module.exports = { register, login, forgotPassword };