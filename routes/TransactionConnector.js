/**
 * Reads data from sell collection
 * */
const express = require("express");
const router = express.Router();
const Formatter = require('./Formatter')
const TransactionModel = require('../Models/TransactionSchema');
const PartyModel = require('../Models/PartySchema');
const smsClient = require('fast-two-sms')
const http = require('http');

function LedgerItem(name, id) {
    this.id = id;
    this.name = name;
    this.back = 0;
    this.items = [];
    this.today = 0;
    // this.urgent = true
    this.calculateTotal = function () {
        this.total = this.back + this.today;
    };
}

/** Add new transaction */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    const body = req.body;

    let msg = validateParams(body);
    if (typeof msg === "string") {
        res.send(Formatter.format(msg, 400)).status(400);
        return;
    }
    let partyIds = [];
    for (let index = 0; index < body.parties.length; index++) {
        partyIds[index] = body.parties[index].id;
    }
    let currents = await PartyModel.find(
        { _id: { $in: partyIds } },
        { current: 1 }
    ).exec();
    try {
        let i;
        for (i = 0; i < body.parties.length; i++) {
            let a = new TransactionModel(body);
            a.item_name = body.item_name;
            a.date = body.date;
            let party = body.parties[i];
            a.current = parseInt(getCurrent(currents, party.id, party.amount));
            await PartyModel.updateOne({ _id: party.id }, { $inc: { current: party.amount } });
            a.partyId = party.id;
            a.amount = party.amount;
            await a.save();
        }
        res.send(Formatter.format(`Successfully added ${i} entries`, 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
});

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
    let { partyId, fdd, fmm, fyyyy, tdd, tmm, tyyyy } = req.query;
    let nextDate = Formatter.nextDate(tyyyy, tmm, tdd);
    if (typeof (nextDate) == 'string') {
        res.send(Formatter.format(nextDate, 400)).status(400);
        return;
    }
    if (partyId == null) {
        res.send(Formatter.format("specify partyId", 400)).status(400);
        return;
    }
    let starting = (
        await PartyModel.findOne(
            { _id: partyId },
            { starting: 1, _id: 0 }
        ).exec()
    ).starting;
    if (starting == null) {
        res.send(Formatter.format("no party found for given partyId", 200));
        return;
    }
    // resBody.starting = starting;
    let fromDate = new Date(fyyyy, fmm, fdd);
    let toDate = new Date(nextDate.yyyy, nextDate.mm, nextDate.dd);
    console.log(fromDate);
    console.log(toDate);
    let resBody = await TransactionModel.find(
        {
            date: { $gte: fromDate, $lte: toDate },
            partyId: partyId,
        },
        { partyId: 0, __v: 0 }
    ).exec();
    res.send(Formatter.format(resBody, 200));
});

/** Add a vasuli transaction */
const add_vasuli = "add_vasuli";
router.post(`/${add_vasuli}`, async (req, res) => {
    let { partyId, amount, date, sendSms } = req.query;
    if ((partyId == null) | (amount == null) || date == null) {
        res.send(
            Formatter.format(
                "partyId, amount, date are required as params",
                400
            )
        ).status(400);
        return;
    }
    let party = await PartyModel.findOne(
        { _id: partyId },
        { current: 1, phone: 1, name: 1, _id: 0 }
    ).exec()
    let current = party.current;
    if (current == null) {
        res.send(Formatter.format("party not found", 400)).status(400);
        return;
    }
    try {
        await PartyModel.updateOne(
            { _id: partyId },
            { $inc: { current: 0 - parseInt(amount) }, lastVasuli: new Date(date).getTime() }
        );
        let a = new TransactionModel();
        a.date = date;
        a.partyId = partyId;
        a.item_name = "RETURN";
        a.amount = 0 - amount;
        a.current = current - amount;
        a.save();
        var smsStatus = "opted to not send sms"
        if (sendSms == "true") {
            let message = `Greetings ${party.name}, your payment of ${amount} on ${date} was successful`

            console.log("calling send_sms");
            let smsPromise = send_sms(party.phone, message);
            try {
                var error = null;
                let smsPromiseResponse = await smsPromise.catch((err) => { console.error(err); error = err; });
                if (error == null) {
                    smsStatus = smsPromiseResponse.message;
                }else{
                    smsStatus = error.message;
                }
                console.log(smsStatus);
            } catch (e) {
                console.error(e);
                smsStatus = e.message();
            }
            console.log("ss", smsStatus);
        }
        res.send(Formatter.format(`Added Successfully\n smsStatus - ${smsStatus}`, 200));
    } catch (e) {
        res.send(
            Formatter.format(`error encountered ${e.message}`, 500)
        ).status(500);
    }
});

/** Get ledger report */
const ledger = "ledger";
router.get(`/${ledger}`, async (req, res) => {
    let { yyyy, mm, dd } = req.query;
    let nextDate = Formatter.nextDate(yyyy, mm, dd);
    // console.log("nextData" +nextDate);
    if (typeof nextDate == "string") {
        res.send(Formatter.format(nextDate, 400)).status(400);
        return;
    }
    let parties = await PartyModel.find({}, { name: 1, current: 1 }).sort('name').exec();
    const ledgers = [];
    const indexes = {};
    let i = 0;
    for (const party of parties) {
        indexes[party.id] = i;
        i = i + 1;
        let ledgerItem = new LedgerItem();
        ledgerItem.id = party.id;
        ledgerItem.name = party.name;
        ledgerItem.back = parseInt(party.current);
        ledgers.push(ledgerItem);
    }
    let transactions = await TransactionModel.find({
        date: {
            $gte: new Date(yyyy, mm, dd),
            $lte: new Date(nextDate.yyyy, nextDate.mm, nextDate.dd),
        },
    })
        .sort("date")
        .exec();
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
    /*
        // marking urgent
        let oldDate = new Date(yyyy, mm - 1, dd);
        oldDate.setDate(oldDate.getDate() - 3);
        let vasuliTransactions = await TransactionModel.find({
            date: {
                $gte: oldDate,//3 days prior date
                $lte: new Date(nextDate.yyyy, nextDate.mm, nextDate.dd)
            },
            item_name: "RETURN"
        }, { partyId: 1, _id: 0 }).exec();
        console.log("vas", vasuliTransactions)
        // these are the parties whom vasuli is done in 3 prev days
        // removing urgent sign from these parties
        for (const vasuliTransaction of vasuliTransactions) {
            let index = indexes[vasuliTransaction.partyId];
            let ledgerItem = ledgers[index];
            if (ledgerItem === undefined) {
            } else {
                ledgerItem.urgent = false
            }
        }
    */

    res.send(Formatter.format(ledgers, 200));
});

function send_sms(phone, message) {
    // hit api on messaging server with message and phone
    console.log("g");
    try {
        const messageServerUrl = process.env.MessageServerUrl;
        if (!messageServerUrl) {
            console.log("no messageServerUrl found")
            // return "no messageServerUrl found";
        }
        let body = { message: message };
        const data = JSON.stringify(body);
        const options = {
            hostname: messageServerUrl,
            port: 3001,
            path: `/message/newMessage?phone=${phone}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
        };

        console.log("options", options);

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                let responseBody = '';

                res.on('data', (chunk) => {
                    responseBody += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(responseBody));
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.write(data)
            req.end();
        });
    } catch (e) {
        console.log("e", e.message);
    }
    // response = await doRequest(options, data).catch((err) => { console.error(err); err = err.message; });
    // console.log("response", response);
    // if (!response) return error;
    // return response;
}

module.exports = router;
