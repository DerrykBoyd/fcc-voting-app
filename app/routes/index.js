'use strict';

var path = process.cwd();
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');

var pollHandler = new PollHandler();

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	function checkLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.json({error: 'Not logged in'});
		}
	}

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/poll/:poll')
		.get(function (req, res) {
			res.sendFile(path + '/public/poll.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		})
		.post(passport.authenticate('local', {
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true
		}));

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/api/:id')
		.get(checkLoggedIn, function (req, res) {
			res.json(req.user);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/google')
		.get(passport.authenticate('google', {
			scope: ['email']
		}));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/auth/google/callback')
		.get(passport.authenticate('google', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/polls/:poll')
		.post(pollHandler.addPoll)
		.get(pollHandler.getAllPolls)

	app.route('/api/:id/polls')
		.get(isLoggedIn, pollHandler.getPolls)

	app.route('/api/pollData/:poll')
		.get(pollHandler.getPollData)
};
