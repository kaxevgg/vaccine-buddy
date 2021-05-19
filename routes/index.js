var express = require('express');
var router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
var crypto = require('crypto');
var utilMethods = require("../utils/utils");
var botMethods = require("../utils/bot");
var messages = require("../utils/messages").messages;

// Telegram Token
const telegramToken = '1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken, {polling: true});

bot.on('polling_error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});

bot.setMyCommands([
  {command: "age", description: "Set minimum age for vaccinations"},
  {command: "beneficiaries", description: "Select beneficiaries for vaccination"},
  {command: "date", description: "Set vaccination start date in DD-MM-YYYY"},
  {command: "dose", description: "Set vaccination dose number"},
  {command: "state", description: "Set state of residence"},
  {command: "district", description: "Set district of residence"},
  {command: "vaccines", description: "Set preferred vaccines (Covaxin or Covishield)"}
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
      var phoneNumber = message.text;

      console.log(phoneNumber);

      // botMethods.sendVaccinationDateMessage

      // TODO: Finish all the other methods
    }
  }
  
  // // Second Message
  // if (message.reply_to_message.text == `Welcome ${message.from.first_name}. Enter your phone number`) {
    // generateOTP(message.text, function (response) {
    //   console.log(response.txnId);
    //   txnId = response.txnId;
    // });

    // bot.sendMessage(message.chat.id, 'Please enter OTP received', {
    // reply_markup: {
    //   force_reply: true
    // }
    // }).then(function(response) {
    //   console.log(response);
    // }).catch(function(error) {
    //   console.error(error);
    // })
  // }

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

bot.on("callback_query", function(query) {
  var callbackQueryData = JSON.parse(query.data)

  if (callbackQueryData.bot_command == "/state") {
    stateId = callbackQueryData.state_id;
    botMethods.sendDistrictSelectionMessage(query.message.chat.id, stateId, bot)
  } else if (callbackQueryData.bot_command == "/district") {
    districtId = callbackQueryData.district_id;
    console.log(districtId);
  }
})

// router.get('/', function(req, res, next) {
//   res.send("Welcome to the API")
// });

module.exports = router;