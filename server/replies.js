var botMethods = require("../utils/bot");
var utilMethods = require("../utils/utils");
var messages = require("../utils/messages");
var users = require("../config").users;

module.exports.handleReply = function (chatId, user, originalMessageText, currentMessageText) {
    // HANDLING INITIAL SETUP FLOW
    if (originalMessageText == messages.setupMessages.phoneNumberMessage) {
        var phoneNumber = currentMessageText;

        if (phoneNumber.length == 10 && phoneNumber.match(/^\d{10}$/)) {
            users.doc(user.id).update({
                phoneNumber: phoneNumber
            }).then(function (response) {
                console.log(response);
            });
    
            botMethods.sendVaccinationDateMessage(chatId, true);
        } else {
            botMethods.sendErrorMessage(chatId, "Phone number format is invalid.", function(response) {
                botMethods.sendPhoneNumberMessage(chatId);
            });
        }
    } else if (originalMessageText == messages.setupMessages.vaccinationDateMessage) {
        var vaccinationDate = currentMessageText;

        if (vaccinationDate.match(/^(0?[1-9]|[12][0-9]|3[01])[-](0?[1-9]|1[012])[-]\d{4}$/)) {
            users.doc(user.id).update({
                vaccinationDate: vaccinationDate
            }).then(function (response) {
                console.log(response);
            });
    
            botMethods.sendVaccinationDoseMessage(chatId, true)
        } else {
            botMethods.sendErrorMessage(chatId, "Date format is invalid. Enter in DD-MM-YYYY.", function(response) {
                botMethods.sendVaccinationDateMessage(chatId, true)
            });
        }
    } else if (originalMessageText == messages.setupMessages.beneficiariesOtpMessage) {
        var otp = currentMessageText;

        if (otp.match(/^\d{6}$/)) {
            botMethods.sendBeneficiariesMessage(chatId, otp, true);
        } else {
            botMethods.sendErrorMessage(chatId, "OTP format is wrong.", function(response) {
                botMethods.sendBeneficiaryOTPMessage(chatId, user.data.phoneNumber, true)
            });
        }
    }

    // HANDLING BOT COMMANDS
    else if (originalMessageText == messages.commandMessages.vaccinationDateMessage) {
        var vaccinationDate = currentMessageText;

        if (vaccinationDate.match(/^(0?[1-9]|[12][0-9]|3[01])[-](0?[1-9]|1[012])[-]\d{4}$/)) {
            users.doc(user.id).update({
                vaccinationDate: vaccinationDate
            }).then(function (response) {
                console.log(response);
            });
    
            botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Vaccination Date', vaccinationDate);
        } else {
            botMethods.sendErrorMessage(chatId, "Date format is invalid. Enter in DD-MM-YYYY.", function(response) {
                botMethods.sendVaccinationDateMessage(chatId, false)
            });
        }
    } else if (originalMessageText == messages.commandMessages.beneficiariesOtpMessage) {
        var otp = currentMessageText;

        if (otp.match(/^\d{6}$/)) {
            botMethods.sendBeneficiariesMessage(chatId, otp, false);
        } else {
            botMethods.sendErrorMessage(chatId, "OTP format is wrong.", function(response) {
                botMethods.sendBeneficiaryOTPMessage(chatId, user.data.phoneNumber, false)
            });
        }
    } else if (originalMessageText == messages.commandMessages.bookingOtpMessage) {
        var otp = currentMessageText;

        if (otp.match(/^\d{6}$/)) {
            botMethods.searchSlots(chatId, otp);
        } else {
            botMethods.sendErrorMessage(chatId, "OTP format is wrong.", function(response) {
                botMethods.sendBookingOTPMessage(chatId, user.data.phoneNumber)
            });
        }
    }
}