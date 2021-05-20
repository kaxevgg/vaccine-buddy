var express = require('express');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
var utilMethods = require("../utils/utils");
var botMethods = require("../utils/bot");
var messages = require("../utils/messages").messages;
var userModel = require("../utils/userModel").userModel;

// Telegram Token
const telegramToken = '1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken, {polling: true});

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

  // First Message
  if (message.text == '/start') {
    botMethods.sendInitialMessage(chatId, bot)
  } else if (message.text == '/state') {
    botMethods.sendStateSelectionMessage(chatId, bot)
  }

  // Track message replies
  if ('reply_to_message' in message) {
    var originalMessage = message.reply_to_message;

    if (originalMessage.text == messages.phoneNumberMessage) {
      userModel.phoneNumber = message.text;

      // Send vaccination date message
      botMethods.sendVaccinationDateMessage(chatId, bot)

      // TODO: Finish all the other methods
    } else if (originalMessage.text == messages.vaccinationDateMessage) {
      userModel.vaccinationDate = message.text;

      // Send vaccination dose number message
      botMethods.sendVaccinationDoseMessage(chatId, bot)
    } else if (originalMessage.text == messages.otpMessage) {
      var otp = message.text;
      userModel.otp = otp;

      // Send vaccination dose number message
      botMethods.sendBeneficiariesMessage(chatId, otp, userModel.txnId, bot);
    }
  }

  // // Third Message
  // if (message.reply_to_message.text == 'Please enter OTP received') {
  //   var otp = crypto.createHash("sha256").update(message.text).digest("hex");

  //   validateOTP(otp, txnId, function (response) {
  //     userToken = response.token;

  //     getBeneficiaries(userToken, function (response) {
  //       var beneficiaries = response.beneficiaries;
  
  //       var beneficiariesButtonOptions = []
  
  //       beneficiaries.map(function(beneficiary) {
  //         beneficiariesButtonOptions.push({ text: beneficiary.name, callback_data: beneficiary.beneficiary_reference_id})
  //       });
  
  //       bot.sendMessage(message.chat.id, `Welcome ${message.from.first_name}. Enter your phone number`, {
  //         reply_markup: {
  //           inline_keyboard: [
  //             beneficiariesButtonOptions
  //           ]
  //         }
  //       }).then(function(response) {
  //         console.log(response);
  //       }).catch(function(error) {
  //         console.error(error);
  //       })
  //     })
  //   });
  // }
})

bot.on("poll_answer", function(poll) {
  var pollId = poll.poll_id;
  var pollChoices = poll.option_ids;

  console.log(userModel);

  // If vaccine choice
  if (userModel.txnId.length == 0) {
    botMethods.sendOTPMessage(poll.user.id, userModel.phoneNumber, bot, function(response) {
      userModel.txnId = response;
    })
  } else {
    console.log("BENEFICIARIES SELECTED")
    console.log(userModel);
  }
})

bot.on("callback_query", function(query) {
  var callbackQueryData = JSON.parse(query.data)

  if (callbackQueryData.bot_command == "/dose") {
    var doseId = callbackQueryData.doseId;
    userModel.dose = doseId;
    botMethods.sendAgeBracketMessage(query.message.chat.id, bot)
  } else if (callbackQueryData.bot_command == "/age") {
    var minAge = callbackQueryData.minAge;
    userModel.minimumAge = minAge;
    botMethods.sendStateSelectionMessage(query.message.chat.id, bot)
  } else if (callbackQueryData.bot_command == "/state") {
    var stateId = callbackQueryData.stateId;
    userModel.stateId = stateId;
    botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, bot)
  } else if (callbackQueryData.bot_command == "/district") {
    var districtId = callbackQueryData.districtId;
    userModel.districtId = districtId;
    botMethods.sendPreferredVaccineMessage(query.message.chat.id, bot)
  }
})

// router.get('/', function(req, res, next) {
//   res.send("Welcome to the API")
// });

module.exports = router;