/**
 * Reads data from Constants collection
 * */
const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter')
const ConstantModel = require('../Models/ConstantSchema');

/** Get all constants */
router.get(`/`, async (req, res) => {
    try {
        const constants = await ConstantModel.findOne({index: 0}, {_id: 0, index: 0});
        res.send(Formatter.format(constants, 200));
    } catch (e) {
        res.send(Formatter.format("Internal Error", 500));
    }
})
module.exports = router;