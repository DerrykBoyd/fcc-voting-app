'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Polls = new Schema({
	ownerID: String,
	pollID: String,
	question: String,
    options: [{
		_id: false,
		title: String,
		votes: Number,
		voters: [{
			id: String,
			ip: String,
		}],
	}]
});

module.exports = mongoose.model('Poll', Polls);
