"use strict";

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
var request = require("request");

const { createClient: MoltinClient } = require("@moltin/request");

module.exports = async function() {
  const oldSite = new MoltinClient({
    client_id: process.env.OLD_SITE_CLIENT_ID
  });

  const moltin = new MoltinClient({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  const oldFiles = await oldSite.get("files");

  for (let image of oldFiles.data) {
    console.log("Uploading %s", image.link.href);
    const fileName = image.file_name;
    const fileLink = image.link.href;

    const options = {
      url: fileLink,
      //raw is a buffer
      encoding: null,
      resolveWithFullResponse: true
    };
    request.get(options, async (err, response, body) => {
      try {
        const formData = new FormData();
        formData.append("file_name", fileName);
        formData.append("public", "true");
        formData.append("file", body, { filename: fileName });
        const headers = {
          "Content-Type": formData.getHeaders()["content-type"]
        };

        const newFiles = await moltin.post(
          "files",
          { body: formData },
          headers
        );
        console.log(newFiles);
      } catch (error) {
        console.error(error);
      }
    });
  }
};
