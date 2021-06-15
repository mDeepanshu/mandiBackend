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
});

/** Get Purchases by date */
const by_date = "/by_date";
router.get(`${by_date}`, async (req, res) => {
    var {date,to_date, from_date} = req.query;
    if (date == null&&to_date==null&&from_date==null) {
        res.send(Formatter.format("date not specified", 400));
        return;
    }
    let filter;
    if (from_date == null)
        filter = {date: date};
    else filter = {
        date: {
            $gte: from_date,
            $lt: to_date
        }
    }
    try {
        console.log("filter", filter);
        let queryResult = await PurchaseModel.find(filter);
        console.log("query", queryResult)
        res.send(Formatter.format(queryResult, 200))
    }catch (e){
        res.send(Formatter.format(e.message,400));
    }

});

/** Get Purchases by party */
const by_party = "/by_party";
router.get(`${by_party}`, async (req, res) => {
    const {party_name, party_id, limit, page} = req.query;
    if (party_name == null&&party_id==null) {
        res.send(Formatter.format("party_name or party_id not specified", 400));
        return;
    }
    let filter;
    if (party_name != null)
        filter = {party:party_name};
    else filter = {
        partyId:party_id
    }
    try {
        let queryResult = await PurchaseModel.find(filter).limit(parseInt(limit)).skip(parseInt(limit*(page-1)));
        res.send(Formatter.format(queryResult, 200))
    }catch (e){
        res.send(Formatter.format(e.message,400));
    }

});

module.exports = router;