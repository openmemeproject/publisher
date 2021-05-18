const Twitter = require("twitter")
const dotenv = require("dotenv")
const fs = require("fs")
const https = require('https');

const Instagram = require('instagram-web-api')

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const validUrl = require('valid-url');
const path = require('path');

/* SCREENSHOT TEST START */

var parseUrl = function(url) {
    url = decodeURIComponent(url)
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = 'http://' + url;
    }

    return url;
};

app.get('/', function(req, res) {
    var urlToMeme = parseUrl(req.query.url);

    res.send(urlToMeme);
    const { username, password } = process.env

    const client = new Instagram({ username: 'openmemeproject', password: 'Easy8090' }, { language: 'de-DE' })


    ;(async () => {
      // URL or path of photo
      const photo = urlToMeme

      await client.login()

      // Upload Photo to feed or story, just configure 'post' to 'feed' or 'story'
      await client.uploadPhoto({ photo, caption: 'Test', post: 'feed' }).catch(error => { console.log('caught'); });
    })()


    function getImage(url, callback) {
        https.get(url, res => {
            // Initialise an array
            const bufs = [];

            // Add the data to the buffer collection
            res.on('data', function (chunk) {
                bufs.push(chunk)
            });

            // This signifies the end of a request
            res.on('end', function () {
                // We can join all of the 'chunks' of the image together
                const data = Buffer.concat(bufs);

                // Then we can call our callback.
                callback(null, data);
            });
        })
        // Inform the callback of the error.
        .on('error', callback);
    }

    getImage(urlToMeme, function (err, data) {
        // Handle the error if there was an error getting the image.
        if (err) {
            throw new Error(err);
        }

        dotenv.config()

        const tclient = new Twitter({
          consumer_key: process.env.CONSUMER_KEY,
          consumer_secret: process.env.CONSUMER_SECRET,
          access_token_key: process.env.ACCESS_TOKEN_KEY,
          access_token_secret: process.env.ACCESS_TOKEN_SECRET
        })

        

        tclient.post("media/upload", {media: data}, function(error, media, response) {
          if (error) {
            console.log(error)
          } else {
            const status = {
              status: "",
              media_ids: media.media_id_string
            }

            tclient.post("statuses/update", status, function(error, tweet, response) {
              if (error) {
                console.log(error)
              } else {
                console.log("Successfully tweeted an image!")
              }
            })
          }
        })

    })


});

