let router = require('express').Router();
let moment = require('moment');
let User = require('../models/user');
let VChat = require('../models/chat');
let wss = require('../server');

router.get('/video', (req, res, next) => {
    // console.log(__dirname);
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);

        res.render(`video/videochat`, { user: user });
    });



});

router.post('/add',(req,res)=>{
    let chat = new VChat();
    
    chat.cid= "5a9a3b106694fd232ccfaad4";
    chat.rid= "5a9a61e6dd749d14dc508eb1";
    chat.type= "video";
    chat.startTime= moment().format('HH:mm');
    chat.date= moment().format('l');

    console.log("Hello");
    chat.save((err) => {
        if (err) return err;

        return console.log("Added to database", chat);
    });
});


router.post('/video', function (req, res, next) {

    let caller, receive;
    let touser = req.body.receiver;
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return next(err);

        caller = user._id;
        console.log({ caller });
    });
    // res.send(req.body.receiver);
    User.findOne({ 'profile.name': touser }, function (err, user) {
        if (err) return next(err);
        receive = user._id;
        console.log({ receive });
    });


    let vchat = new VChat();
    
    vchat.cid = caller;
    vchat.rid = receive;
    vchat.type = 'video';
    vchat.date = moment().format('l');
    vchat.startTime = moment().format('HH:mm');
    
    
    vchat.save((err) => {
        if (err) return err;
        console.log("Added to database");
        return console.log("Added to database", vchat);
    });

    // User.findOne({name: req.connectedUser.name}, function (err, user) {
    //     if (err) return next(err);
    //
    //     res.send({user:user});
    // });
});

// router.patch('/video', function (req, res) {
//     // let time={
//     //     currentTime:moment().format('LTS'),
//     //     Date: moment().format('L')
//     // };
//     //
//     // User.findOne({name: req.data.name}, function (err, user) {
//     //     if (err) return next(err);
//     //
//     //     res.send({user:user});
//     // });
//     console.log(req.conn.name);
// });

module.exports = router;