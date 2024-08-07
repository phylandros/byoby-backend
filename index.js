require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require('./routes/wishlistRoutes');
const recommendRoutes = require('./routes/recommendRoutes'); // Tambahkan ini

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/address", addressRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/recommendations', recommendRoutes);


const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
