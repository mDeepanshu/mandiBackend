const mongoose = require('mongoose');

const PurchaseSchema=new mongoose.Schema({
    date:"date",
    bill_no: "number",
    party:"string",
    partyId:"ObjectID",
    bhada_rate:"number",
    bhada:"number",
    hammali:"number",
    cash:"number",
    commission:"number",
    commission_rate:"number",
    station_charge:"number",
    tax:"number",
    driver:"number",
    bill_total:"number",
    to_exp:"number",
    net_amount:"number",
    items:[{
        item_name:"string",
        bag:"number",
        quantity:"number",
        rate:"number",
        amount:"number"
    }]
});

const PurchaseModel = mongoose.model('party',PurchaseSchema);

module.exports = PurchaseModel