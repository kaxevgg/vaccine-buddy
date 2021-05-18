const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  linkUrl: String,
  domain: String,
  flaggedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  isSuspicious: Boolean,
  comment: String
}, { timestamps: true });

const Flag = mongoose.model('Flag', flagSchema);

module.exports = Flag;