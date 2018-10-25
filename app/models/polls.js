'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fccPollPolls = new Schema({
	ownerID: String,
	pollID: String,
	question: String,
    options: [{
		_id: false,
		title: String,
	}],
});

module.exports = mongoose.model('fccPollPolls', fccPollPolls);
