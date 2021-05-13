const mongoose = require('mongoose');

const PartySchema=new mongoose.Schema({
    name:"string",
    type:"number",
    commission:"number",
    starting:"number",
    address:"string",
    current:"number",
    phone:"string"
});

const PartyModel = mongoose.model('party',PartySchema);

module.exports = PartyModel