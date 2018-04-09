let router = require('express').Router();
let User = require('../models/user');

router.get('/textchat',(req,res)=>{
    res.render('textchat/textchat');
});

module.exports = router;