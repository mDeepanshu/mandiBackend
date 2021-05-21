const mongoose = require('mongoose');

const SellSchema = new mongoose.Schema({
    index: "number",
    date: "date",
    partyId: "ObjectId",
    item_name: "string",
    amount: "number"
});

const SellModel = mongoose.model('sell', SellSchema);

module.exports = SellModel
