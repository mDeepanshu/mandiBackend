const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
let partyRouter = require("./routes/PartyConnector");
let purchaseRouter = require("./routes/PurchaseConnector");
let transactionRouter = require("./routes/TransactionConnector");
let crateTransactionRouter = require("./routes/CrateTransactionConnector");
let cratePartyRouter = require("./routes/CratePartyConnector");
let constantRouter = require("./routes/ConstantConnector");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// mongodb://localhost:27017/mandi
mongoose
    .connect(process.env.DB_LINK, {
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

module.exports = app;
