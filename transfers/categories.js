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
  const oldCategories = await oldSite.get("categories");
  const categoriesToCreate = oldCategories.meta.results.total;

  if (categoriesToCreate != 0) {
    for (let category of oldCategories.data) {
      const categoryMData = {
        type: "category",
        name: category.name,
        description: category.description,
        slug: category.slug,
        status: category.status
      };

      const categoryM = await newSite.post("categories", categoryMData);
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
