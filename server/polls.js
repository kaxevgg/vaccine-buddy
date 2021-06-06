var botMethods = require("../utils/bot");
var messages = require("../utils/messages");
var users = require("../config").users;

module.exports.handlePoll = function (chatId, poll, user) {
    var pollId = poll.poll_id;
    var pollOptions = poll.option_ids;

    // HANDLING INITIAL SETUP FLOW
    if (pollId == user.data.initialSetupPreferredVaccinesPollId) {
        botMethods.sendBeneficiaryOTPMessage(chatId, user.data.phoneNumber, true);
        var preferredVaccines = []

        pollOptions.map(function (option) {
            preferredVaccines.push(messages.preferredVaccines[option])
        });

        users.doc(user.id).update({
            preferredVaccines: preferredVaccines
        }).then(function (response) {
            console.log(response);
        });
    } else if (pollId == user.data.initialSetupBeneficiariesPollId) {
        var beneficiaryIds = []
        var allBeneficiaries = user.data.allBeneficiaries;

        pollOptions.map(function (option) {
            beneficiaryIds.push(allBeneficiaries[option].beneficiary_reference_id)
        });

        users.doc(user.id).update({
            beneficiaryIds: beneficiaryIds
        }).then(function (response) {
            console.log(response);
        });

        botMethods.sendSetupCompleteMessage(chatId);
    }

    // HANDLING BOT COMMANDS
    else if (pollId == user.data.updatedPreferredVaccinesPollId) {
        var preferredVaccines = []

        pollOptions.map(function (option) {
            preferredVaccines.push(messages.preferredVaccines[option])
        });

        users.doc(user.id).update({
            preferredVaccines: preferredVaccines
        }).then(function (response) {
            console.log(response);
        });

        botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Vaccines', 'reflect your poll choices above.');
    } else if (pollId == user.data.updatedBeneficiariesPollId) {
        var beneficiaryIds = []

        var allBeneficiaries = user.data.allBeneficiaries;

        pollOptions.map(function (option) {
            beneficiaryIds.push(allBeneficiaries[option].beneficiary_reference_id)
        });

        users.doc(user.id).update({
            beneficiaryIds: beneficiaryIds
        }).then(function (response) {
            console.log(response);
        });

        botMethods.sendPreferencesUpdatedConfirmationMessage(chatId, 'Beneficiaries', 'reflect your poll choices above.');
    }
}