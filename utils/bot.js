var utilMethods = require("./utils");
var messages = require('./messages');
var bot = require("../config").bot;
var users = require("../config").users;

/***
 * @description - Sends initial greeting message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 */

function sendInitialMessage (chatId) {
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
        sendPhoneNumberMessage(chatId);

    }).catch(function (error) {
        console.error(error);
    })
}

function sendPhoneNumberMessage (chatId) {
    bot.sendMessage(chatId, messages.setupMessages.phoneNumberMessage, {
        reply_markup: {
            force_reply: true
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.error(error);
    })
}

/***
 * @description - Sends vaccination date message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendVaccinationDateMessage (chatId, isInitialSetup) {
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

/***
 * @description - Sends vaccination date dose number to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendVaccinationDoseMessage (chatId, isInitialSetup) {
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

/***
 * @description - Sends age bracket message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendAgeBracketMessage (chatId, isInitialSetup) {
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

/***
 * @description - Sends age bracket message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

 function sendCostSelectionMessage (chatId, isInitialSetup) {
    var costMessage = isInitialSetup ? messages.setupMessages.costMessage : messages.commandMessages.costMessage;

    bot.sendMessage(chatId, costMessage, 
        {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "Free", callback_data: JSON.stringify({
                        cost: "Free",
                        bot_command: "/cost",
                        isInitialSetup: isInitialSetup
                    })}, 
                    {text: "Paid", callback_data: JSON.stringify({
                        cost: "Paid",
                        bot_command: "/cost",
                        isInitialSetup: isInitialSetup
                    })},
                    {text: "Both", callback_data: JSON.stringify({
                        cost: "Both",
                        bot_command: "/cost",
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


/***
 * @description - Sends state message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendStateSelectionMessage (chatId, isInitialSetup) {
    var stateMessage = isInitialSetup ? messages.setupMessages.stateMessage : messages.commandMessages.stateMessage;

    utilMethods.getStates(function(response) {
        var states = response.states;
        var stateButtonOptions = [];

        states.map(function(state, index) {
            stateButtonOptions.push({ 
                text: state.state_name, 
                callback_data: JSON.stringify({
                    stateId: state.state_id, 
                    bot_command: "/state", 
                    isInitialSetup: isInitialSetup
                })
            })
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

/***
 * @description - Sends district message to user
 * @param chatId - Identifier for current chat
 * @param stateId - Identifier for user's selected state
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendDistrictSelectionMessage (chatId, stateId, isInitialSetup) {
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

/***
 * @description - Sends preferred vaccine message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 * @param users - Instance of firestore collection 'users'
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendPreferredVaccineMessage (chatId, isInitialSetup) {
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

/***
 * @description - Sends beneficiary OTP message to user
 * @param chatId - Identifier for current chat
 * @param phoneNumber - Phone number of current user
 * @param bot - Instance of Telegram bot
 * @param isInitialSetup - Boolean for whether initial setup flow
 * @function callback - Callback function for storing response
 */

function sendBeneficiaryOTPMessage (chatId, phoneNumber, isInitialSetup) {
    var beneficiariesOtpMessage = isInitialSetup ? messages.setupMessages.beneficiariesOtpMessage : messages.commandMessages.beneficiariesOtpMessage;

    utilMethods.generateOTP(phoneNumber, function (response) {
        var txnId = response.txnId;
    
        users.doc(chatId.toString()).update({
            txnId: txnId
        }).then(function(response) {
            console.log(response);
        });
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

/***
 * @description - Sends booking OTP message to user
 * @param chatId - Identifier for current chat
 * @param phoneNumber - Phone number of current user
 * @param bot - Instance of Telegram bot
 * @function callback - Callback function for storing response
 */

function sendBookingOTPMessage (chatId, phoneNumber) {
    utilMethods.generateOTP(phoneNumber, function (response) {
        var txnId = response.txnId;
    
        users.doc(chatId.toString()).update({
            txnId: txnId
        }).then(function(response) {
        console.log(response);
        });
    });

    bot.sendMessage(chatId, messages.commandMessages.bookingOtpMessage, {
    reply_markup: {
        force_reply: true
    }
    }).then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

/***
 * @description - Sends beneficiary selection message to user
 * @param chatId - Identifier for current chat
 * @param otp - OTP entered by user
 * @param isInitialSetup - Boolean for whether initial setup flow
 */

function sendBeneficiariesMessage (chatId, otp, isInitialSetup) {
    var beneficiariesMessage = isInitialSetup ? messages.setupMessages.beneficiariesMessage : messages.commandMessages.beneficiariesMessage;

    users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
            console.error("No user found")
        } else {
            var txnId = response.data().txnId;

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
        
                    if (beneficiariesPollOptions.length > 1) {
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
                    } else if (beneficiariesPollOptions.length == 1) {
                        var beneficiaryIds = [];

                        beneficiaries.map(function(beneficiary) {
                            beneficiaryIds.push(beneficiary.beneficiary_reference_id)
                        })

                        users.doc(chatId.toString()).update({
                            beneficiaryIds: beneficiaryIds
                        }).then(function(response) {
                            console.log(response);
                        });
                    }
                });
            });
        }
    });
}

function searchSlots(chatId, otp) {
    users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
            console.error("No user found")
        } else {
            var user = response.data();

            utilMethods.validateOTP(otp, user.txnId, function (response) {
                var token = response.token;
        
                users.doc(chatId.toString()).update({
                    token: token
                }).then(function(response) {
                    console.log(response);
                    
                    users.doc(chatId.toString()).get().then(function (updatedResponse) {
                        if (!updatedResponse.exists) {
                            console.error("No user found")
                        } else {
                            utilMethods.searchSlots(chatId, updatedResponse.data(), 1, null)
                        }
                    });
                });
            })
        }
    })
} 

/***
 * @description - Sends initial setup completion message to user
 * @param chatId - Identifier for current chat
 * @param bot - Instance of Telegram bot
 */

function sendSetupCompleteMessage(chatId) {
    bot.sendMessage(chatId, messages.setupMessages.setupCompleteMessage)
    .then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
} 

function sendPreferencesUpdatedConfirmationMessage (chatId, preferenceName, updatedPreferenceValue) {
    bot.sendMessage(chatId, `${preferenceName} has been successfully updated to ${updatedPreferenceValue}`)
    .then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendErrorMessage (chatId, errorMessage, callback) {
    bot.sendMessage(chatId, errorMessage)
    .then(function(response) {
        console.log(response);
        callback(response);
    }).catch(function(error) {
        console.error(error);
    })
}

function sendUnauthorizedMessage(chatId) {
    bot.sendMessage(chatId, "You do not have access to this bot. Kindly reach out to Arpit Bansal (@arpitbansal3) to get access.")
    .then(function(response) {
        console.log(response);
    }).catch(function(error) {
        console.error(error);
    })
}

module.exports = {
    sendInitialMessage,
    sendPhoneNumberMessage,
    sendVaccinationDateMessage,
    sendVaccinationDoseMessage,
    sendAgeBracketMessage,
    sendCostSelectionMessage,
    sendStateSelectionMessage,
    sendDistrictSelectionMessage,
    sendPreferredVaccineMessage,
    sendBeneficiaryOTPMessage,
    sendBookingOTPMessage,
    sendBeneficiariesMessage,
    searchSlots,
    sendSetupCompleteMessage,
    sendPreferencesUpdatedConfirmationMessage,
    sendErrorMessage,
    sendUnauthorizedMessage
}