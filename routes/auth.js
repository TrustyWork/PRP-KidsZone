'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');


var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');

};

router.get('/', function (req, res) {
    // Display the Login page with any flash message, if any
    res.render('auth', {message: req.flash('message')});   
    
});


router.post('/signup',
    passport.authenticate('signup', { failureRedirect: '/auth', failureFlash : true}),
    function(req, res) {
        
        res.render('private', {title: req.user.username, info: req.user});

    });

router.post('/login',
    passport.authenticate('login', { failureRedirect: '/auth', failureFlash : true}),
    function(req, res) {
       
        res.render('private', {title: req.user.username, info: req.user});

    });


router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;