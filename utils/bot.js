var utilMethods = require("./utils");
var messages = require('./messages');
var userModel = require("./userModel").userModel;
var svgToPng = require('convert-svg-to-png');

function sendInitialMessage (chatId, bot) {
    /*
        Escape the following characters with \\:
        . - ( ) !

        Escape the following characters with \:
        `
    */

    bot.sendMessage(chatId, messages.setupMessages.initialMessage, 
    {
        parse_mode: 'MarkdownV2'
    }).then(function (response) {
        console.log(response);

        // Send phone number message

        bot.sendMessage(chatId, messages.setupMessages.phoneNumberMessage, 
        {
            reply_markup: {
                force_reply: true
            }
        }).then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.error(error);
        })

    }).catch(function (error) {
        console.error(error);
    })
}

function sendVaccinationDateMessage (chatId, bot, isInitialSetup) {
    var vaccinationDateMessage = isInitialSetup ? messages.setupMessages.vaccinationDateMessage : messages.commandMessages.vaccinationDateMessage;

    bot.sendMessage(chatId, vaccinationDateMessage, 
        {
        reply_markup: {
            force_reply: true
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.error(error);
    })
}

function sendVaccinationDoseMessage (chatId, bot, isInitialSetup) {
    var doseMessage = isInitialSetup ? messages.setupMessages.doseMessage : messages.commandMessages.doseMessage;

    bot.sendMessage(chatId, doseMessage, 
        {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "Dose 1", callback_data: JSON.stringify({
                        doseId: 1,
                        bot_command: "/dose",
                        isInitialSetup: isInitialSetup
                    })}, 
                    {text: "Dose 2", callback_data: JSON.stringify({
                        doseId: 2,
                        bot_command: "/dose",
                        isInitialSetup: isInitialSetup
                    })}
                ]
            ]
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.error(error);
    })
}

function sendAgeBracketMessage (chatId, bot, isInitialSetup) {
    var ageMessage = isInitialSetup ? messages.setupMessages.ageMessage : messages.commandMessages.ageMessage;

    bot.sendMessage(chatId, ageMessage, 
        {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "18-44", callback_data: JSON.stringify({
                        minAge: 18,
                        bot_command: "/age",
                        isInitialSetup: isInitialSetup
                    })}, 
                    {text: "45+", callback_data: JSON.stringify({
                        minAge: 45,
                        bot_command: "/age",
                        isInitialSetup: isInitialSetup
                    })}
                ]
            ]
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.error(error);
    })
}

function sendStateSelectionMessage (chatId, bot, isInitialSetup) {
    var stateMessage = isInitialSetup ? messages.setupMessages.stateMessage : messages.commandMessages.stateMessage;

    utilMethods.getStates(function(response) {
        var states = response.states;
        var stateButtonOptions = [];

        states.map(function(state, index) {
            stateButtonOptions.push({ text: state.state_name, callback_data: JSON.stringify({stateId: state.state_id, bot_command: "/state", isInitialSetup: isInitialSetup})})
        });

        stateButtonOptions = utilMethods.createGroups(stateButtonOptions, Math.ceil(stateButtonOptions.length/2))

        bot.sendMessage(chatId, stateMessage, {
        reply_markup: {
            inline_keyboard: stateButtonOptions
        }
        }).then(function(response) {
            console.log(response);
        }).catch(function(error) {
            console.error(error);
        })
    })
}

function sendDistrictSelectionMessage (chatId, stateId, bot, isInitialSetup) {
    var districtMessage = isInitialSetup ? messages.setupMessages.districtMessage : messages.commandMessages.districtMessage;

    utilMethods.getDistricts(stateId, function(response) {
        var districts = response.districts;
        var districtButtonOptions = []
    
        districts.map(function(district, index) {
            districtButtonOptions.push({ 
                text: district.district_name, 
                callback_data: JSON.stringify({
                    districtId: district.district_id, 
                    bot_command: "/district", 
                    isInitial: isInitialSetup
                })
            })
        });
  
        districtButtonOptions = utilMethods.createGroups(districtButtonOptions, Math.ceil(districtButtonOptions.length/2))
  
        bot.sendMessage(chatId, districtMessage, {
          reply_markup: {
            inline_keyboard: districtButtonOptions
          }
        }).then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.error(error);
        })
    })
}

function sendPreferredVaccineMessage (chatId, bot, users, isInitialSetup) {
    var preferredVaccineMessage = isInitialSetup ? messages.setupMessages.preferredVaccineMessage : messages.commandMessages.preferredVaccineMessage;

    bot.sendPoll(chatId, preferredVaccineMessage, messages.preferredVaccines, {
        is_anonymous: false,
        allows_multiple_answers: true
    }).then(function(response) {
        var pollId = response.poll.id;

        if (isInitialSetup) {
            users.doc(chatId.toString()).update({
                initialSetupPreferredVaccinesPollId: pollId
            }).then(function(response) {
                console.log(response);
            });
        } else {
            users.doc(chatId.toString()).update({
                updatedPreferredVaccinesPollId: pollId
            }).then(function(response) {
                console.log(response);
            });
        }

        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendBeneficiaryOTPMessage (chatId, phoneNumber, bot, isInitialSetup, callback) {
    var beneficiariesOtpMessage = isInitialSetup ? messages.setupMessages.beneficiariesOtpMessage : messages.commandMessages.beneficiariesOtpMessage;

    utilMethods.generateOTP(phoneNumber, function (response) {
        callback(response.txnId);
    });

    bot.sendMessage(chatId, beneficiariesOtpMessage, {
    reply_markup: {
        force_reply: true
    }
    }).then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendBookingOTPMessage (chatId, phoneNumber, bot, callback) {
    utilMethods.generateOTP(phoneNumber, function (response) {
        callback(response.txnId);
    });

    bot.sendMessage(chatId, messages.bookingOtpMessage, {
    reply_markup: {
        force_reply: true
    }
    }).then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendBeneficiariesMessage (chatId, otp, txnId, bot, isInitialSetup, users) {
    var beneficiariesMessage = isInitialSetup ? messages.setupMessages.beneficiariesMessage : messages.commandMessages.beneficiariesMessage;

    utilMethods.validateOTP(otp, txnId, function (response) {
        var token = response.token;

        users.doc(chatId.toString()).update({
            token: token
        }).then(function(response) {
            console.log(response);
        });

        utilMethods.getBeneficiaries(token, function (beneficiariesResponse) {
            var beneficiaries = beneficiariesResponse.beneficiaries;

            users.doc(chatId.toString()).update({
                allBeneficiaries: beneficiaries
            }).then(function(response) {
                console.log(response);
            });

            var beneficiariesPollOptions = []

            beneficiaries.map(function(beneficiary) {
                beneficiariesPollOptions.push(beneficiary.name);
            })

            bot.sendPoll(chatId, beneficiariesMessage, beneficiariesPollOptions, {
                is_anonymous: false,
                allows_multiple_answers: true
            }).then(function(response) {
                var pollId = response.poll.id;

                if (isInitialSetup) {
                    users.doc(chatId.toString()).update({
                        initialSetupBeneficiariesPollId: pollId
                    }).then(function(response) {
                        console.log(response);
                    });
                } else {
                    users.doc(chatId.toString()).update({
                        updatedBeneficiariesPollId: pollId
                    }).then(function(response) {
                        console.log(response);
                    });
                }

                console.log(response);
            }).catch(function(error) {
                console.error(error);
            })
        });
    });
}

function sendCaptcha(chatId, userToken, bot) {
    utilMethods.getCaptcha(userToken, function(response) {
        var captcha = response.captcha;
        svgToPng.convert(captcha).then(function(response) {
            bot.sendPhoto(chatId, response)
            .then(function(response) {
                console.log(response);
            }).catch(function(error) {
                console.error(error);
            })
        })
    })
} 

function sendSetupCompleteMessage(chatId, bot) {
    bot.sendMessage(chatId, messages.setupMessages.setupCompleteMessage)
    .then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
} 

module.exports = {
    sendInitialMessage,
    sendVaccinationDateMessage,
    sendVaccinationDoseMessage,
    sendAgeBracketMessage,
    sendStateSelectionMessage,
    sendDistrictSelectionMessage,
    sendPreferredVaccineMessage,
    sendBeneficiaryOTPMessage,
    sendBookingOTPMessage,
    sendBeneficiariesMessage,
    sendCaptcha,
    sendSetupCompleteMessage
}