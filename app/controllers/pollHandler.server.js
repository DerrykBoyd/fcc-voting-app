'use strict';

var ShortUniqueId = require('short-unique-id');
var uid = new ShortUniqueId();

var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollHandler () {

	this.getPollData = function (req, res) {
		console.log(req);
		Polls.findOne({'pollID': req.params.poll})
			.exec( function (err, result) {
				if (err) throw err;
				res.json(result);
			})
	}

	this.getPolls = function (req, res) {
		Polls
			.find ({ 'ownerID': req.user.userID })
			.sort ({_id:-1})
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result);
			});
	};

	this.getAllPolls = function (req, res) {
		Polls
			.find()
			.sort({_id: -1})
			.exec(function (err, result) {
				if (err) throw err;

				res.json(result)
			})
	}

	this.addPoll = function (req, res) {

		var pollID = uid.randomUUID(6);
		var newPoll = new Polls();

		newPoll.ownerID = req.user.userID;
		newPoll.pollID = pollID;
		newPoll.question = req.body.question;
		newPoll.options = req.body.options;

		newPoll.save(function (err, newPoll) {
			if (err) {
				throw err;
			}
		});

		res.send();
		
	};

	this.addVote = function (req, res) {
		var title = req.title;
		Polls
			.findOneAndUpdate({ 'pollID': req.pollID }, (
				{'options.title': title},
				{$inc: {
					'options.$.votes': 1
				}}
			)
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.options);
				}
			));
	};

}

module.exports = PollHandler;
