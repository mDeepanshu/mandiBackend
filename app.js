const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
let partyRouter = require("./routes/PartyConnector");
let purchaseRouter = require("./routes/PurchaseConnector");
let sellRouter = require("./routes/SellConnector");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// mongodb+srv://damon:qwert123@cluster0.qyevd.mongodb.net/anilDeriyaJwellers?retryWrites=true
// mongodb://localhost:27017/mandi
// mongodb+srv://damon:qwert123@cluster0.qyevd.mongodb.net/test?authSource=admin&replicaSet=atlas-khpg0j-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true
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
app.use("/sell", sellRouter);

module.exports = app;
