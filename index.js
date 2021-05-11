var express = require('express');
var app = express();
const bodyParser = require("body-parser");

// var testRouter = require('./routes/Tests');
var partyRouter = require('./routes/PartyConnector');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// app.use('/Tests', testRouter);
app.use('/party', partyRouter);

app.post('/', function(req, res){
   console.log(req.body);
   res.send("Hello world!");

});

app.listen(3301);