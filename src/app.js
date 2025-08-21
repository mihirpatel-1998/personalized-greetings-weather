const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const createError = require('http-errors');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Weather Greetings API 🚀',
  });
});
app.use('/api/v1', routes);

// 404 + error handlers
app.use((req, res, next) => next(createError(404, 'Not Found')));
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
