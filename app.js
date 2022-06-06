var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var cors = require('cors');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var productRouter = require('./routes/products');
var componentRouter = require('./routes/components');
var userRouter = require('./routes/userRoute');
var cartRouter = require('./routes/carts');
var orderRouter = require('./routes/order');
var stripeRouter = require('./routes/stripe');
var chatRouter = require("./routes/chat")
var app = express();
//Configure the Dotenv
dotenv.config();
//For Calling the DB
const DB = process.env.MONGO_URL;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/api/products', productRouter);
app.use('/api/components', componentRouter);
app.use('/api/auth', authRouter);
app.use('/api/data/carts', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/checkout', stripeRouter);
app.use('/api/chat', chatRouter);

app.use('/api/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//MongoDb Connection
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDb....'))
  .catch((error) => console.log(error.message));

module.exports = app;
