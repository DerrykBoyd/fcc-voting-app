'use strict';

var ShortUniqueId = require('short-unique-id');
var uid = new ShortUniqueId();

var fccPollPolls = require('../models/polls.js');
const fccPollVotes = require('../models/votes.js');

function PollHandler () {

	//finds poll by ID passed in param and returns object
	this.getPollData = function (req, res) {
		fccPollPolls.findOne({'pollID': req.params.pollID})
			.exec( function (err, result) {
				if (err) throw err.message;
				res.json(result);
			})
	}

	// returns all polls owned by logged in user (req.userID)
	this.getPolls = function (req, res) {
		fccPollPolls
			.find ({ 'ownerID': req.user.userID })
			.sort ({_id:-1})
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result);
			});
	};

	//returns all polls in database
	this.getAllPolls = function (req, res) {
		fccPollPolls
			.find()
			.sort({_id: -1})
			.exec(function (err, result) {
				if (err) throw err;

				res.json(result)
			})
	}

	//adds a new poll with logged in user as ownerID
	this.addPoll = function (req, res) {
		//create random ID and new instance of poll document
		var pollID = uid.randomUUID(6);
		var newPoll = new fccPollPolls();
		//add poll info to the new document
		newPoll.ownerID = req.user.userID;
		newPoll.pollID = pollID;
		newPoll.question = req.body.question;
		newPoll.options = req.body.options;
		//save the new document to the database
		newPoll.save(function (err, newPoll) {
			if (err) {
				throw err;
			}
		});
		res.send();
	};

	this.deletePoll = function (req, res) {
		fccPollPolls.findOneAndDelete({"pollID":req.query.pollID}, (err, doc) => {
			if (err) console.log(err);
			res.send(doc);
		})
	}

	// get all votes for all polls
	this.getVotes = function (req, res) {
		fccPollVotes.find({}, (err, results) => {
			if (err) console.log(err.message)
			res.send(results)
		})
	}

	this.checkVote = (req, res) => {
		// receives a user object and checks for existing vote - DONE
		// if logged in search db for username and pollID
		if (req.query.user != "none") {
			fccPollVotes.findOne({"pollID": req.query.pollID, "username": req.query.user, "userIP": req.query.userIP}, (err, doc) => {
				if (err) console.log(err.message)
				if(doc) {
					res.send(doc.option)
				} else {
					res.send('not voted yet')
				}
			})
		} else {
			// if not logged in search for IP, username(none), and pollID
			fccPollVotes.findOne({"pollID": req.query.pollID, "username": "none", "userIP": req.query.userIP}, (err, doc) => {
				if (err) console.log(err.message)
				if(doc) {
					res.send(doc.option)
				} else {
					res.send('not voted yet')
				}
			})
		}
	}

	this.addVote = function (req, res) {
		// adds a new vote to the db on radio button change and deletes users old vote - DONE!
		let newVote = {
			"username": req.query.username,
			"userIP": req.query.userIP,
			"pollID": req.params.pollID,
			"option": req.query.option
		}
		//check if user has voted before and remove that vote
		if (req.user) {
			// logged in users, delete all previous votes for this poll
			fccPollVotes.deleteMany({"pollID": newVote.pollID, "username": newVote.username})
			// add the new vote
			.then(fccPollVotes.create(newVote))
			// return all votes
			.then(fccPollVotes.find({}, (err, results) => {
				if (err) console.log(err.message)
				res.send(results)}))
			.catch(err => {
				if (err) console.log(err.message)
				res.status(500).json({ error : err })
			})
		} else {
			// use IP if not logged in
			fccPollVotes.deleteMany({"pollID": newVote.pollID, "userIP": newVote.userIP, "username": "none"})
			// add the new vote
			.then(fccPollVotes.create(newVote))
			// return all votes
			.then(fccPollVotes.find({}, (err, results) => {
				if (err) console.log(err.message)
				res.send(results)}))
			.catch(err => {
				res.status(500).json({ error : err })
			})
		}
	};

	this.addOption = function (req, res) {
		// Adds a new option to the current poll
		let pollID = req.query.pollID;
		let option = req.query.option;
		fccPollPolls.findOneAndUpdate({"pollID": pollID}, {$push: {
			options : {"title": option}}}, (err) => {
				if (err) res.send(err.message)
				else res.send('Option Added')
		})
	}
}

module.exports = PollHandler;
