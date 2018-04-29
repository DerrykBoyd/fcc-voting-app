'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	username: String,
	userID: String,
    nbrClicks: {
      	clicks: Number
   }
});

module.exports = mongoose.model('User', User);
