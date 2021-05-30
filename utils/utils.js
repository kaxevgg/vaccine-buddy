var request = require('request');
var crypto = require('crypto');
var bot = require("../config").bot;
var users = require("../config").users;
var svgToPng = require('convert-svg-to-png');
var messages = require("./messages");

// Util functions

/***
 * @description - Splits array into sub-arrays
 * @param arr - Input Array
 * @param numGroups - Number of sub-arrays to split array into
 */

function createGroups(arr, numGroups) {
    const perGroup = Math.ceil(arr.length / numGroups);
    return new Array(numGroups)
        .fill('')
        .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
}

/***
 * @description - Generates Mobile OTP
 * @param mobile - Mobile number of user
 * @function callback - Callback function for storing response
 */

function generateOTP(mobile, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "secret": "U2FsdGVkX19dS0NTa5FVqCDeEBGQq9PY+Ximiwih6A07Cit81yEl+gfjm5Chv7BJqIk0ehM3B07f64UEnIQGsQ==",
            "mobile": mobile
        })
    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body))
    });
}

/***
 * @description - Validates Mobile OTP for authentication of user
 * @param otp - Plaintext OTP entered by user
 * @function callback - Callback function for storing response
 */

function validateOTP(otp, txnId, callback) {
    var hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp',
        'headers': {
            'Content-Type': 'application/json',
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
        body: JSON.stringify({
            "otp": hashedOtp,
            "txnId": txnId
        })

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body));
    });
}

/***
 * @description - Gets list of beneficiaries currently registered on user's Cowin account
 * @param userToken - Authentication token for current user 
 * @function callback - Callback function for storing response
 */

function getBeneficiaries(userToken, callback) {
    var options = {
        'method': 'GET',
        'url': 'https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body))
    });
}

/***
 * @description - Gets list of States and State IDs from Cowin API
 * @function callback - Callback function for storing response
 */

function getStates(callback) {
    var options = {
        'method': 'GET',
        'url': 'https://cdn-api.co-vin.in/api/v2/admin/location/states',
        'headers': {
            'Content-Type': 'application/json',
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body))
    });
}

/***
 * @description - Gets list of Districts and District IDs from Cowin API
 * @param stateId - Identifier for user's selected state
 * @function callback - Callback function for storing response
 */

function getDistricts(stateId, callback) {
    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`,
        'headers': {
            'Content-Type': 'application/json',
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body))
    });
}

/***
 * @description - Gets list of available vaccine slots
 * @param districtId - Identifier for user's selected district
 * @param vaccine_date - Vaccination date selected by the user
 * @function callback - Callback function for storing response
 */

function searchSlots(chatId, user, trialNumber, messageId) {
    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${user.districtId}&date=${user.vaccinationDate}`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
    };
    request(options, function (error, response) {
        if (error || response.body == 'Unauthenticated access!') {
            console.error(error);

            bot.sendMessage(chatId, "Your authentication has expired. Kindly press /book to regenerate OTP")
            .then(function(response) {
                // console.log(response);
            }).catch (function (error) {
                console.error(error);
            });
        } else {
            var centers = JSON.parse(response.body).centers;
            var trials = trialNumber;
            var slotFound = false;
            var slotData;
            var sessionDetails;
            var centerDetails;

            for (i in centers) {
                center = centers[i];
                for (j in center.sessions) {
                    session = center.sessions[j];

                    if (parseInt(user.dose) == 1) {
                        if (!slotFound && session.available_capacity_dose1 >= user.beneficiaryIds.length && session.min_age_limit == parseInt(user.minAge) && user.preferredVaccines.includes(session.vaccine)) {
                            console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

                            slotFound = true;
        
                            slotData = {
                                center_id: center.center_id,
                                session_id: session.session_id,
                                dose: parseInt(user.dose),
                                slot: session.slots[0],
                                beneficiaries: user.beneficiaryIds,
                                captcha: user.captcha
                            }
        
                            sessionDetails = session;
                            centerDetails = center;
                        }
                    } else if (parseInt(user.dose) == 2) {
                        if (!slotFound && session.available_capacity_dose2 >= user.beneficiaryIds.length && session.min_age_limit == parseInt(user.minAge) && user.preferredVaccines.includes(session.vaccine)) {
                            console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

                            slotFound = true;
        
                            slotData = {
                                center_id: center.center_id,
                                session_id: session.session_id,
                                dose: parseInt(user.dose),
                                slot: session.slots[0],
                                beneficiaries: user.beneficiaryIds,
                                captcha: user.captcha
                            }
        
                            sessionDetails = session;
                            centerDetails = center;
                        }
                    }
                }
            }

            if (!slotFound) {
                console.log(`Check No: ${trials}`)
                trials += 1;

                if (trials <= 200) {
                    if (messageId == null) {
                        bot.sendMessage(chatId, `No slots found! Searching again . . . (Attempt ${trials - 1})`)
                        .then(function(response) {
                            // console.log(response);
                            console.log("No slots found. Searching again . . .");
    
                            setTimeout(function() {
                                searchSlots(chatId, user, trials, response.message_id);
                            }, 5000);
                        }).catch (function (error) {
                            console.error(error);
                        });
                    } else {
                        bot.editMessageText(`No slots found! Searching again . . . (Attempt ${trials - 1})`, {
                            message_id: messageId,
                            chat_id: chatId 
                        }).then(function(response) {

                            console.log("No slots found. Searching again . . .");

                            setTimeout(function() {
                                searchSlots(chatId, user, trials, response.message_id);
                            }, 5000);
                        }).catch(function(error) {
                            console.error(error);
                        })
                    }
                } else {
                    bot.sendMessage(chatId, "No slots found. Try again later.")
                    
                    console.log("No slots found. Try again later.");
                }
            } else {
                users.doc(chatId.toString()).update({
                    availableSlot: slotData,
                    availableSessionDetails: sessionDetails,
                    availableCenterDetails: centerDetails
                }).then(function(response) {
                    console.log(response);

                    initiateBookingSlot(chatId);
                });
            }
        }
    });
}

function initiateBookingSlot(chatId) {
    users.doc(chatId.toString()).get().then(function(response) {
        if (!response.exists) {
            console.error("No user found")
        } else {
            var slotData = response.data().availableSlot;

            bookSlot(slotData, response.data().token, function(bookingResponse) {
                if ('appointment_confirmation_no' in JSON.parse(bookingResponse.body)) {
                    var bookingConfirmationMessage = `Hooray! Your appointment has been scheduled at ${response.data().availableCenterDetails.name} in ${response.data().availableCenterDetails.district_name} on ${response.data().availableSessionDetails.date} at ${response.data().availableSlot.slot}. Please check the Cowin Website for further details.`

                    bot.sendMessage(chatId, bookingConfirmationMessage)
                    .then(function(response) {
                        console.log(response);
                    }).catch(function(error) {
                        console.error(error);
                    });

                    users.doc(chatId.toString()).update({
                        appointmentId: JSON.parse(bookingResponse.body).appointment_confirmation_no
                    }).then(function(response) {
                        console.log(response);
                    });
                } else if (bookingResponse == 'Unauthenticated access!') {
                    console.log("Unauthenticated access");

                    bot.sendMessage(chatId, "Your authentication has expired. Kindly press /book to regenerate OTP")
                    .then(function(response) {
                        // console.log(response);
                    }).catch (function (error) {
                        console.error(error);
                    });
                } else {
                    bot.sendMessage(chatId, messages.commandMessages.bookingErrorMessage)
                    .then(function(response) {
                        console.log(response);
                    }).catch(function(error) {
                        console.error(error);
                    });

                    searchSlots(chatId, response.data(), 1, null)
                }
            })
        }
    })
}

function bookSlot(slotData, userToken, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
        'body': JSON.stringify(slotData)
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response);
        callback(response);
    });
}

function downloadAppointmentPDF (appointmentId, userToken, callback) {
    // https://cdn-api.co-vin.in/api/v2/appointment/appointmentslip/download?appointment_id=22573087-c993-41e2-b9b1-b37992c1188a

    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/appointment/appointmentslip/download?appointment_id=${appointmentId}`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
            'Origin': 'https://selfregistration.cowin.gov.in'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(response.body);
    });
}

/***
 * @description - Sends captcha image to user to complete appointment booking
 * @param chatId - Identifier for current chat
 * @param userToken - Authentication token for current user
 * @param bot - Instance of Telegram bot
 */

 function sendCaptcha(chatId, userToken) {
    getCaptcha(chatId, userToken, function(response) {
        if (!response.error) {
            var captcha = response.captchaData.captcha;
            svgToPng.convert(captcha).then(function(responseCaptcha) {
                bot.sendPhoto(chatId, responseCaptcha, {
                    caption: messages.commandMessages.captchaMessage,
                    reply_markup: {
                        force_reply: true
                    }
                })
                .then(function(response) {
                    console.log(response);
                }).catch(function(error) {
                    console.error(error);
                })
            })
        }
    })
} 

/***
 * @description - Generates CAPTCHA Code for authentication
 * @param userToken - Authentication token for current user 
 * @function callback - Callback function for storing response
 */

function getCaptcha(chatId, userToken, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
            'Origin': 'https://selfregistration.cowin.gov.in'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (response.body == 'Unauthenticated access!') {
            bot.sendMessage(chatId, "Your authentication has expired. Kindly press /book to regenerate OTP")
            .then(function(response) {
                console.log(response);
            }).catch (function (error) {
                console.error(error);
            });
            callback({error: true})
        } else {
            console.log(response);
            callback({error: false, captchaData: JSON.parse(response.body)})
        }
    });
}

module.exports = {
    createGroups,
    generateOTP,
    validateOTP,
    getBeneficiaries,
    getStates,
    getDistricts,
    searchSlots,
    bookSlot,
    downloadAppointmentPDF,
    sendCaptcha,
    getCaptcha
}