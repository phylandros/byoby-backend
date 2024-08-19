const db = require("../config/db");
const { verifyToken } = require("../config/middleware");

exports.createOrder = [verifyToken, (req, res) => {
  const {
    userId,
    addressId,
    paymentMethodId,
    courier,
    items,
    totalAmount,
    shippingCost,
    transaksiStatus,
    midtransOrderId
  } = req.body;

  const orderQuery = `
    INSERT INTO orders (user_id, address_id, payment_method_id, courier, total_amount, shipping_cost, transaction_status, midtrans_order_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    orderQuery,
    [userId, addressId, paymentMethodId, courier, totalAmount, shippingCost, transaksiStatus, midtransOrderId],
    (err, result) => {
      if (err) {
        console.error("Error creating order:", err);
        return res.status(500).send("Error creating order");
      }

      const orderId = result.insertId;

      const cartIds = items.map((item) => item.cartId);

      const fetchCartItemsQuery = `SELECT cart_items.id AS cart_id, items.id AS item_id, items.price 
                                   FROM cart_items 
                                   JOIN items ON cart_items.item_id = items.id 
                                   WHERE cart_items.id IN (?)`;

      db.query(fetchCartItemsQuery, [cartIds], (err, results) => {
        if (err) {
          console.error("Error fetching cart items:", err);
          return res.status(500).send("Error fetching cart items");
        }

        const orderItems = items.map((item) => {
          const matchedItem = results.find(
            (result) => result.cart_id === item.cartId
          );
          return [
            orderId,
            matchedItem.item_id,
            item.quantity,
            matchedItem.price,
            item.sizeId,
            item.colorId,
          ];
        });

        const orderItemsQuery = `
          INSERT INTO order_items (order_id, item_id, quantity, price, size_id, color_id)
          VALUES ?
        `;

        db.query(orderItemsQuery, [orderItems], (err, result) => {
          if (err) {
            console.error("Error creating order items:", err);
            return res.status(500).send("Error creating order items");
          }

          const deleteCartItemsQuery = `
            DELETE FROM cart_items WHERE id IN (?)
          `;

          db.query(deleteCartItemsQuery, [cartIds], (err, result) => {
            if (err) {
              console.error("Error deleting cart items:", err);
              return res.status(500).send("Error deleting cart items");
            }

            res.status(201).send("Order created and cart items deleted successfully");
          });
        });
      });
    }
  );
}];

exports.updateTransactionStatus = [verifyToken, (req, res) => {
  const { midtrans_order_id, status, resi } = req.body;

  if (!midtrans_order_id || !status) {
    return res.status(400).json({ message: 'Midtrans Order ID and Status are required' });
  }

  let query = 'UPDATE orders SET transaction_status = ?';
  const queryParams = [status];

  if (status === 'Dikirim' && resi) {
    query += ', tracking_number = ?';
    queryParams.push(resi);
  }

  query += ' WHERE midtrans_order_id = ?';
  queryParams.push(midtrans_order_id);

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error updating transaction status:', err);
      return res.status(500).json({ message: 'Failed to update transaction status' });
    }

    res.json({ message: 'Transaction status updated successfully' });
  });
}];

exports.getOrdersByStatus = [verifyToken, (req, res) => {
  const { userId, status } = req.query;

  if (!userId || !status) {
    return res.status(400).json({ message: 'User ID and Status are required' });
  }

  const query = `
    SELECT o.id, o.tracking_number, o.total_amount, o.shipping_cost, o.transaction_status AS status, o.midtrans_order_id, oi.item_id, oi.quantity, i.title, i.price, i.imageUrl
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN items i ON oi.item_id = i.id
    WHERE o.user_id = ? AND o.transaction_status = ?
  `;

  db.query(query, [userId, status], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }

    const orders = results.reduce((acc, row) => {
      const order = acc.find(o => o.id === row.id);
      if (order) {
        order.items.push({
          id: row.item_id,
          title: row.title,
          price: row.price,
          quantity: row.quantity,
          imageUrl: row.imageUrl,
        });
      } else {
        acc.push({
          id: row.id,
          total_amount: row.total_amount,
          shipping_cost: row.shipping_cost,
          status: row.status,
          midtrans_order_id: row.midtrans_order_id,
          tracking_number: row.tracking_number,
          items: [{
            id: row.item_id,
            title: row.title,
            price: row.price,
            quantity: row.quantity,
            imageUrl: row.imageUrl,
          }],
        });
      }
      return acc;
    }, []);

    res.json(orders);
  });
}];

exports.submitReview = [verifyToken, (req, res) => {
  const { order_id, rating, review } = req.body;

  if (!order_id || rating == null || !review) {
    return res.status(400).json({ message: 'Order ID, rating, and review are required' });
  }

  const insertReviewQuery = `
    INSERT INTO reviews (order_id, rating, review)
    VALUES (?, ?, ?)
  `;

  db.query(insertReviewQuery, [order_id, rating, review], (err, result) => {
    if (err) {
      console.error('Error submitting review:', err);
      return res.status(500).json({ message: 'Failed to submit review' });
    }

    // Setelah berhasil menyimpan review, ambil item_id dari order_items yang terkait dengan order_id ini
    const fetchItemIdQuery = `
      SELECT item_id FROM order_items WHERE order_id = ?
    `;

    db.query(fetchItemIdQuery, [order_id], (err, itemResults) => {
      if (err) {
        console.error('Error fetching item ID:', err);
        return res.status(500).json({ message: 'Failed to fetch item ID' });
      }

      if (itemResults.length === 0) {
        return res.status(404).json({ message: 'Item not found for the given order ID' });
      }

      const itemId = itemResults[0].item_id;

      // Hitung rata-rata rating untuk item ini
      const updateRatingQuery = `
        UPDATE items i
        JOIN (
          SELECT AVG(r.rating) AS average_rating
          FROM reviews r
          JOIN order_items oi ON r.order_id = oi.order_id
          WHERE oi.item_id = ?
        ) avg_rating ON i.id = ?
        SET i.rating = avg_rating.average_rating
        WHERE i.id = ?;
      `;

      db.query(updateRatingQuery, [itemId, itemId, itemId], (err, updateResult) => {
        if (err) {
          console.error('Error updating item rating:', err);
          return res.status(500).json({ message: 'Failed to update item rating' });
        }

        res.status(201).json({ message: 'Review submitted and item rating updated successfully' });
      });
    });
  });
}];


exports.getAllOrders = [verifyToken, (req, res) => {
  const query = `
    SELECT o.id, o.created_at AS tanggal_order, u.email AS user_email, a.full_name AS recipient_name, o.total_amount, o.shipping_cost, 
           o.transaction_status AS status, o.midtrans_order_id, 
           GROUP_CONCAT(CONCAT(i.title, ' (', oi.quantity, 'x)')) AS items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN addresses a ON o.address_id = a.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN items i ON oi.item_id = i.id
    WHERE o.transaction_status != 'Selesai'
    GROUP BY o.id, u.email, a.full_name, o.total_amount, o.shipping_cost, o.transaction_status, o.midtrans_order_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }

    res.json(results);
  });
}];

exports.getAllTransaction = [verifyToken, (req, res) => {
  const query = `
    SELECT o.id, o.created_at AS tanggal_order , u.email AS user_email, a.full_name AS recipient_name, o.total_amount, o.shipping_cost, 
           o.transaction_status AS status, o.midtrans_order_id, 
           GROUP_CONCAT(CONCAT(i.title, ' (', oi.quantity, 'x)')) AS items,
           r.rating, r.review, r.created_at As tanggal_selesai
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN addresses a ON o.address_id = a.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN items i ON oi.item_id = i.id
    LEFT JOIN reviews r ON o.id = r.order_id
    WHERE o.transaction_status = 'Selesai'
    GROUP BY o.id, u.email, a.full_name, o.total_amount, o.shipping_cost, o.transaction_status, o.midtrans_order_id, r.rating, r.review, r.created_at;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }

    res.json(results);
  });
}];
