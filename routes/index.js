var express = require('express');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
var botMethods = require("../utils/bot");
var messages = require("../utils/messages");
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

  /***
   * Handling all bot commands
   * This will only handle response to user input
   */
  if (message.text == '/start') {
    botMethods.sendInitialMessage(chatId, bot)
  } else if (message.text == '/date') {
    botMethods.sendVaccinationDateMessage(chatId, bot, false)
  } else if (message.text == '/dose') {
    botMethods.sendVaccinationDoseMessage(chatId, bot, false)
  } else if (message.text == '/age') {
    botMethods.sendAgeBracketMessage(chatId, bot, false)
  } else if (message.text == '/state') {
    botMethods.sendStateSelectionMessage(chatId, bot, false)
  } else if (message.text == '/district') {
    users.doc(chatId.toString()).get().then(function(response) {
      if (!response.exists) {
        console.log("No user found")
      } else {
        botMethods.sendDistrictSelectionMessage(chatId, response.data().stateId, bot, false)
      }
    })
  } else if (message.text == '/vaccines') {
    botMethods.sendPreferredVaccineMessage(chatId, bot, users, false)
  } else if (message.text == '/beneficiaries') {
    users.doc(chatId.toString()).get().then(function(response) {
      if (!response.exists) {
        console.log("No user found")
      } else {
        botMethods.sendBeneficiaryOTPMessage(chatId, response.data().phoneNumber, bot, false, function(response) {
          var txnId = response;
    
          users.doc(chatId.toString()).update({
            txnId: txnId
          }).then(function(response) {
            console.log(response);
          });
        });
      }
    })
  }

  /***
   * Handling all message replies
   */

  if ('reply_to_message' in message) {
    var originalMessage = message.reply_to_message;

    // HANDLING INITIAL SETUP FLOW
    if (originalMessage.text == messages.setupMessages.phoneNumberMessage) {
      var phoneNumber = message.text;

      users.doc(chatId.toString()).update({
        phoneNumber: phoneNumber
      }).then(function(response) {
        console.log(response);
      });

      botMethods.sendVaccinationDateMessage(chatId, bot, true);
    } else if (originalMessage.text == messages.setupMessages.vaccinationDateMessage) {
      var vaccinationDate = message.text;

      users.doc(chatId.toString()).update({
        vaccinationDate: vaccinationDate
      }).then(function(response) {
        console.log(response);
      });

      botMethods.sendVaccinationDoseMessage(chatId, bot, true)
    } else if (originalMessage.text == messages.setupMessages.beneficiariesOtpMessage) {
      var otp = message.text;

      users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
          console.error("No user found")
        } else {
          botMethods.sendBeneficiariesMessage(chatId, otp, response.data().txnId, bot, true, users);
        }
      });
    } else if (originalMessage.text == messages.setupMessages.bookingOtpMessage) {
      var otp = message.text;
    } 

    // HANDLING BOT COMMANDS
    else if (originalMessage.text == messages.commandMessages.phoneNumberMessage) {
      var phoneNumber = message.text;

      users.doc(chatId.toString()).update({
        phoneNumber: phoneNumber
      }).then(function(response) {
        console.log(response);
      });
    } else if (originalMessage.text == messages.commandMessages.vaccinationDateMessage) {
      var vaccinationDate = message.text;

      users.doc(chatId.toString()).update({
        vaccinationDate: vaccinationDate
      }).then(function(response) {
        console.log(response);
      });
    } else if (originalMessage.text == messages.commandMessages.beneficiariesOtpMessage) {
      var otp = message.text;
      users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
          console.error("No user found")
        } else {
          botMethods.sendBeneficiariesMessage(chatId, otp, response.data().txnId, bot, false, users);
        }
      });
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
      // HANDLING INITIAL SETUP FLOW
      if (pollId == response.data().initialSetupPreferredVaccinesPollId) {
        botMethods.sendBeneficiaryOTPMessage(chatId, response.data().phoneNumber, bot, true, function(response) {
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
      } else if (pollId == response.data().initialSetupBeneficiariesPollId) {
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

      // HANDLING BOT COMMANDS
      else if (pollId == response.data().updatedPreferredVaccinesPollId) {
        var preferredVaccines = []

        pollOptions.map(function(option) {
          preferredVaccines.push(messages.preferredVaccines[option])
        });

        users.doc(chatId.toString()).update({
          preferredVaccines: preferredVaccines
        }).then(function(response) {
          console.log(response);
        });
      } else if (pollId == response.data().updatedBeneficiariesPollId) {
        var beneficiaryIds = []

        response.data().allBeneficiaries.map(function(beneficiary) {
          beneficiaryIds.push(beneficiary.beneficiary_reference_id)
        });

        users.doc(chatId.toString()).update({
          beneficiaryIds: beneficiaryIds
        }).then(function(response) {
          console.log(response);
        });
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

    if (callbackQueryData.isInitialSetup) {
      botMethods.sendAgeBracketMessage(query.message.chat.id, bot, true)
    }
  } else if (callbackQueryData.bot_command == "/age") {
    var minAge = callbackQueryData.minAge;
    
    users.doc(chatId.toString()).update({
      minAge: minAge
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitialSetup) {
      botMethods.sendStateSelectionMessage(query.message.chat.id, bot, true)
    }
  } else if (callbackQueryData.bot_command == "/state") {
    var stateId = callbackQueryData.stateId;
    
    users.doc(chatId.toString()).update({
      stateId: stateId
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitialSetup) {
      botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, bot, true)
    }
  } else if (callbackQueryData.bot_command == "/district") {
    var districtId = callbackQueryData.districtId;
    
    users.doc(chatId.toString()).update({
      districtId: districtId
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitial) {
      botMethods.sendPreferredVaccineMessage(query.message.chat.id, bot, users, true)
    }
  }
})

module.exports = router;