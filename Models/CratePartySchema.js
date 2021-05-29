const mongoose = require('mongoose');

const CratePartySchema = new mongoose.Schema({
    name:"string",
    type1:"number",
    type2:"number",
    type3:"number"
});

const CratePartyModel = mongoose.model('crate_party', CratePartySchema);

module.exports = CratePartyModel
