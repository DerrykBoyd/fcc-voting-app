'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fccPollVotes = new Schema({
	username: String,
	userIP: String,
	pollID: String,
	option: String,
});

module.exports = mongoose.model('fccPollVotes', fccPollVotes);
