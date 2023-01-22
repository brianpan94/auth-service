const createHttpError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const accessLog = require('./middlewares/accessLog.js');
const reqResLog = require('./middlewares/reqResLog.js');
const {replaceConsole} = require('./services/UtilsService.js');
replaceConsole();

const confirmRouter = require('./routes/confirm');

const app = express();
app.use(accessLog);
app.use(reqResLog);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/confirm', confirmRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createHttpError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err);
  let {message, stack} = err;
  stack = stack.split('\n')
    .slice(1)
    .map((stackInfo) => stackInfo.replace(/^ +/, ''));

  const errLog ={
    type: 'json',
    data: {message, stack},
  };
  require('./services/LoggerService')
    .getLogger('tryerrorCategory')
    .error(JSON.stringify(errLog));

  const status = err.statusCode || '500';
  const result = 0;
  let data = undefined;

  // set locals, only providing error in development
  if (!(req.app.get('env') === 'production')) {
    data = {message, stack};
  }

  res.status(status).json({result, data});
});

module.exports = app;
