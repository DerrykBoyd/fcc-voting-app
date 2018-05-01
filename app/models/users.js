'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	username: String,
	userID: {type: String, unique: true},
});

module.exports = mongoose.model('User', User);
