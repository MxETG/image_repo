const cors = require('cors')

const express = require('express')
const app = express()
const port = 3000

var Cloudant = require('@cloudant/cloudant');
var config = require('./cloudant_config.json')
var cloudant = Cloudant({ url: config.url, plugins: { iamauth: { iamApiKey: config.apikey } } });
var dbname = 'image';
var db = cloudant.db.use(dbname);
const imageFolderPath = "/Users/wangtaohao/coop4/image_repo/images/"
let bodyParser = require('body-parser')
var sizeOf = require('image-size');

const fs = require('fs');

async function labelDetect(imagePath) {
  const vision = require('@google-cloud/vision');

  const client = new vision.ImageAnnotatorClient();

  const [result] = await client.labelDetection(imagePath);
  const labels = result.labelAnnotations;
  let tags = [];
  let i = 0;
  labels.forEach(label => {
    tags[i] = label.description;
    i++;
  });
  return tags;
}

app.use(cors());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.post('/upload-image/', function (req, res) {
  // write the image to disk
  var base64Data = req.body.image.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
  let imageName = Date.now() + Math.floor(Math.random() * 50);
  const randomNumber = Math.floor(Math.random() * 10);
  let filePath = imageFolderPath + imageName + randomNumber + '.jpg';
  fs.writeFile(filePath, new Buffer(base64Data, 'base64'), ()=>{});
  // Call labelDetect to get the tags of the image
  labelDetect(filePath).then((result) => {
    // Insert document to image DB
    var dimensions = sizeOf(filePath);
    console.log(dimensions.width, dimensions.height);
    let tagsStr = "";
    for (let i = 0; i < result.length-1; i++) {
      tagsStr = tagsStr + result[i].toLowerCase() + ',';
    }
    tagsStr = tagsStr + result[result.length-1].toLowerCase();
    const doc = {
      _id: 'shopify:' + imageName + randomNumber,
      tags: tagsStr,
      width: dimensions.width,
      height: dimensions.height
    }
    db.insert( doc, function(err, data) {
      if (data) {
        console.log(data);
        res.send(data);
      } else {
        console.log(err);
        res.send(err);
      }
    });
  });
})

// Get all images
app.get('/all-images/', function (req, res) {
  db.partitionedList('shopify', { include_docs: true }, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
})

// Search images
app.get('/search/', function (req, res) {
  searchText = req.query.searchText;
  const selector = {
    "_id": {
      "$gt": 0
    },
    "tags": {
      "$regex": searchText
    }
  }
  db.partitionedFind('shopify', { 'selector': selector }, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  })
})

app.listen(port, () => {
  console.log(`Image Repo project listening at http://localhost:${port}`)
})