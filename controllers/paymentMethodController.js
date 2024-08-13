// const db = require("../config/db");

// exports.getPaymentMethods = (req, res) => {
//   const query = "SELECT * FROM payment_methods";

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching payment methods:", err);
//       res.status(500).send("Error fetching payment methods");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };


const db = require("../config/db");
const { verifyToken } = require("../config/middleware");

exports.getPaymentMethods = [verifyToken, (req, res) => {
  const query = "SELECT * FROM payment_methods";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching payment methods:", err);
      res.status(500).send("Error fetching payment methods");
    } else {
      res.status(200).json(results);
    }
  });
}];
