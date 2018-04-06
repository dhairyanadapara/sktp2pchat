let router = require('express').Router();
let moment = require('moment');
let User = require('../models/user');
let VChat = require('../models/chat');
let wss = require('../server');

router.get('/video', (req, res, next) => {

    if (!req.user) {
        res.redirect('/login');
    }

    let calls;
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);
        VChat.find({ cid: req.user._id }, function (err, calls) {
            if (err) return next(err);

            VChat.find({ rid: req.user._id }, function (err, recv) {
                if (err) return next(err);

                res.render(`video/videochat`, { user, calls, recv });
            })

        });
    });
});

router.post('/video', function (req, res, next) {

    if (!req.user) {
        res.redirect('/login');
    }

    let caller, receive;
    console.log(req.user);
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);

        
        caller = user._id;
        vchat.cname = user.profile.name;
        vchat.cid = caller;
    });

    User.findOne({ 'profile.name': req.body.name }, function (err, user) {
        if (err) return next(err);
        console.log(user);
        receive = user._id;
        vchat.rname = user.profile.name;
        vchat.rid = receive;
    });
    let vchat = new VChat();

    vchat.type = 'video';
    vchat.date = moment().format('l');
    vchat.startTime = moment().format('HH:mm');
    vchat.endTime = moment().format('HH:mm');

    setTimeout(() => {
        vchat.save((err) => {
            if (err) return err;
            // res.status(200);
            return console.log("Added to database", vchat);
        });
    }, 3000);

    res.writeHead(200);
    res.end();
});

router.patch('/endvideo', function (req, res) {

    let vchat = new VChat();
    let time = moment().format('HH:mm');

    VChat.findOneAndUpdate({ cid: req.user._id }, function (err, call) {
        if (err) return (err);
        console.log(call);
        call.endTime = time;

        vchat.save((err) => {
            if (err) return err;
            console.log(time);
            return console.log("Added to database", vchat);
        });
    });

    res.redirect('/video');
});

module.exports = router;