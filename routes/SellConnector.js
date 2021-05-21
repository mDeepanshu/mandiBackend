/**
 * Reads data from sell collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const SellModel = require('../Models/SellSchema');


/** Add new sell */
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
        let a = new SellModel();
        a.index= body.index;
        a.date= body.date;
        a.partyId= body.partyId;
        for(const item of body.items){
            a.item_name=item.item_name;
            a.amount=item.amount;
            await a.save();
        }
        res.send(Formatter.format("successful added", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function validateParams(body) {
    if (body.index == null) return "name not specified";
    if (body.date == null) return "starting amount not specified";
    if (body.partyId == null) return `partyId must not be null`;
    if (body.items == null) return "error type not specified";
    let i=0;
    body.items.forEach(obj => {
        i++;
        if(obj.item_name==null)return `item name at index ${i} cannot be null`;
        if(obj.amount==null)return `item name at index ${i} cannot be null`;
    });
    return true;
}

module.exports = router;