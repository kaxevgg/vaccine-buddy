var express = require('express');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var crypto = require('crypto');

// Telegram Token
// 1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY
const telegramToken = '1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken);

// Util functions

function generateOTP(mobile) {
  var options = {
      'method': 'POST',
      'url': 'https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',
      'headers': {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "secret": "U2FsdGVkX1+VTlP0So1QxL6tbZmIty6lx41dE0iN09YJTzJwqYwC06FCG90Sw8h7qgJhN+jW+TGYvKPDXOEv0Q==",
          "mobile": mobile
      })
  };
  request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      return response.body;
  });
}

router.get('/', function(req, res, next) {
  res.send("Welcome to the API")
});

/* GET home page. */
router.get('/generateOTP', function(req, res, next) {

  var options = {
    'method': 'POST',
    'url': 'https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"secret":"U2FsdGVkX1+VTlP0So1QxL6tbZmIty6lx41dE0iN09YJTzJwqYwC06FCG90Sw8h7qgJhN+jW+TGYvKPDXOEv0Q==","mobile": req.query.mobile})

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.json(JSON.parse(response.body));
  });

});

router.post('/validateOTP', function(req, res, next) {
  
  var otp = crypto.createHash("sha256").update(req.body.otp).digest("hex");

  var options = {
    'method': 'POST',
    'url': 'https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"otp":otp,"txnId": req.body.txnId})

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.json(JSON.parse(response.body));
  });

});

router.post('/getBeneficiaries', function(req, res, next) {

  var options = {
    'method': 'GET',
    'url': 'https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${req.body.token}`
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.json(JSON.parse(response.body));
  });

});

router.post('/telegramBot', function(req, res, next) {

  var message = req.body.message;
  console.log(message);
  
  if (message.text == '/start') {
    bot.sendMessage(message.chat.id, `Welcome ${message.from.first_name}. Enter your phone number`, {
      reply_markup: {
        force_reply: true
      }
    }).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.error(error);
    })
  }
  
  if (message.reply_to_message.text == `Welcome ${message.from.first_name}. Enter your phone number`) {
    generateOTP(message.text)
  }

  res.send(true)

});

router.post('/searchVaccinationSlots', function(req, res, next) {

  var options = {
    'method': 'GET',
    'url': `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${req.body.district_id}&date=${req.body.vaccine_date}`,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${req.body.token}`
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var centers = JSON.parse(response.body).centers;

    for (i in centers) {
      center = centers[i];
      for (j in center.sessions) {
        session = center.sessions[j];

        if (session.min_age_limit == req.body.age) {
          console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

          data = {
            center_id: center.center_id,
            session_id: session.session_id,
            dose: 1,
            slot: session.slots[0],
            beneficiaries: []
          }

          console.log(session);
        }
      }
    }

    res.send("Hellooo");
  });

});

module.exports = router;