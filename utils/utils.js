var request = require('request');

// Util functions

function createGroups(arr, numGroups) {
    const perGroup = Math.ceil(arr.length / numGroups);
    return new Array(numGroups)
        .fill('')
        .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
}

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
        // console.log(response.body)
        // console.log(typeof response.body)
        // console.log(JSON.parse(response.body).txnId);
        callback(JSON.parse(response.body))
    });
}

function validateOTP(otp, txnId, callback) {
    var options = {
        'method': 'POST',
        'url': 'https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "otp": otp,
            "txnId": txnId
        })

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        callback(JSON.parse(response.body));
    });
}

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