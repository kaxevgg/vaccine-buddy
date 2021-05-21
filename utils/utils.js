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

function searchSlots(districtId, vaccine_date, callback) {
    var options = {
        'method': 'GET',
        'url': `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${vaccine_date}`,
        'headers': {
            'Content-Type': 'application/json'
        },
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        var centers = JSON.parse(response.body).centers;

        for (i in centers) {
            center = centers[i];
            for (j in center.sessions) {
                session = center.sessions[j];

                if (session.min_age_limit == req.body.age) {
                    console.log("Vaccines available at : ", center.pincode, center.name, center.center_id, session.available_capacity);

                    data = {
                        center_id: center.center_id,
                        session_id: session.session_id,
                        dose: 1,
                        slot: session.slots[0],
                        beneficiaries: []
                    }

                    callback({
                        message: "Slot Found!",
                        data: data
                    });
                }
            }
        }
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
    getCaptcha
}