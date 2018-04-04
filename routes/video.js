let router = require('express').Router();
let moment = require('moment');
let User = require('../models/user');
let VChat = require('../models/chat');
let wss = require('../server');

router.get('/video', (req, res, next) => {

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
    console.log("Hello");
    let caller, receive;

    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);


        caller = user._id;
        vchat.cname = user.profile.name;
        vchat.cid = caller;
    });

    User.findOne({ 'profile.name': req.body.receiver }, function (err, user) {
        if (err) return next(err);

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
            res.status(200);
            return console.log("Added to database", vchat);
        });
    }, 3000);

    res.writeHead(200);
});

router.patch('/endvideo', function (req, res) {

    let vchat = new VChat();

    let time = moment().format('HH:mm');

    

    VChat.findOne({cid : req.body.id}, function(err,call){
        if (err) return (err);
        console.log(cid);
        call.endTime = time;
        console.log(time);
        save((err) => {
            if (err) return err;
        
            return console.log("Added to database", vchat);
        });

        res.redirect('/video');
    });
    // User.findOne({name: req.data.name}, function (err, user) {
    //     if (err) return next(err);

    //     res.send({user:user});
    // });
    // console.log(req.conn.name);
});

module.exports = router;