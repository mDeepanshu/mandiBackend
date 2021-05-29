const mongoose = require('mongoose');

const ConstantSchema = new mongoose.Schema({
    hammali_rate: "number",
    tax_rate: 'number',
    bhada_rate: 'number',
});

const ConstantModel = mongoose.model('constant', ConstantSchema);

module.exports = ConstantModel
