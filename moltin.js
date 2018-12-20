"use strict";

const fs = require("fs");
const request = require("request-promise-native");
require("dotenv").load();

const MoltinGateway = require("@moltin/sdk").gateway;

const { createClient: MoltinClient } = require("@moltin/request");

const authenticate = async function(storage) {
  const Moltin = MoltinGateway({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  const expired =
    !storage.get("mtoken") || Date.now().toString() >= storage.get("mexpires");

  return expired ? await Moltin.Authenticate() : undefined;
};

const relate = function(id, type, resources) {
  console.log("resiurces", resources);
  return this.request.send(
    `${this.endpoint}/${id}/relationships/${type}`,
    "POST",
    resources
  );
};
const Moltin = MoltinGateway({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

Moltin.Categories.CreateRelationships = relate;
Moltin.Products.CreateRelationshipsRaw = relate;

Moltin.Files = Object.setPrototypeOf(
  Object.assign({}, Moltin.Products),
  Moltin.Products
);
Moltin.Files.endpoint = "files";

Moltin.Files.Create = async function(file) {
  const Moltin = MoltinGateway({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  const { config, storage } = this.request;

  await authenticate(storage);

  const url = `${config.protocol}://${config.host}/${config.version}`;

  const response = await request({
    uri: `${url}/${this.endpoint}`,
    method: "POST",
    headers: {
      Authorization: `Bearer: ${storage.get("mtoken")}`,
      "Content-Type": "multipart/form-data",
      "X-MOLTIN-SDK-LANGUAGE": config.sdk.language,
      "X-MOLTIN-SDK-VERSION": config.sdk.version
    },
    formData: {
      public: "true",
      file_name: file.replace(/.+\//, ""),
      file: fs.createReadStream(file)
    }
  });
  return JSON.parse(response);
};

module.exports = Moltin;
