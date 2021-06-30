/**
 * Reads data from sell collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const TransactionModel = require('../Models/TransactionSchema');
const PartyModel = require('../Models/PartySchema');
const smsClient = require('fast-two-sms')

function LedgerItem(name, id) {
    this.id = id;
    this.name = name;
    this.back = 0;
    this.items = [];
    this.today = 0;
    this.calculateTotal = function () {
        this.total = this.back + this.today
    }
}

/** Add new transaction */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    const body = req.body;

    let msg = validateParams(body);
    if (typeof (msg) === "string") {
        res.send(Formatter.format(msg, 400)).status(400);
        return;
    }
    let partyIds = [];
    for (let index = 0; index < body.parties.length; index++) {
        partyIds[index] = body.parties[index].id;
    }
    let currents = await PartyModel.find({_id: {$in: partyIds}}, {current: 1}).exec();
    try {
        let i;
        for (i = 0; i < body.parties.length; i++) {
            let a = new TransactionModel(body);
            a.item_name = body.item_name;
            a.date = body.date;
            let party = body.parties[i];
            a.current = parseInt(getCurrent(currents, party.id, party.amount));
            await PartyModel.updateOne({_id: party.id}, {$inc: {current: party.amount}});
            a.partyId = party.id;
            a.amount = party.amount;
            await a.save();
        }
        res.send(Formatter.format(`Successfully added ${i} entries`, 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function getCurrent(currents, id, amount) {
    for (let i = 0; i < currents.length; i++) {
        if (currents[i]._id.toString() === id) {
            currents[i].current += parseInt(amount);
            return currents[i].current;
        }
    }
}

function validateParams(body) {
    if (body.date == null) return "starting amount not specified";
    if (body.parties == null) return "error type not specified";
    for (let i = 0; i < body.parties.length; i++) {
        let party = body.parties[i];
        if (party.id == null) return `id at index ${i} cannot be null`;
        if (party.amount == null) return `amount at index ${i} cannot be null`;
    }
    return true;
}

/** Get Party Transaction History */
const party_transaction_history = "party_transaction_history";
router.get(`/${party_transaction_history}`, async (req, res) => {
    let {partyId, fdd, fmm, fyyyy, tdd, tmm, tyyyy} = req.query;
    let nextDate = Formatter.nextDate(tyyyy, tmm, tdd);
    if (typeof (nextDate) == 'string') {
        res.send(Formatter.format(nextDate, 400)).status(400);
        return;
    }
    if (partyId == null) {
        res.send(Formatter.format("specify partyId", 400)).status(400);
        return;
    }
    let starting = (await PartyModel.findOne({_id: partyId}, {starting: 1, _id: 0}).exec()).starting;
    if (starting == null) {
        res.send(Formatter.format("no party found for given partyId", 200));
        return;
    }
    // resBody.starting = starting;
    let fromDate = new Date(fyyyy, fmm, fdd);
    let toDate = new Date(nextDate.yyyy, nextDate.mm, nextDate.dd);
    console.log(fromDate);
    console.log(toDate);
    let resBody = await TransactionModel.find({
        date: {$gte: fromDate, $lte: toDate},
        partyId: partyId
    }, {partyId: 0, __v: 0}).exec();
    res.send(Formatter.format(resBody, 200));
})

/** Add a vasuli transaction */
const add_vasuli = "add_vasuli";
router.post(`/${add_vasuli}`, async (req, res) => {
    let {partyId, amount, date} = req.query;
    if (partyId == null | amount == null || date == null) {
        res.send(Formatter.format("partyId, amount, date are required as params", 400)).status(400);
        return;
    }

    let current = (await PartyModel.findOne({_id: partyId}, {current: 1, _id: 0}).exec()).current;
    if (current == null) {
        res.send(Formatter.format("party not found", 400)).status(400);
        return;
    }
    try {
        await PartyModel.updateOne({_id: partyId}, {$inc: {current: 0 - parseInt(amount)}});
        let a = new TransactionModel();
        a.date = date;
        a.partyId = partyId;
        a.item_name = "RETURN";
        a.amount = 0 - amount;
        a.current = current - amount;
        a.save();
        res.send(Formatter.format(`Added Successfully`, 200));
    } catch (e) {
        res.send(Formatter.format(`error encountered ${e.message}`, 500)).status(500);
    }
})

/** Get ledger report */
const ledger = "ledger";
router.get(`/${ledger}`, async (req, res) => {
    let {yyyy, mm, dd} = req.query;
    let nextDate = Formatter.nextDate(yyyy, mm, dd);
    // console.log("nextData" +nextDate);
    if (typeof (nextDate) == 'string') {
        res.send(Formatter.format(nextDate, 400)).status(400);
        return;
    }
    let parties = await PartyModel.find({}, {name: 1, current: 1}).sort('name').exec();
    const ledgers = [];
    const indexes = {};
    let i = 0;
    for (const party of parties) {
        indexes[party.id] = i;
        i = i + 1;
        let ledgerItem = new LedgerItem();
        ledgerItem.id = party.id;
        ledgerItem.name = party.name;
        ledgerItem.back = parseInt(party.current)
        ledgers.push(ledgerItem);
    }
    let transactions = await TransactionModel.find({
        date: {
            $gte: new Date(yyyy, mm, dd),
            $lte: new Date(nextDate.yyyy, nextDate.mm, nextDate.dd)
        }
    }).sort('date').exec();
    // console.log(transactions);
    for (const transaction of transactions) {
        let index = indexes[transaction.partyId];
        let ledgerItem = ledgers[index];
        if (ledgerItem.items.length === 0) {
            ledgerItem.back = transaction.current - transaction.amount;
        }
        ledgerItem.items.push(transaction.amount);
        ledgerItem.today = ledgerItem.today + transaction.amount;
    }
    for (const ledger of ledgers) {
        ledger.calculateTotal();
    }
    res.send(Formatter.format(ledgers, 200));
});

/** Send SMS */
const send_sms = "send_sms";
router.post(`/${send_sms}`, async (req, res) => {
    let options = {
        authorization: process.env.SMS_API_KEY,
        message: "We can send messages from server side, it cost i guess 0.20 rs/msg\n" +
            "we can also buy sender id it will cost 150 rs for 6 months",
        numbers: ["8349842228"]
    }
    const response = await smsClient.sendMessage(options)
    console.log(response)
    res.send(response);
})
module.exports = router;