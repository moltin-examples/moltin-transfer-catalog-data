// server.js
"use strict";

process.on("unhandledRejection", reason => console.error(reason));
require("dotenv").load();

const express = require("express");
const app = express();
const router = express.Router();

const bodyParser = require("body-parser");
const transferobjects = require("./data/moltintransferobjects.js");
var path = require("path");

const tranfer = {
  //order matters, do products last
  images: require("./transfers/images"),
  brands: require("./transfers/brands"),
  categories: require("./transfers/categories"),
  collections: require("./transfers/collections"),
  products: require("./transfers/products")
};

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/upload.html"));
});

app.post("/transfer", async (req, res) => {
  //timeout 5 mins
  req.setTimeout(600000);
  process.env["OLD_SITE_CLIENT_ID"] = req.body.old_client_id;
  process.env["NEW_SITE_CLIENT_ID"] = req.body.new_client_id;
  process.env["NEW_SITE_SECRET"] = req.body.new_client_secret;

  //TODO Add common delete function
  // transfer flows
  await transferobjects();

  for (let entity of Object.keys(tranfer)) {
    console.log("Tranfering %s", entity);
    await tranfer[entity]();
  }
  console.log("New moltin catalog is ready to go");

  res.send("New moltin catalog is ready to go");
});

app.listen(process.env.PORT || 5000);
