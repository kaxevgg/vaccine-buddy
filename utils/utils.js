var request = require('request');
var crypto = require('crypto');

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
            "secret": "U2FsdGVkX1+VTlP0So1QxL6tbZmIty6lx41dE0iN09YJTzJwqYwC06FCG90Sw8h7qgJhN+jW+TGYvKPDXOEv0Q==",
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
            'Content-Type': 'application/json'
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
            'Authorization': `Bearer ${userToken}`
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
            'Content-Type': 'application/json'
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
            'Content-Type': 'application/json'
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

function searchSlots(user, callback) {
    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${user.districtId}&date=${user.vaccinationDate}`,
        'headers': {
            'Content-Type': 'application/json'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        var centers = JSON.parse(response.body).centers;

        var slotFound = false;

        for (i in centers) {
            center = centers[i];
            for (j in center.sessions) {
                session = center.sessions[j];

                if (user.dose == 1) {
                    if (!slotFound && session.available_capacity_dose1 > 0 && session.min_age_limit == user.minAge && user.preferredVaccines.includes(session.vaccine)) {
                        console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

                        slotFound = true;
    
                        data = {
                            center_id: center.center_id,
                            session_id: session.session_id,
                            dose: user.dose,
                            slot: session.slots[0],
                            beneficiaries: user.beneficiaryIds
                        }
    
                        callback({
                            success: true,
                            message: "Slot Found!",
                            data: data,
                            session: session
                        });
                    }
                } else if (user.dose == 2) {
                    if (!slotFound && session.available_capacity_dose2 > 0 && session.min_age_limit == user.minAge && user.preferredVaccines.includes(session.vaccine)) {
                        console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

                        slotFound = true;
    
                        data = {
                            center_id: center.center_id,
                            session_id: session.session_id,
                            dose: user.dose,
                            slot: session.slots[0],
                            beneficiaries: user.beneficiaryIds
                        }
    
                        callback({
                            success: true,
                            message: "Slot Found!",
                            data: data,
                            session: session
                        });
                    }
                }
            }
        }

        if (!slotFound) {
            callback({
                success: false,
                message: "No Slots Found!"
            })
        }
    });
}

function bookSlot(slotData, userToken, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        'body': JSON.stringify(slotData)
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body));
    });
}

function downloadAppointmentPDF (appointmentId, userToken, callback) {
    // https://cdn-api.co-vin.in/api/v2/appointment/appointmentslip/download?appointment_id=22573087-c993-41e2-b9b1-b37992c1188a

    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/appointment/appointmentslip/download?appointment_id=${appointmentId}`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(response.body);
    });
}

/***
 * @description - Generates CAPTCHA Code for authentication
 * @param userToken - Authentication token for current user 
 * @function callback - Callback function for storing response
 */

function getCaptcha(userToken, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body))
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
    getCaptcha
}