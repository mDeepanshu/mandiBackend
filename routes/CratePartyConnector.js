/**
 * Reads data from CrateParty collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const CratePartyModel = require('../Models/CratePartySchema');


/** Add new crateParty */
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
        let a = new CratePartyModel(body);
        await a.save();
        res.send(Formatter.format("successful added", 200));
    } catch (e) {
        res.send(Formatter.format("Failed to Add : " + e.message, 200));
    }
})

function validateParams(body) {
    if (body.name == null) return "party name not specified";
    if (body.type1 == null) body.type1=0;
    if (body.type2 == null) body.type2=0;
    if (body.type3 == null) body.type3=0;
    return true;
}


/** Check is name available */
const check_availability = "check_availability";
router.get(`/${check_availability}`, async (req, res) => {
    try {
        let names = await CratePartyModel.findOne({name: req.query.name}, {name: 1}).exec();
        if (names == null) {
            res.send(Formatter.format("available", 200));
            return
        }
        res.send(Formatter.format("unavailable", 200));
    } catch (e) {
        console.log(e);
        res.send(Formatter.format(e.message, 500));
    }
})

/** Autocomplete Name */
const autocomplete_name = "autocomplete_name";
router.get(`/${autocomplete_name}`, async (req, res) => {
    const {keyword, limit, types} = req.query;
    let regEx = new RegExp(keyword, "g");
    const queryResult = await CratePartyModel
        .find({"name": regEx, "type": types}, {name: 1})
        .limit(parseInt(limit))
        .exec();
    console.log(queryResult);
    res.send(Formatter.format(queryResult, 200));
})


/** Edit party */
const edit_party= "/edit_party";
router.post(`${edit_party}`,async(req,res)=>{
    const {partyId} = req.query
    try {
        let queryResult = await CratePartyModel.updateOne({_id: partyId}, req.body);
        res.send(Formatter.format("Edited successfully",200));
    }catch (e){
        res.send(Formatter.format(`Error encountered ${e.message}`,500));
    }
})

module.exports = router;