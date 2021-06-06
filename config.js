const TelegramBot = require('node-telegram-bot-api');
var firebase = require("firebase-admin");

// Telegram Token
const telegramToken = '1808569609:AAFd-x__o0pNFjMv20QsW9VCosDLfg_H5YY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken, {polling: true});

// Configure Firebase Cloudstore Database
var serviceAccount = require("./firestore-certificate.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

// Get database
var db = firebase.firestore();
var users = db.collection('users');
var allowedUsers = db.collection('allowedUsers');

module.exports = {
    bot: bot,
    users: users,
    allowedUsers: allowedUsers
}