var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var jsonParser = bodyParser.json();

app.set('port', (process.env.PORT || 5000));


app.get('/', function (request, response) {
  if (request.query['hub.verify_token'] === 'bonjour_maxime') {
    response.send(request.query['hub.challenge']);
  }
  response.send('Error, wrong validation token');
})

app.post('/', jsonParser, function(request, response) {
  messaging_events = request.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = request.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      translate(sender, text);
    }
  }
  response.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var fb_page_token = "CAACtt1oFXlUBAJW7xhhC45GKnZBZCeyB5gnVwOA9F1ZAnXYnphHfces2srXqYhockhZChWLB7nb1XpgxFVtfsAZAjv89cPu0vM3MsueZAEbpbQncO1vZASrZBfD1cCRiwSEMZAZAm02fxfWuPYPngNrREmA5jByQvrJRfsUuI4cc9J4mCn3oVgrcDXNghp7JZBJA1vy6kVDguPBdQZDZD";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:fb_page_token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

var google_token = "AIzaSyCoTC5deIBbRDkGUkkr1icyhxB1Btm1Dy8";

function translate(sender, text) {
  request({
    url: 'https://www.googleapis.com/language/translate/v2',
    qs: {
      key: google_token,
      source: 'en',
      target: 'fr',
      q: text
    },
    method: 'GET',
  }, function(error, response, body) {
    console.log('body: ', response.body);
    if (error) {
      console.log('Error translating message: ', error);
    } else {
      var info = JSON.parse(body);
      translatedText = info.data.translations[0].translatedText;
      console.log('En Francais: ', translatedText);
      sendTextMessage(sender, translatedText);
    }
  });
}
