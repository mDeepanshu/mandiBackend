/**
 * Reads data from CrateParty collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const CrateTransactionModel = require('../Models/CrateTransactionSchema');
const CratePartyModel = require('../Models/CratePartySchema');


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
        let party = await CratePartyModel
            .updateOne({_id: body.partyId},
                {$inc: {["type" + body.type]: body.count}});
        if (party["nModified"] === "0") {
            res.send(Formatter.format("cannot find party", 400)).status(400);
            return;
        }
    } catch (e) {
        res.send(Formatter.format("cannot find party", 400)).status(400);
        return;
    }
    try {
        let a = new CrateTransactionModel(body);
        await a.save();
        res.send(Formatter.format("successful added ", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 400)).status(400);
    }
})

function validateParams(body) {
    if (body.partyId == null) return "partyId not specified";
    if (body.date == null) return "date not specified";
    if (body.type == null) return "type not specified";
    if (body.count == null) return "count not specified";
    return true;
}

/** Get Transactions */
const transactions = "transactions";
router.get(`/${transactions}`, async (req, res) => {
    let {partyId, dd, mm, yyyy, from_date, to_date} = req.query;
    let nextDate
    if (from_date == null || to_date == null) {
        nextDate = Formatter.nextDate(yyyy, mm, dd);
        from_date = new Date(yyyy, mm - 1, dd);
        to_date = new Date(nextDate.yyyy, nextDate.mm - 1, nextDate.dd);
    }
    let party = await CratePartyModel
        .findOne({_id: partyId}
            , {_id: 0, type1: 1, type2: 1, type3: 1});
    let response = {}

    response.current = party;
    response[transactions] = await CrateTransactionModel.find(
        {
            partyId: partyId,
            date: {
                $gte: from_date,
                $lte: to_date
            }
        },
        {_id: 0, date: 1, type: 1, count: 1});
    res.send(Formatter.format(response, 200));
});

module.exports = router;