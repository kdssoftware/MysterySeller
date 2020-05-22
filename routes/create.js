var express = require('express');
var router = express.Router();
var database = require('../services/database');

/* GET create listing. */
router.get('/', function(req, res, next) {
    if(req.session.room){
        res.redirect('/room/'+req.session.room.id);
    }else{
        res.render('create');
    }
});
router.post('/',function(req,res,next){
    if(req.body.name){
        let newRoom = database.createRoom(req.session.user,{
            name:req.body.name,
            description:req.body.description
        });
        req.session.room = newRoom;
        res.redirect('/room/'+newRoom.id);
    }else{
        res.redirect('back');
    }
});

module.exports = router;
