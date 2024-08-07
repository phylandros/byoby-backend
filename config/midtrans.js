// midtrans.js
const midtransClient = require("midtrans-client");

// Create Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-akBFUahgS-8RZukjbb0T3RMJ",
  clientKey: "SB-Mid-client-E923djX1CCnzXoBG",
});

module.exports = snap;
