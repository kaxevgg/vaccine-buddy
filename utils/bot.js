var utilMethods = require("./utils");
var messages = require('./messages').messages;
var userModel = require("./userModel").userModel;
var svgToPng = require('convert-svg-to-png');

function sendInitialMessage (chatId, bot) {
    /*
        Escape the following characters with \\:
        . - ( ) !

        Escape the following characters with \:
        `
    */

    bot.sendMessage(chatId, messages.initialMessage, 
    {
        parse_mode: 'MarkdownV2'
    }).then(function (response) {
        console.log(response);

        // Send phone nummber message

        bot.sendMessage(chatId, messages.phoneNumberMessage, 
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

function sendVaccinationDateMessage (chatId, bot) {
    bot.sendMessage(chatId, messages.vaccinationDateMessage, 
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

function sendVaccinationDoseMessage (chatId, bot) {
    bot.sendMessage(chatId, messages.doseMessage, 
        {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "Dose 1", callback_data: JSON.stringify({
                        doseId: 1,
                        bot_command: "/dose"
                    })}, 
                    {text: "Dose 2", callback_data: JSON.stringify({
                        doseId: 2,
                        bot_command: "/dose"
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

function sendAgeBracketMessage (chatId, bot) {
    bot.sendMessage(chatId, messages.ageMessage, 
        {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "18-44", callback_data: JSON.stringify({
                        minAge: 18,
                        bot_command: "/age"
                    })}, 
                    {text: "45+", callback_data: JSON.stringify({
                        minAge: 45,
                        bot_command: "/age"
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

function sendStateSelectionMessage (chatId, bot) {
    utilMethods.getStates(function(response) {
        var states = response.states;
        var stateButtonOptions = [];

        states.map(function(state, index) {
            stateButtonOptions.push({ text: state.state_name, callback_data: JSON.stringify({stateId: state.state_id, bot_command: "/state"})})
        });

        stateButtonOptions = utilMethods.createGroups(stateButtonOptions, Math.ceil(stateButtonOptions.length/2))

        bot.sendMessage(chatId, messages.stateMessage, {
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

function sendDistrictSelectionMessage (chatId, stateId, bot) {
    utilMethods.getDistricts(stateId, function(response) {
        var districts = response.districts;
        var districtButtonOptions = []
    
        districts.map(function(district, index) {
          districtButtonOptions.push({ text: district.district_name, callback_data: JSON.stringify({districtId: district.district_id, bot_command: "/district"})})
        });
  
        districtButtonOptions = utilMethods.createGroups(districtButtonOptions, Math.ceil(districtButtonOptions.length/2))
  
        bot.sendMessage(chatId, messages.districtMessage, {
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

function sendPreferredVaccineMessage (chatId, bot) {
    bot.sendPoll(chatId, messages.preferredVaccineMessage, messages.preferredVaccines, {
        is_anonymous: false,
        allows_multiple_answers: true
    }).then(function(response) {
        var pollId = response.poll.id;
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendOTPMessage (chatId, phoneNumber, bot, callback) {
    utilMethods.generateOTP(phoneNumber, function (response) {
        callback(response.txnId);
    });

    bot.sendMessage(chatId, messages.otpMessage, {
    reply_markup: {
        force_reply: true
    }
    }).then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendBeneficiariesMessage (chatId, otp, txnId, bot) {
    utilMethods.validateOTP(otp, txnId, function (response) {
        var token = response.token;

        userModel.userToken = token;

        utilMethods.getBeneficiaries(token, function (beneficiariesResponse) {
            var beneficiaries = beneficiariesResponse.beneficiaries;

            userModel.beneficiaries = beneficiaries;

            var beneficiariesPollOptions = []

            beneficiaries.map(function(beneficiary) {
                beneficiariesPollOptions.push(beneficiary.name);
            })

            bot.sendPoll(chatId, messages.beneficiariesMessage, beneficiariesPollOptions, {
                is_anonymous: false,
                allows_multiple_answers: true
            }).then(function(response) {
                var pollId = response.poll.id;
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

module.exports = {
    sendInitialMessage,
    sendVaccinationDateMessage,
    sendVaccinationDoseMessage,
    sendAgeBracketMessage,
    sendStateSelectionMessage,
    sendDistrictSelectionMessage,
    sendPreferredVaccineMessage,
    sendOTPMessage,
    sendBeneficiariesMessage,
    sendCaptcha
}