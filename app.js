var express = require('express');
var path = require('path');

var session = require('express-session');
var MongoStore  = require('connect-mongo')(session);
var settings = require('./setting');
var flash = require('connect-flash');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

var debug = require('debug')('my-application'); // debug模块  
app.set('port', process.env.PORT || 3000); // 设定监听端口

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    // db: settings.db
    url: 'mongodb://localhost/blog'
  })
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
//启动监听  
var server = app.listen(app.get('port'), function() {  
  debug('Express server listening on port ' + server.address().port);  
});  

