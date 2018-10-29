'use strict';

const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fccPollUser = require('../models/users');
const configAuth = require('./auth');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    fccPollUser.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy ({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL
  },
  function (token, refreshToken, profile, done) {
    // console.log(profile);
    process.nextTick(function () {
      fccPollUser.findOne({ 'userID': profile.id }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(null, user);
        } else {
          let newUser = new fccPollUser();

          newUser.userID = profile.id;
          newUser.username = profile.displayName;

          newUser.save(function (err) {
            if (err) {
              throw err;
            }

            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL
  },
  function (token, refreshToken, profile, done) {
    // console.log(profile);
    process.nextTick(function () {
      fccPollUser.findOne({ 'userID': profile.id }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(null, user);
        } else {
          let newUser = new fccPollUser();

          newUser.username = profile.username;
          newUser.userID = profile.id;

          newUser.save(function (err) {
            if (err) {
              throw err;
            }

            return done(null, newUser);
          });
        }
      });
    });
  }));
};
