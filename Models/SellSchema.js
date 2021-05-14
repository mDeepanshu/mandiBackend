const mongoose = require('mongoose');

const SellSchema=new mongoose.Schema({
    index:'number',
    date:"date",
    party_name:"string",
    items:{
        item_name:"string",
        amount:"number"
    }
});

const SellModel = mongoose.model('sell',SellSchema);

module.exports = SellModel
