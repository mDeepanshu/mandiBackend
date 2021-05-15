
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const PartyModel = require('../Models/PartySchema');
const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb://localhost:27017/mandi",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connection failed!");
    });

/** Add new purchase */
const add_new = "add_new";
router.post(`${add_new}`,async (req,res)=>{
    const body = req.body;
    let msg = validateParams(body);
    if (typeof (msg) === "string") {
        res.send(Formatter.format(msg, 400));
        return;
    }
    try {
        let a = new PartyModel(body);
        await a.save();
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

module.exports = router;