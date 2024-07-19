const express = require('express');
const compress = require('compression');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('../routes/v1');
const methodOverride = require('method-override');
const helmet = require('helmet');
const error = require('../middlewares/error');
const { getImage } = require('../utils/file');
const passport = require('passport');
const strategies = require('./passport');

app.use(cors());
app.use(methodOverride());
app.use(compress());

app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use('/images', express.static('uploads/images'));

app.use('/images/:key',getImage)
app.use('/api/v1', routes);

app.use(passport.initialize());
passport.use('google', strategies.google);

app.use(error.converter);

app.use(error.notFound);

app.use(error.handler);

module.exports = app;