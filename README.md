## Usage

This script can be used to transfer data from one site to another.

A couple common use cases could be
-Creating a development and production environment with the same data.
-Creating a sandbox or demo site from existing data sets

The script is hosted and has a couple dummy data sets that can be used.
https://transfer-catalog-data.herokuapp.com/
-Notes the hosted script, is one a micro cluster and has a low timeout set. If you are looking to move large amount of data see Development.

Want to replicate IloveLamp, just copy the data to your site.
Example usages
https://github.com/moltin-examples/nextjs-demo-store
https://github.com/moltin-examples/react-microsite

Want to replicate BrightCosmetics, just copy the data to your site.
Example usages
https://github.com/moltin-examples/progressive-web-app
https://github.com/moltin-examples/applepayexample-completed

## Development

- Install packages

```
npm install
```

Moltin credentials are set via .env variables and can be set in a variety of ways. The out of the implementation is looking for them to be passed in via the /transfer post.

```
process.env["OLD_SITE_CLIENT_ID"] = req.body.old_client_id;
process.env["NEW_SITE_CLIENT_ID"] = req.body.new_client_id;
process.env["NEW_SITE_SECRET"] = req.body.new_client_secret;
```

To adjust the timeout

```
req.setTimeout(300000);
```

- Run `app.js`

```
node app.js
```

Or using the Dockerfile

```
docker build -t transfer-moltin-site-app .
```

Then you need to find the docker image id

```
docker images
```

Then run

```
docker run -p 80:3000 {image-id}
// fill with your image-id
```
