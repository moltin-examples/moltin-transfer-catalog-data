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
  const oldBrands = await oldSite.get("brands");

  const brandsToCreate = oldBrands.meta.results.total;
  if (brandsToCreate != 0) {
    for (let brand of oldBrands.data) {
      const brandMData = {
        type: "brand",
        name: brand.name,
        description: brand.description,
        slug: brand.slug,
        status: brand.status
      };

      const brandM = await newSite.post(`brands`, brandMData);
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
