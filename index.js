'use strict';
const helmet = require('helmet');
const express = require('express');
var cors = require('cors');
const app = express();
module.exports = app;
const bodyParser = require('body-parser');
const authMiddleware = require('./utils/auth');
const log = require('./utils/logger');
const core = require('./api/internal/core');
let path = require('path');
let db = require('./db/database_mongo');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { MONGODB_URL, MONGODB_NAME } = process.env;
const passport = require('passport');
require('./passport_init');

const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'https://arrange.space'];

const sessionStore = new MongoDBStore({
  uri: `mongodb://${MONGODB_URL}`,
  databaseName: MONGODB_NAME,
  collection: 'expressSessions'
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  function (req, res, next) {
    if (req.session.bounceTo) { // already have a bounce destination
      return next();
    } else {
      if (req.query['bounce']) {
        req.session.bounceTo = req.query['bounce'];
      } else { // no explicit destination, use referer or homepage
        req.session.bounceTo = req.header('Referer') || '/';
      }
      return next();
    };
  },
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'back' }),
  function (req, res) {
    core.log(`User authenticated ${req.user.googleId}`);
    res.redirect(req.session.bounceTo || '/');
    delete req.session.bounceTo;
  });

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(log.requestLogger);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Add some security-related headers to the response
app.use(helmet());
app.use(authMiddleware);
app.use(express.static('doc'));

// Import routes here
require('./routes/session_routes')(app);
require('./routes/user_routes')(app);
require('./routes/arrangement_routes')(app);
require('./routes/health_routes')(app);

app.get('/docs', (request, response) => {
  response.sendFile(path.join(__dirname, '/doc/index.html'));
});

// Add error logger after all middleware and routes
app.use(log.errorLogger);

const port = process.env.PORT || 3000;
app.on('ready', function () {
  app.listen(port, function () {
    core.log(`Server listening on port ${port}!`);
    app.emit('started');
  });
});

db.connect();
