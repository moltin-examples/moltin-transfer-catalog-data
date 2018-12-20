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
  //get Products and images
  const oldProducts = await oldSite.get("products?include=main_image");

  const newCategories = await newSite.get("categories");
  const newBrands = await newSite.get("brands");

  const productsToCreate = oldProducts.meta.results.total;
  if (productsToCreate != 0) {
    for (let product of oldProducts.data) {
      //create product
      var productUpload = {
        type: "product",
        name: product.name,
        //Slug can not have spaces or foreign characters
        slug: product.slug,
        status: product.status,
        price: [
          {
            amount: product.price[0].amount,
            currency: "USD",
            includes_tax: true
          }
        ],
        sku: product.sku,
        manage_stock: product.manage_stock,
        commodity_type: product.commodity_type,
        description: product.description,
        ...product
      };
      const productM = await newSite.post("products", productUpload);
      console.log("product", productM.statusCode);
      if (productM.statusCode != 201) {
        console.log("Already created");
      } else {
        //TIE PRODUCT to Category
        const categoriesToCreate = newCategories.meta.results.total;

        if (categoriesToCreate != 0) {
          const oldProduct = await oldSite.get(
            `products/?filter=eq(sku,${product.sku})`
          );

          if (!oldProduct.data[0].relationships.hasOwnProperty("categories")) {
            console.log("no categories for this one");
          } else {
            const oldCat = await oldSite.get(
              `categories/${
                oldProduct.data[0].relationships.categories.data[0].id
              }`
            );

            //match to a new one
            var productsCategory = newCategories.data.find(function(
              productsCategory
            ) {
              return productsCategory.name === oldCat.data.name;
            });
            const relationshipData = [
              {
                type: "category",
                id: productsCategory.id
              }
            ];
            const newCatRelationship = await newSite.post(
              `products/${productM.data.id}/relationships/categories`,
              relationshipData
            );
          }
        }
        const brandsToCreate = newBrands.meta.results.total;

        if (brandsToCreate != 0) {
          const oldProduct = await oldSite.get(
            `products/?filter=eq(sku,${product.sku})`
          );
          console.log(oldProduct.data[0].relationships);

          if (!oldProduct.data[0].relationships.hasOwnProperty("brands")) {
          } else {
            const oldBrand = await oldSite.get(
              `brands/${oldProduct.data[0].relationships.brands.data[0].id}`
            );
            console.log(oldBrand.data.name);
            console.log(newBrands.data);

            //match to a new one
            var productsBrands = newBrands.data.find(function(productsBrands) {
              return productsBrands.name === oldBrand.data.name;
            });
            const relationshipData = [
              {
                type: "brands",
                id: productsBrands.id
              }
            ];
            const newCatRelationship = await newSite.post(
              `products/${productM.data.id}/relationships/brands`,
              relationshipData
            );
          }
        }

        //TIE PRODUCT to MainImage
        var productsMainImage = oldProducts.data.find(function(
          productsMainImage
        ) {
          return productsMainImage.name === product.name;
        });

        if (!productsMainImage.relationships.hasOwnProperty("main_image")) {
          console.log("no image");
        } else {
          console.log(
            "parent productsMainImage",
            productsMainImage.relationships.main_image.data.id
          );

          const productImage = await oldSite.get(
            `files/${productsMainImage.relationships.main_image.data.id}`
          );

          console.log("Assigning image %s to %s", productImage.data.file_name);

          console.log(
            `files?eq=filter(file_name, ${productImage.data.file_name})`
          );
          const newProductImage = await newSite.get(
            `files?eq=filter(file_name, ${productImage.data.file_name})`
          );
          //got to filter will // BUG:
          console.log("he", newProductImage.data);

          var mainImage = newProductImage.data.find(function(
            productsMainImage
          ) {
            return productsMainImage.file_name === productImage.data.file_name;
          });

          const relationshipData = {
            type: "main_image",
            id: mainImage.id
          };
          const newMainImageRelationship = await newSite.post(
            `products/${productM.data.id}/relationships/main-image`,
            relationshipData
          );
          console.log(newMainImageRelationship);
        }
      }
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
