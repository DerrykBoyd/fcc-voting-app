'use strict';

const express = require('express');
const routes = require('./app/routes/index.js');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we\'re connected!');
});

app.use('/controllers', express.static(`${process.cwd()}/app/controllers`));
app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/common', express.static(`${process.cwd()}/app/common`));
app.use('/bower', express.static(`${process.cwd()}/bower_components`));
app.use(require('serve-static')(`${__dirname}/../../public`));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());

app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

const port = process.env.PORT || 8080;
app.listen(port,  function () {
  console.log(`Node.js listening on port ${port}...`);
});
