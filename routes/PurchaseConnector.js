const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const PurchaseModel = require('../Models/PurchaseSchema');
const mongoose = require("mongoose");

/*mongoose
    .connect(
        "mongodb://localhost:27017/mandi",
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connection failed!");
    });*/

/** Add new purchase */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    const body = req.body;
    let msg = validateParams(body);
    if (typeof (msg) === "string") {
        res.send(Formatter.format(msg, 400));
        return;
    }
    try {
        let a = new PurchaseModel(body);
        await a.save();
        res.send(Formatter.format("successful added", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function validateParams(body) {
    if (body.date == null) return "date not specified";
    if (body.party == null) return "party amount not specified";
    if (body.partyId == null) return "partyId amount not specified";
    if (body.bhada_rate == null) return `bhada_rate is not specified`;
    if (body.bhada == null) return "bhada is not specified";
    if (body.hammali == null) return "hammali is not specified";
    if (body.cash == null) return "cash is not specified";
    if (body.commission == null) return "commission is not specified";
    if (body.commission_rate == null) return "commission is not specified";
    if (body.station_charge == null) return "station_charge is not specified";
    if (body.tax == null) return `tax is not specified`;
    if (body.driver == null) return "driver is not specified";
    if (body.bill_total == null) return "bill_total is not specified";
    if (body.to_exp == null) return "to_exp is not specified";
    if (body.net_amount == null) return "net_amount is not specified";
    if (body.items == null) return "No item is specified";
    return true;
}

/** Get Purchase by bill number */
const by_bill_no = "by_bill_no";
router.get(`/${by_bill_no}`, async (req, res) => {
    const {bill_no} = req.query;
    if (bill_no == null) res.send(Formatter.format("bill_no not found", 400));
    let queryResult = await PurchaseModel.findOne({bill_no: bill_no});
    res.send(Formatter.format(queryResult, 200));
})

module.exports = router;