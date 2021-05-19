module.exports = function generateOTP(mobile) {
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
        console.log(response.body);
        return response.body;
    });
}

module.exports = function hey() {
    console.log("UTILS hello");
    return true
}