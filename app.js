const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Formatter = require("./routes/Formatter.js");
let partyRouter = require("./routes/PartyConnector");
let purchaseRouter = require("./routes/PurchaseConnector");
let transactionRouter = require("./routes/TransactionConnector");
let crateTransactionRouter = require("./routes/CrateTransactionConnector");
let cratePartyRouter = require("./routes/CratePartyConnector");
let constantRouter = require("./routes/ConstantConnector");

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// mongodb://localhost:27017/mandi
DB_LINK = "mongodb+srv://damon:qwert123@cluster0.qyevd.mongodb.net/mandi";
console.log(DB_LINK);
mongoose
    .connect(DB_LINK, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connection failed!");
    });
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});
app.use("/party", partyRouter);
app.use("/purchase", purchaseRouter);
app.use("/transaction", transactionRouter);
app.use("/crate_transaction", crateTransactionRouter);
app.use("/crate_party", cratePartyRouter);
app.use("/constant", constantRouter);
app.get("/", async (req, res) => {
    console.log("hey found new request")
    res.send(Formatter.format("here is response for you", 200));
})
module.exports = app;
