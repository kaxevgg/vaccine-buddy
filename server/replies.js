var botMethods = require("../utils/bot");
var utilMethods = require("../utils/utils");
var messages = require("../utils/messages");
var users = require("../config").users;

module.exports.handleReply = function (chatId, user, originalMessageText, currentMessageText) {
    // HANDLING INITIAL SETUP FLOW
    if (originalMessageText == messages.setupMessages.phoneNumberMessage) {
        var phoneNumber = currentMessageText;

        users.doc(user.id).update({
            phoneNumber: phoneNumber
        }).then(function (response) {
            console.log(response);
        });

        botMethods.sendVaccinationDateMessage(chatId, true);
    } else if (originalMessageText == messages.setupMessages.vaccinationDateMessage) {
        var vaccinationDate = currentMessageText;

        users.doc(user.id).update({
            vaccinationDate: vaccinationDate
        }).then(function (response) {
            console.log(response);
        });

        botMethods.sendVaccinationDoseMessage(chatId, true)
    } else if (originalMessageText == messages.setupMessages.beneficiariesOtpMessage) {
        var otp = currentMessageText;
        botMethods.sendBeneficiariesMessage(chatId, otp, true);
    }

    // HANDLING BOT COMMANDS
    else if (originalMessageText == messages.commandMessages.vaccinationDateMessage) {
        var vaccinationDate = currentMessageText;

        users.doc(user.id).update({
            vaccinationDate: vaccinationDate
        }).then(function (response) {
            console.log(response);
        });
    } else if (originalMessageText == messages.commandMessages.beneficiariesOtpMessage) {
        var otp = currentMessageText;
        botMethods.sendBeneficiariesMessage(chatId, otp, user.data.txnId, false);
    } else if (originalMessageText == messages.commandMessages.bookingOtpMessage) {
        var otp = currentMessageText;
        botMethods.searchSlots(chatId, otp);
    } else if (originalMessageText == messages.commandMessages.captchaMessage) {
        var captcha = currentMessageText;

        users.doc(user.id).update({
            captcha: captcha
        }).then(function (response) {
            console.log(response);

            users.doc(user.id).get().then(function (response) {
                if (!response.exists) {
                    console.error("No user found")
                } else {
                    utilMethods.searchSlots(chatId, response.data(), 1, null)
                }
            });
        });
    }
}