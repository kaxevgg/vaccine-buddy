var utilMethods = require("./utils");
var messages = require('./messages').messages;
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

function sendStateSelectionMessage (chatId, bot) {
    utilMethods.getStates(function(response) {
        var states = response.states;
        var stateButtonOptions = [];

        states.map(function(state, index) {
            stateButtonOptions.push({ text: state.state_name, callback_data: JSON.stringify({state_id: state.state_id, bot_command: "/state"})})
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
          districtButtonOptions.push({ text: district.district_name, callback_data: JSON.stringify({district_id: district.district_id, bot_command: "/district"})})
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
    sendStateSelectionMessage,
    sendDistrictSelectionMessage,
    sendCaptcha
}