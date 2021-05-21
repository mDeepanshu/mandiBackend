/**
 * Reads data from CrateParty collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const CrateTransactionModel = require('../Models/CrateTransactionSchema');


/** Add new crateTransaction */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    const body = req.body;
    req.body.current = req.body.starting;
    let msg = validateParams(body);
    if (typeof (msg) === "string") {
        res.send(Formatter.format(msg, 400));
        return;
    }
    try {
        let a = new CrateTransactionModel(body);
        await a.save();
        res.send(Formatter.format("successful added", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function validateParams(body) {
    if (body.partyId == null) return "partyId not specified";
    if (body.date == null) return "date not specified";
    if (body.type == null) return "type not specified";
    if (body.count == null) return "count not specified";
    return true;
}

module.exports = router;