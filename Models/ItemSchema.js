const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemName: "String",
});

const ItemModel = mongoose.model('item', ItemSchema);

module.exports = ItemModel

