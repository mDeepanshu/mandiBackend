const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const PurchaseModel = require('../Models/PurchaseSchema');

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
        res.send(Formatter.format(msg, 400)).status(400);
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
    if (bill_no == null) res.send(Formatter.format("bill_no not found", 400)).status(400);
    let queryResult = await PurchaseModel.findOne({bill_no: bill_no});
    res.send(Formatter.format(queryResult, 200));
});

/** Get Purchases by date */
const by_date = "by_date";
router.get(`/${by_date}`, async (req, res) => {
    let {fdd, fmm, fyyyy, tdd, tmm, tyyyy, limit,page} = req.query;
    limit=parseInt(limit);
    page=parseInt(page);
    let from_date = new Date(fyyyy, fmm-1, fdd);
    if(from_date.toString()==="Invalid Date"){
        res.send(Formatter.format("error while parsing fdd, fmm, fyyyy", 400)).status(400);
        return;
    }
    let nextDate = Formatter.nextDate(tyyyy, tmm-1, tdd);
    if (typeof (nextDate) == 'string') {
        res.send(Formatter.format(nextDate + " in till date", 400)).status(400);
        return;
    }
    let to_date = new Date(nextDate.yyyy, nextDate.mm, nextDate.dd);
    let filter = {
        date: {
            $gte: from_date,
            $lt: to_date
        }
    }
    try {
        console.log("filter", filter);
        let queryResult = await PurchaseModel.find(filter).limit(limit).skip(limit*(page-1));
        console.log("query", queryResult)
        res.send(Formatter.format(queryResult, 200))
    } catch (e) {
        res.send(Formatter.format(e.message, 400)).status(400);
    }

});

/** Get Purchases by party */
const by_party = "/by_party";
router.get(`${by_party}`, async (req, res) => {
    const {party_name, party_id, limit, page} = req.query;
    if (party_name == null && party_id == null) {
        res.send(Formatter.format("party_name or party_id not specified", 400)).status(400);
        return;
    }
    let filter;
    if (party_name != null)
        filter = {party: party_name};
    else filter = {
        partyId: party_id
    }
    try {
        let queryResult = await PurchaseModel.find(filter).limit(parseInt(limit)).skip(parseInt(limit * (page - 1)));
        res.send(Formatter.format(queryResult, 200))
    } catch (e) {
        res.send(Formatter.format(e.message, 400)).status(400);
    }

});

/** Edit Purchase */
const edit = "edit";
router.post(`/${edit}`, async (req,res)=>{
    const changes = req.body;
    const purchaseId = req.query.id;
    let dbResponse;
    try {
        dbResponse = await PurchaseModel.updateOne({_id: purchaseId}, changes);
    }catch (e) {
        return res.send(Formatter.format("not modified.. "+e,400)).status(400);
    }
    // console.log(dbResponse)
    if(dbResponse.n===0){
        return res.send(Formatter.format("not modified.. document not found",400)).status(400);
    }
    if(dbResponse.nModified===0){
        return res.send(Formatter.format("not modified.. no changes requested",400)).status(400);
    }
    return res.send(Formatter.format("successfully updated",200));
})

/** Autocomplete BillNo */
const autocompleteBillNo = "autocomplete_bill_no";
router.get(`/${autocompleteBillNo}`, async (req, res) => {
    const {keyword, limit} = req.query;
    let regEx = new RegExp(keyword, "g");
    const queryResult = await PurchaseModel
        .find({"bill_no": regEx}, {bill_no: 1})
        .limit(parseInt(limit))
        .exec();
    res.send(Formatter.format(queryResult, 200));
})

module.exports = router;