"use strict"

var express = require('express');
var axios = require('axios');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send("Welcome to the API")
});

/* GET home page. */
router.get('/generateOTP', function(req, res, next) {
  var data = JSON.stringify({"secret":"U2FsdGVkX1+VTlP0So1QxL6tbZmIty6lx41dE0iN09YJTzJwqYwC06FCG90Sw8h7qgJhN+jW+TGYvKPDXOEv0Q==","mobile":"9619127647"});

  var config = {
    method: 'post',
    url: 'https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP',
    headers: { 
      'Content-Type': 'application/json',
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
});

module.exports = router;