var express = require('express');
var router = express.Router();
var database = require('../services/database');
router.post('/name',function(req,res,next){
    if(req.session.user){
        req.session.user.name = req.body.name
    }
    //if in room
    if(req.session.room) { //update the display name in room
        database.editRoom(req.session.room.id,{
            users:[req.session.user]
        });
    }
    res.redirect('back');
});

module.exports = router;
