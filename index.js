const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const Formatter = require("./routes/Formatter");
const PartyConnector = require("./routes/PartyConnector");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(Formatter);
app.use(PartyConnector);

app.listen(3000);
