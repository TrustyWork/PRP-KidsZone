var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bCrypt = require('bcrypt-nodejs');
var db = require('db');
var session = require('express-session');
var flash = require('connect-flash');

var UserModel = require('db').UserModel;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var index = require('./routes/index');
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge : 3600000},
    name: 'session'    

    }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use('signup', new LocalStrategy({
    passReqToCallback : true,
    usernameField: 'email',
    passwordField: 'password'
}, function (req, username, password, done) {
    UserModel.findOne({'username': username}, function (err, user) {
        if (err)
            return done(err);
        // already exists
        if (user) {
                
            return done(null, false, req.flash('message','User Already Exists'));
               
        }
        // Generates hash using bCrypt
        var createHash = function (password) {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(5), null);
            
        };
        
        // if there is no user with that email create the user
        var user = new UserModel({username: username, password: createHash(password)});

        user.save();        
        return done(null, user);
    });
   
}));



passport.use('login', new LocalStrategy({
    passReqToCallback : true,
    usernameField: 'email',
    passwordField: 'password'
}, function (req, username, password, done) {
    UserModel.findOne({'username': username}, function (err, user) {
        if (err)
            return done(err);
        // Пользователь не существует, ошибка входа
        if (!user) {
                   
            return done(null, false, req.flash('message', 'User Not found.'));
        }
        // Пользователь существует, но пароль введен неверно, ошибка входа
        // Load hash from your password DB.
        var isValidPassword = function (user, password) {
            return bCrypt.compareSync(password, user.password);
        };
        if (!isValidPassword(user, password)) {
                    
            return done(null, false, req.flash('message', 'Invalid Password'));
        }
        // Пользователь существует и пароль верен, возврат пользователя из
        // метода done, что будет означать успешную аутентификацию
        
        return done(null, user);
    });

}));



passport.serializeUser(function (user, done) {
    console.log('serializing user: ');console.log(user);    
    done(null, user._id);

});

passport.deserializeUser(function (id, done) {
    User.findById(id, function(err, user) {
        console.log('deserializing user:',user);
        done(err, user);
    });
});

app.use('/', index);
app.use('/auth', auth);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');
});

module.exports = app;
