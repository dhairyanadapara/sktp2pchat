let router = require('express').Router();
let passport = require('passport');
let User = require('../models/user');
let passportConf = require('../config/passport');

router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/signup');

    res.render('accounts/login', {
        message: req.flash('loginMessage')
    });
});


router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    })
);

router.get('/profile', (req, res, next) => {
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) return next(err);

        res.render('accounts/profile', {user: user});
    });

    //res.render('/accounts/login');
});

router.get('/signup', (req, res, next) => {
    res.render('accounts/signup', {
        errors: req.flash('errors')
    });
});


router.post('/signup', (req, res, next) => {
    let user = new User();

    user.profile.name = req.body.name;
    user.password = req.body.password;
    user.email = req.body.email;

    User.findOne({email: req.body.email}, function (err, existingUser) {
        if (existingUser) {
            req.flash('errors', 'Account with email address already exist');
            return res.redirect('/signup');
        }
        else {
            user.save((err) => {
                if (err) return next(err);

                return res.redirect('/profile');
            });
        }
    });
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/login');
});


module.exports = router;