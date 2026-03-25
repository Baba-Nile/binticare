// server.js
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// ================= CONFIG =================
const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const shortcode = "174379"; // sandbox
const passkey = "YOUR_PASSKEY";

// ================= GET TOKEN =================
async function getToken(){
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
}

// ================= STK PUSH =================
app.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0,14);

  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const data = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://yourdomain.com/callback",
    AccountReference: "BintiCare",
    TransactionDesc: "Donation"
  };

  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  res.json(response.data);
});

app.listen(3000, ()=> console.log("Server running"));