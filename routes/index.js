var express = require('express');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
var botMethods = require("../utils/bot");
var messages = require("../utils/messages").messages;
var userModel = require("../utils/userModel").userModel;
var firebase = require("firebase-admin");

// Telegram Token
const telegramToken = '1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken, {polling: true});

// Configure Firebase Cloudstore Database
var serviceAccount = require("../firestore-certificate.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

// Get database
var db = firebase.firestore();
var users = db.collection('users');

// Telegram Bot

bot.on('polling_error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});

bot.setMyCommands([
  {command: "date", description: "Set vaccination start date in DD-MM-YYYY"},
  {command: "dose", description: "Set vaccination dose number"},
  {command: "age", description: "Set minimum age for vaccinations"},
  {command: "state", description: "Set state of residence"},
  {command: "district", description: "Set district of residence"},
  {command: "vaccines", description: "Set preferred vaccines (Covaxin or Covishield)"},
  {command: "beneficiaries", description: "Select beneficiaries for vaccination"}
]);

bot.on("message", function(message) {
  console.log("Message Received: ", message);
  var chatId = message.chat.id;

  users.doc(chatId.toString()).get().then(function(response) {
    if (!response.exists) {
      users.doc(chatId.toString()).set({
        first_name: message.from.first_name,
        last_name: message.from.last_name,
        username: message.from.username
      }).then(function(response) {
        console.log(response);
      })
    }
  })

  // Track bot commands
  if (message.text == '/start') {
    botMethods.sendInitialMessage(chatId, bot)
  } else if (message.text == '/date') {
    botMethods.sendVaccinationDateMessage(chatId, bot)
  } else if (message.text == '/dose') {
    botMethods.sendVaccinationDoseMessage(chatId, bot)
  } else if (message.text == '/age') {
    botMethods.sendAgeBracketMessage(chatId, bot)
  } else if (message.text == '/state') {
    botMethods.sendStateSelectionMessage(chatId, bot)
  } else if (message.text == '/district') {
    // Get StateId from Database
    // botMethods.sendDistrictSelectionMessage(chatId, bot)
  } else if (message.text == '/vaccines') {
    botMethods.sendPreferredVaccineMessage(chatId, bot, users)
  } else if (message.text == '/beneficiaries') {
    botMethods.sendBeneficiaryOTPMessage(chatId, phoneNumber, bot, function(response) {
      var txnId = response;

      users.doc(chatId.toString()).update({
        txnId: txnId
      }).then(function(response) {
        console.log(response);
      });
    });
  }

  // Track message replies
  if ('reply_to_message' in message) {
    var originalMessage = message.reply_to_message;

    if (originalMessage.text == messages.phoneNumberMessage) {
      var phoneNumber = message.text;

      users.doc(chatId.toString()).update({
        phoneNumber: phoneNumber
      }).then(function(response) {
        console.log(response);
      });

      // Send vaccination date message
      botMethods.sendVaccinationDateMessage(chatId, bot);

      // TODO: Finish all the other methods
    } else if (originalMessage.text == messages.vaccinationDateMessage) {
      var vaccinationDate = message.text;

      users.doc(chatId.toString()).update({
        vaccinationDate: vaccinationDate
      }).then(function(response) {
        console.log(response);
      });

      // Send vaccination dose number message
      botMethods.sendVaccinationDoseMessage(chatId, bot)
    } else if (originalMessage.text == messages.beneficiariesOtpMessage) {
      var otp = message.text;

      // Send vaccination dose number message
      users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
          console.error("No user found")
        } else {
          botMethods.sendBeneficiariesMessage(chatId, otp, response.data().txnId, bot, users);
        }
      });
    } else if (originalMessage.text == messages.bookingOtpMessage) {
      var otp = message.text;

      // Book vaccination slot
    }
  }
})

bot.on("poll_answer", function(poll) {
  var pollId = poll.poll_id;
  var chatId = poll.user.id;
  var pollOptions = poll.option_ids;

  users.doc(chatId.toString()).get().then(function(response) {
    if (!response.exists) {
      console.error("No user found")
    } else {
      if (pollId == response.data().preferredVaccinesPollId) {
        botMethods.sendBeneficiaryOTPMessage(chatId, response.data().phoneNumber, bot, function(response) {
          var txnId = response;
          var preferredVaccines = []

          pollOptions.map(function(option) {
            preferredVaccines.push(messages.preferredVaccines[option])
          });

          users.doc(chatId.toString()).update({
            txnId: txnId,
            preferredVaccines: preferredVaccines
          }).then(function(response) {
            console.log(response);
          });
        })
      } else if (pollId == response.data().beneficiariesPollId) {
        var beneficiaryIds = []

        response.data().allBeneficiaries.map(function(beneficiary) {
          beneficiaryIds.push(beneficiary.beneficiary_reference_id)
        });

        users.doc(chatId.toString()).update({
          beneficiaryIds: beneficiaryIds
        }).then(function(response) {
          console.log(response);
        });

        botMethods.sendSetupCompleteMessage(chatId, bot);
      }
    }
  });
})

bot.on("callback_query", function(query) {
  var callbackQueryData = JSON.parse(query.data);
  var chatId = query.message.chat.id;

  if (callbackQueryData.bot_command == "/dose") {
    var doseId = callbackQueryData.doseId;

    users.doc(chatId.toString()).update({
      dose: doseId
    }).then(function(response) {
      console.log(response);
    });

    botMethods.sendAgeBracketMessage(query.message.chat.id, bot)
  } else if (callbackQueryData.bot_command == "/age") {
    var minAge = callbackQueryData.minAge;
    
    users.doc(chatId.toString()).update({
      minAge: minAge
    }).then(function(response) {
      console.log(response);
    });

    botMethods.sendStateSelectionMessage(query.message.chat.id, bot)
  } else if (callbackQueryData.bot_command == "/state") {
    var stateId = callbackQueryData.stateId;
    
    users.doc(chatId.toString()).update({
      stateId: stateId
    }).then(function(response) {
      console.log(response);
    });

    botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, bot)
  } else if (callbackQueryData.bot_command == "/district") {
    var districtId = callbackQueryData.districtId;
    
    users.doc(chatId.toString()).update({
      districtId: districtId
    }).then(function(response) {
      console.log(response);
    });

    botMethods.sendPreferredVaccineMessage(query.message.chat.id, bot, users)
  }
})

// router.get('/', function(req, res, next) {
//   res.send("Welcome to the API")
// });

module.exports = router;