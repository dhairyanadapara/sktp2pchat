let router = require('express').Router();
let moment = require('moment');
let User = require('../models/user');
let VChat = require('../models/chat');
let wss = require('../server');

router.get('/video', (req, res, next) => {
    // console.log(__dirname);
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) return next(err);

        res.render('video/videochat', {user: user});
    });
});

// router.post('/video', function (req, res, next) {
//
//     let caller,receive;
//
//     User.findOne({_id: req.user._id}, function (err, user) {
//         if (err) return next(err);
//
//         caller = user;
//         console.log({caller});
//     });
//     // res.send(req.body.receiver);
//     User.findOne({'profile.name': req.body.receiver}, function (err, user) {
//         if (err) return next(err);
//         receive = user;
//         console.log({receive});
//     });
//
//
//     // User.findOne({name: req.connectedUser.name}, function (err, user) {
//     //     if (err) return next(err);
//     //
//     //     res.send({user:user});
//     // });
// });
//
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