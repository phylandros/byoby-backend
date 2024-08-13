require("dotenv").config();
const express = require("express");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require('./routes/wishlistRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const userRoutes = require("./routes/userRoutes");

// Import upload middleware and verifyToken
const { uploadProductImage, verifyToken } = require('./config/middleware');

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Middleware untuk serving static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use("/auth", authRoutes); // Rute untuk otentikasi tidak memerlukan token

// Middleware untuk memverifikasi token sebelum semua rute berikutnya
app.use(verifyToken);

app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/address", addressRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/recommendations', recommendRoutes);
app.use("/users", userRoutes);


const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
