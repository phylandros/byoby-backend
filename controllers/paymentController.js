const db = require("../config/db");
const midtransClient = require("midtrans-client");
require("dotenv").config();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

exports.createPayment = async (req, res) => {
  const { userId, orderId, totalAmount } = req.body;

  try {
    const transactionDetails = {
      order_id: `order-${orderId}-${Date.now()}`,
      gross_amount: totalAmount,
    };

    const customerDetails = {
      userId: userId,
    };

    const parameter = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      enabled_payments: ["bank_transfer", "gopay", "shopeepay"],
    };

    const transaction = await snap.createTransaction(parameter);

    const paymentUrl = transaction.redirect_url;
    const vaNumbers = transaction.va_numbers || [];

    const paymentData = {
      user_id: userId,
      order_id: orderId,
      amount: totalAmount,
      status: "pending",
      created_at: new Date(),
      redirect_url: paymentUrl,
      va_numbers: JSON.stringify(vaNumbers),
    };

    const paymentQuery = `
      INSERT INTO payments (user_id, order_id, amount, status, created_at, redirect_url, va_numbers)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      paymentQuery,
      [
        paymentData.user_id,
        paymentData.order_id,
        paymentData.amount,
        paymentData.status,
        paymentData.created_at,
        paymentData.redirect_url,
        paymentData.va_numbers,
      ],
      (err, result) => {
        if (err) {
          console.error("Error saving payment data:", err);
          return res.status(500).send("Error saving payment data");
        }

        res.status(201).send({
          message: "Payment created successfully",
          paymentUrl,
          vaNumbers,
        });
      }
    );
  } catch (error) {
    console.error("Error creating transaction with Midtrans:", error);
    res.status(500).send("Error creating transaction with Midtrans");
  }
};
