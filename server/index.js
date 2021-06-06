var express = require('express');
var router = express.Router();
var botMethods = require("../utils/bot");
var bot = require("../config").bot;
var users = require("../config").users;
var allowedUsers = require("../config").allowedUsers;
var handleReply = require("./replies").handleReply;
var handlePoll = require("./polls").handlePoll;
var handleQueryResponse = require("./queries").handleQueryResponse;
var handleBotCommands = require("./commands").handleBotCommands;

// Telegram Bot

bot.on('polling_error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});

bot.setMyCommands([
  {command: "restart", description: "To start setup from the beginning"},
  {command: "date", description: "Set vaccination start date in DD-MM-YYYY"},
  {command: "dose", description: "Set vaccination dose number"},
  {command: "age", description: "Set minimum age for vaccinations"},
  {command: "cost", description: "Set cost preference for vaccinations (Free or Paid)"},
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
    } else {

      var user = {
        id: response.id,
        data: response.data()
      }

      if ('username' in message.from) {
        allowedUsers.where('username', '==', message.from.username).get()
        .then(function (response) {
          response.forEach(function(doc) {
            console.log(doc.id, '=>', doc.data());
          });
          if (!response.empty) {
            // Handling all bot commands
            handleBotCommands(chatId, user, message);

            // Handling all message replies
            
            if ('reply_to_message' in message) {
              var originalMessage = message.reply_to_message;

              if ('text' in originalMessage) {
                handleReply(chatId, user, originalMessage.text, message.text)
              } else if ('caption' in originalMessage) {
                handleReply(chatId, user, originalMessage.caption, message.text)
              }
            }
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
              botMethods.sendUnauthorizedMessage(chatId);
          }   
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
      } else {
        botMethods.sendUnauthorizedMessage(chatId);
      }
    }
  });
})

// Poll Answer

bot.on("poll_answer", function(poll) {
  var chatId = poll.user.id;

  users.doc(chatId.toString()).get().then(function(response) {
    var user = {
      id: response.id,
      data: response.data()
    }
    handlePoll(chatId, poll, user);
  });
})

bot.on("callback_query", function(query) {
  handleQueryResponse(query);
})

router.get('/', function(req, res, next) {
  res.send("Welcome to Vaccine Buddy API.");
})

module.exports = router;