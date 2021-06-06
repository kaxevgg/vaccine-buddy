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
        }).then(function (response) {
            console.log(response);
        });

        if (callbackQueryData.isInitialSetup) {
            botMethods.sendAgeBracketMessage(chatId, true)
        } else {
            botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Dose No.', doseId);
        }
    } else if (callbackQueryData.bot_command == "/age") {
        var minAge = callbackQueryData.minAge;

        users.doc(chatId.toString()).update({
            minAge: minAge
        }).then(function (response) {
            console.log(response);
        });

        if (callbackQueryData.isInitialSetup) {
            botMethods.sendCostSelectionMessage(chatId, true)
        } else {
            botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Minimum Age', minAge);
        }
    } else if (callbackQueryData.bot_command == "/cost") {
        var cost = callbackQueryData.cost;

        users.doc(chatId.toString()).update({
            preferredCost: cost
        }).then(function (response) {
            console.log(response);
        });

        if (callbackQueryData.isInitialSetup) {
            botMethods.sendStateSelectionMessage(chatId, true)
        } else {
            if (cost.length == 1) {
                botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Cost', cost[0]);
            } else {
                botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Cost', 'Both');
            }
        }
    } else if (callbackQueryData.bot_command == "/state") {
        var stateId = callbackQueryData.stateId;

        users.doc(chatId.toString()).update({
            stateId: stateId
        }).then(function (response) {
            console.log(response);
        });

        if (callbackQueryData.isInitialSetup) {
            botMethods.sendDistrictSelectionMessage(chatId, stateId, true)
        } else {
            botMethods.sendDistrictSelectionMessage(chatId, stateId, false)
        }
    } else if (callbackQueryData.bot_command == "/district") {
        var districtId = callbackQueryData.districtId;

        users.doc(chatId.toString()).update({
            districtId: districtId
        }).then(function (response) {
            console.log(response);
        });

        if (callbackQueryData.isInitial) {
            botMethods.sendPreferredVaccineMessage(chatId, true)
        } else {
            botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'District', 'reflect your choice above.');
        }
    }
}