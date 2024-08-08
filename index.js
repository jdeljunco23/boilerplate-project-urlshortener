require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let dns = require('node:dns');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000;

const URLSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: {
    type: String,
    required: true,
    unique: true
  }
});

const URLModel = mongoose.model('URL', URLSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  let url = req.body.url;
  try {
    urlObject = new URL(url);
    console.log(urlObject);
    dns.lookup(urlObject.hostname, (err, address, family) => {

      if (!address) {
        res.json({ error: 'invalid url' })
      } else {
        let original_url = urlObject.href;
        let short_url = 1;

        resObject = { original_url: original_url, short_url: short_url }

        let newURL = new URLModel(resObject);
        newURL.save();
        res.json(resObject);
      }
    })
  }
  catch {
    res.json({ error: 'invalid url' })
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
