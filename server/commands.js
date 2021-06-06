var botMethods = require("../utils/bot");

module.exports.handleBotCommands = function (chatId, user, message) {
    if (message.text == '/start') {
        botMethods.sendInitialMessage(chatId)
    } else if (message.text == '/date') {
        botMethods.sendVaccinationDateMessage(chatId, false)
    } else if (message.text == '/dose') {
        botMethods.sendVaccinationDoseMessage(chatId, false)
    } else if (message.text == '/age') {
        botMethods.sendAgeBracketMessage(chatId, false)
    } else if (message.text == '/cost') {
        botMethods.sendCostSelectionMessage(chatId, false)
    } else if (message.text == '/state') {
        botMethods.sendStateSelectionMessage(chatId, false)
    } else if (message.text == '/district') {
        botMethods.sendDistrictSelectionMessage(chatId, user.data.stateId, false);
    } else if (message.text == '/vaccines') {
        botMethods.sendPreferredVaccineMessage(chatId, false)
    } else if (message.text == '/beneficiaries') {
        botMethods.sendBeneficiaryOTPMessage(chatId, user.data.phoneNumber, false);
    } else if (message.text == '/book') {
        botMethods.sendBookingOTPMessage(chatId, user.data.phoneNumber)
    }
}