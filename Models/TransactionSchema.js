const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    date: "date",
    partyId: "ObjectId",
    item_name: "string",
    amount: "number",
    current:"number"
});

const TransactionModel = mongoose.model('transaction', TransactionSchema);

module.exports = TransactionModel
