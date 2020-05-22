var express = require('express');
var router = express.Router();
var database = require('../services/database');
const shortid = require('shortid');

// GET /room , goes to the room in session (logged in)
router.get('/', function(req, res, next) {
  if(req.session.room){ //already room logged in a room
    res.redirect('/room/'+req.session.room.id);
  }else{ //no room
    res.redirect('/');
  }
});

// Get /room/leave , leaves the room the user is signed into
router.get('/leave',function(req,res,next){
  if(req.session.room){
    //removes roomId in sesion
    database.leaveRoom(req.session.user);
    req.session.room = null;
  }
  res.redirect('/');
});

// GET /room/:roomId , goes to a new room. if logged in another room logs out in that one.
router.get('/:roomId',function(req,res,next){
  if(shortid.isValid(req.params.roomId)){
    //get room data
    let room = database.getRoomData(req.params.roomId);
    if(room==null){
      res.render('error',{"message":"room not found","error":{status:500,stack:"manual error"}} );
      return;
    }
    database.joinRoom(req.session.user,room.id);
    req.session.room = room;
    res.render('room', {"room":req.session.room});
  }else{
    res.render('error',{"message":"roomId is invalid","error":{status:500,stack:"manual error"}} );
    return;
  }
});



module.exports = router;
