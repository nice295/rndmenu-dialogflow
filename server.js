// 
//
// @author: Ido Green | @greenido
// @date: Nov 2017
// @see: h
// https://github.com/greenido/bitcoin-info-action
// http://expressjs.com/en/starter/static-files.html
// 

// init project pkgs
const express = require('express');
const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');

// Pretty JSON output for logs
const prettyjson = require('prettyjson');
const toSentence = require('underscore.string/toSentence');

const _getTomorrowMenu = require('./getTomorrowMenu');
const _getMenu = require('./getMenu');

app.use(bodyParser.json({type: 'application/json'}));
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Handle webhook requests
app.post('/', function(req, res, next) {
  // Log the request headers and body to help in debugging.
  // Check the webhook requests coming from Dialogflow by clicking the Logs button the sidebar.
  logObject('Request headers: ', req.headers);
  logObject('Request body: ', req.body);
    
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});

  // Declare constants for your action and parameter names
  const TODAY_MENU_ACTION = 'today-menu'; 
  const TOMORROW_MENU_ACTION = 'tomorrow-menu'; 
  
  // Create functions to handle intents here
  function getTodayMenu(assistant) {
    console.log('** Handling action: ' + TODAY_MENU_ACTION);
    
    var time = req.body.result.parameters.time;
    var number = req.body.result.parameters.number;   
    console.log('** number: ' + number);
    console.log('** time: ' + time);
    
    if (number == 1 && time == '점심') {
      _getMenu(12, function (data) {
        assistant.tell(data); 
       });
    }
    else if (number == 2 && time == '아침') {
      _getMenu(21, function (data) {
        assistant.tell(data); 
       });
    }
    else if (number == 2 && time == '점심') {
      _getMenu(22, function (data) {
        assistant.tell(data); 
       });
    }
    else if (number == 2 && time == '저녁') {
      _getMenu(23, function (data) {
        assistant.tell(data); 
       });
    }
    else {
      assistant.tell(number + '식당 ' + time + '에는 식당 운영을 하지 않습니다.'); 
    }
  }

  function getTomorrowMenu(assistant) {
    console.log('** Handling action: ' + TOMORROW_MENU_ACTION);
    _getTomorrowMenu(function (data) {
      assistant.tell(data);
    });
  }
  
  // Add handler functions to the action router.
  let actionRouter = new Map();
  actionRouter.set(TODAY_MENU_ACTION, getTodayMenu);
  actionRouter.set(TOMORROW_MENU_ACTION, getTomorrowMenu);
  
  // Route requests to the proper handler functions via the action router.
  assistant.handleRequest(actionRouter);
});

//
// Handle errors
//
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Oppss... could not check the bitcoin price');
})

//
// Pretty print objects for logging
//
function logObject(message, object, options) {
  console.log(message);
  console.log(prettyjson.render(object, options));
}

//
// Listen for requests -- Start the party
//
let server = app.listen(process.env.PORT, function () {
  console.log('--> Our Webhook is listening on ' + JSON.stringify(server.address()));
});
