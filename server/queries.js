var botMethods = require("../utils/bot");
var messages = require("../utils/messages");
var users = require("../config").users;

module.exports.handleQueryResponse = function (query) {
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
}