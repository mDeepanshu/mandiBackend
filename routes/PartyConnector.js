/**
 * Reads data from party collection
 * */

const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const MongoClient = require('mongodb').MongoClient
let partyCollection;
MongoClient.connect('mongodb://localhost:27017/')
    .then(r => {
            const db = r.db('mandi')
            partyCollection = db.collection('party')
        }
    )
;

/** Constants */
const VYAPARI_TYPE = 0;
const SPL_VYAPARI_TYPE = 1;
const KISAN_TYPE = 2;
const OTHER_TYPE = 3;


/** Add new party */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    console.log("/party/add_new");
    const body = req.body;
    let msg = validateParams(body);
    if (typeof (msg) === "string") {
        res.send(Formatter.format(msg, 400));
        return;
    }
    try {
        let result = await partyCollection.insertOne(body);
        res.send(Formatter.format("successful added", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function validateParams(body) {
    if (body.name == null) return "name not specified";
    if (body.starting == null) return "starting amount not specified";
    if (body.commission == null && body.type === KISAN_TYPE) return `commission must be specified for type KISAN i.e, ${KISAN_TYPE}`;
    if (body.type == null) return "error type not specified";
    if (body.address == null) return "error address not specified";
    if (body.phone == null) return "error phone not specified";
    return true;
}

/** find party by name */
const find = "find";
router.get(`/${find}`, async (req, res) => {

        try {
            const name = req.query.name;
            console.log(name,"123132");
            if(name===undefined){
                res.send(Formatter.format("Name not specified",400));
                return;
            }
            const party = await partyCollection.findOne({"name": name});
            if(party===null){
                res.send(Formatter.format("Not found",200));
                return;
            }
            res.send(Formatter.format(party, 200));
        } catch (e) {
            console.log(e);
            res.send(Formatter.format("error",500));
        }
    }
)
module.exports = router;