var express = require('express');
var router = express.Router();
var botMethods = require("../utils/bot");
var messages = require("../utils/messages");
var bot = require("../config").bot;
var users = require("../config").users;

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
  {command: "beneficiaries", description: "Select beneficiaries for vaccination"},
  {command: "book", description: "Initiate booking of vaccine"},
]);

bot.on("message", function(message) {
  console.log("Message Received: ", message);
  var chatId = message.chat.id;

  users.doc(chatId.toString()).get().then(function(response) {
    if (!response.exists) {
      users.doc(chatId.toString()).set({
        first_name: message.from.first_name
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
    botMethods.sendInitialMessage(chatId)
  } else if (message.text == '/date') {
    botMethods.sendVaccinationDateMessage(chatId, false)
  } else if (message.text == '/dose') {
    botMethods.sendVaccinationDoseMessage(chatId, false)
  } else if (message.text == '/age') {
    botMethods.sendAgeBracketMessage(chatId, false)
  } else if (message.text == '/state') {
    botMethods.sendStateSelectionMessage(chatId, false)
  } else if (message.text == '/district') {
    users.doc(chatId.toString()).get().then(function(response) {
      if (!response.exists) {
        console.log("No user found")
      } else {
        botMethods.sendDistrictSelectionMessage(chatId, response.data().stateId, false)
      }
    })
  } else if (message.text == '/vaccines') {
    botMethods.sendPreferredVaccineMessage(chatId, false)
  } else if (message.text == '/beneficiaries') {
    users.doc(chatId.toString()).get().then(function(response) {
      if (!response.exists) {
        console.log("No user found")
      } else {
        botMethods.sendBeneficiaryOTPMessage(chatId, response.data().phoneNumber, false);
      }
    })
  } else if (message.text == '/book') {
    users.doc(chatId.toString()).get().then(function(response) {
      if (!response.exists) {
        console.log("No user found")
      } else {
        botMethods.sendBookingOTPMessage(chatId, response.data().phoneNumber)
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

      botMethods.sendVaccinationDateMessage(chatId, true);
    } else if (originalMessage.text == messages.setupMessages.vaccinationDateMessage) {
      var vaccinationDate = message.text;

      users.doc(chatId.toString()).update({
        vaccinationDate: vaccinationDate
      }).then(function(response) {
        console.log(response);
      });

      botMethods.sendVaccinationDoseMessage(chatId, true)
    } else if (originalMessage.text == messages.setupMessages.beneficiariesOtpMessage) {
      var otp = message.text;
      botMethods.sendBeneficiariesMessage(chatId, otp, true);
    }

    // HANDLING BOT COMMANDS
    else if (originalMessage.text == messages.commandMessages.vaccinationDateMessage) {
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
          botMethods.sendBeneficiariesMessage(chatId, otp, response.data().txnId, false);
        }
      });
    } else if (originalMessage.text == messages.commandMessages.bookingOtpMessage) {
      var otp = message.text;
      botMethods.searchSlots(chatId, otp);
    } else if (originalMessage.caption == messages.commandMessages.captchaMessage) {
      var captcha = message.text;
      botMethods.initiateBookingSlot(chatId, captcha);
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
        botMethods.sendBeneficiaryOTPMessage(chatId, response.data().phoneNumber, true);
        var preferredVaccines = []

        pollOptions.map(function(option) {
          preferredVaccines.push(messages.preferredVaccines[option])
        });

        users.doc(chatId.toString()).update({
          preferredVaccines: preferredVaccines
        }).then(function(response) {
          console.log(response);
        });
      } else if (pollId == response.data().initialSetupBeneficiariesPollId) {
        var beneficiaryIds = []
        var allBeneficiaries = response.data().allBeneficiaries;

        pollOptions.map(function(option) {
          beneficiaryIds.push(allBeneficiaries[option].beneficiary_reference_id)
        });

        users.doc(chatId.toString()).update({
          beneficiaryIds: beneficiaryIds
        }).then(function(response) {
          console.log(response);
        });

        botMethods.sendSetupCompleteMessage(chatId);
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

        var allBeneficiaries = response.data().allBeneficiaries;

        pollOptions.map(function(option) {
          beneficiaryIds.push(allBeneficiaries[option].beneficiary_reference_id)
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
      botMethods.sendAgeBracketMessage(query.message.chat.id, true)
    }
  } else if (callbackQueryData.bot_command == "/age") {
    var minAge = callbackQueryData.minAge;
    
    users.doc(chatId.toString()).update({
      minAge: minAge
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitialSetup) {
      botMethods.sendStateSelectionMessage(query.message.chat.id, true)
    }
  } else if (callbackQueryData.bot_command == "/state") {
    var stateId = callbackQueryData.stateId;
    
    users.doc(chatId.toString()).update({
      stateId: stateId
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitialSetup) {
      botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, true)
    } else {
      botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, false)
    }
  } else if (callbackQueryData.bot_command == "/district") {
    var districtId = callbackQueryData.districtId;
    
    users.doc(chatId.toString()).update({
      districtId: districtId
    }).then(function(response) {
      console.log(response);
    });

    if (callbackQueryData.isInitial) {
      botMethods.sendPreferredVaccineMessage(query.message.chat.id, true)
    }
  }
})

router.get('/', function(req, res, next) {
  res.send("Hello");
})

module.exports = router;