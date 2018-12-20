"use strict";

const fs = require("fs");

const { createClient: MoltinClient } = require("@moltin/request");

module.exports = async function() {
  const oldSite = new MoltinClient({
    client_id: process.env.OLD_SITE_CLIENT_ID
  });

  const newSite = new MoltinClient({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  const oldCollections = await oldSite.get("collections");
  const collectionsToCreate = oldCollections.meta.results.total;
  if (collectionsToCreate != 0) {
    for (let collection of oldCollections.data) {
      const collectionMData = {
        type: "collection",
        name: collection.name,
        description: collection.description,
        slug: collection.slug,
        status: collection.status
      };

      const collectionM = await newSite.post(`collection`, collectionMData);
    }
  }

  function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }
};
