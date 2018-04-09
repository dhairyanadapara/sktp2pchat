let router = require('express').Router();
let moment = require('moment');
let User = require('../models/user');
let AChat = require('../models/chat');
let wss = require('../server');

router.get('/audio', (req, res, next) => {

    if (!req.user) {
        res.redirect('/login');
    }

    let calls;
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);
        AChat.find({ cid: req.user._id }, function (err, calls) {
            if (err) return next(err);

            AChat.find({ rid: req.user._id }, function (err, recv) {
                if (err) return next(err);

                res.render(`audio/audiochat`, { user, calls, recv });
            })
        });
    });
});

router.post('/audio', function (req, res, next) {

    if (!req.user) {
        res.redirect('/login');
    }

    let caller, receive;
    console.log(req.user);
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);

        
        caller = user._id;
        achat.cname = user.profile.name;
        achat.cid = caller;
    });

    User.findOne({ 'profile.name': req.body.name }, function (err, user) {
        if (err) return next(err);
        console.log(user);
        receive = user._id;
        achat.rname = user.profile.name;
        achat.rid = receive;
    });
    let achat = new AChat();

    achat.type = 'audio';
    achat.date = moment().format('l');
    achat.startTime = moment().format('HH:mm');
    achat.endTime = moment().format('HH:mm');

    setTimeout(() => {
        achat.save((err) => {
            if (err) return err;
            // res.status(200);
            return console.log("Added to database", achat);
        });
    }, 3000);

    res.writeHead(200);
    res.end();
});

router.patch('/endaudio', function (req, res) {

    let achat = new AChat();
    let time = moment().format('HH:mm');

    AChat.findOneAndUpdate({ cid: req.user._id }, function (err, call) {
        if (err) return (err);
        console.log(call);
        call.endTime = time;

        achat.save((err) => {
            if (err) return err;
            console.log(time);
            return console.log("Added to database", achat);
        });
    });

    res.redirect('/audio');
});

module.exports = router;