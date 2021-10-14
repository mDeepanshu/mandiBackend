const express = require('express');
const router = express.Router();
const Formatter = require('./Formatter');
const ItemMdel = require('../Models/ItemSchema');
const ItemModel = require('../Models/ItemSchema');


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

module.exports = router;