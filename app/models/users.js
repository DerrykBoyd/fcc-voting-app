'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fccPollUser = new Schema({
	username: String,
	userID: {type: String, unique: true},
});

module.exports = mongoose.model('fccPollUser', fccPollUser);
