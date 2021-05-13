const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

var partyRouter = require('./routes/PartyConnector');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/party', partyRouter);
// mongodb+srv://damon:qwert123@cluster0.qyevd.mongodb.net/anilDeriyaJwellers?retryWrites=true
// mongodb://localhost:27017/

mongoose
  .connect(
    "mongodb://localhost:27017/",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });
/*

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
*/
module.exports = app