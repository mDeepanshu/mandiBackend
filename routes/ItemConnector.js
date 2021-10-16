const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter');
const ItemModel = require('../Models/ItemSchema');
const TransactionModel = require('../Models/TransactionSchema');

/** Add new item */
const add_new = "add_new";
router.post(`/${add_new}`, async (req, res) => {
    let itemName = req.body.itemName;
    if (typeof itemName != "string") {
        res.send(Formatter.format("itemName in body should be a string", 400)).status(400);
    }
    let item = new ItemModel();
    item.itemName = itemName;
    var error = null;
    const response = await item.save()
        .catch((err) => {
            error = err;
        })
    if (error) {
        console.log(error.message);
        res.send(Formatter.format(error.message, 500)).status(500);
    }
    else
        res.send(Formatter.format(response, 200));
})

/** Autocomplete Item Name */
const autocomplete_name = "autocomplete_name";
router.get(`/${autocomplete_name}`, async (req, res) => {
    const { keyword, limit } = req.query;
    let regEx = new RegExp(keyword, "g");
    const queryResult = await ItemModel.find(
        { itemName: regEx },
        { itemName: 1, _id: 0 }
    )
        .limit(parseInt(limit))
        .exec();
    res.send(Formatter.format(queryResult, 200));
});

/** All sell of Item on day */
const sell_of_item_today = "sell_of_item_today";
router.get(`/${sell_of_item_today}`, async (req, res) => {
    const { item_name } = req.query;
    console.log(item_name, "item");
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    console.log(startDate, endDate);
    let transactionsList = await TransactionModel
        .aggregate([{
            $match: {
                item_name: item_name,
                date: { $lte: endDate, $gte: startDate }
            }
        },
        {
            $lookup:
            {
                from: "parties",
                localField: "partyId",
                foreignField: "_id",
                as: "party"
            }
        },
        {$unwind: '$party'},
        {
            $project: {
                party_name: "$party.name",
                amount: 1

            }
        }
        ])
        .exec();
    console.log(transactionsList);
    res.send(transactionsList);

})

module.exports = router;