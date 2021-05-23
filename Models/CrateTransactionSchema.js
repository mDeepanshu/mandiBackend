const mongoose = require('mongoose');

const CrateTransactionSchema = new mongoose.Schema({
    partyId: "ObjectID",
    date: "date",
    type: 'number',
    count: 'number',
});

const CrateModel = mongoose.model('crate_transaction', CrateTransactionSchema);

module.exports = CrateModel
