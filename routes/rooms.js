var express = require('express');
var router = express.Router();
var database = require('../services/database');
const shortid = require('shortid');
const io = require('../app');
const {onConnection} = require('../services/socket');

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
    database.leaveRoom(req.session.user,req.session.room.id);
    req.session.room = null;
  }
  res.redirect('/');
});

// GET /room/:roomId , goes to a new room. if logged in another room logs out in that one.
router.get('/:roomId',function(req,res,next){
  if(req.session.room){
    //already in a room, go to your room
    //update room
    req.session.room = database.getRoomData(req.session.room.id);
    res.render('room')
  }else {
    //not in a room
    if (shortid.isValid(req.params.roomId)) {
      //if roomId is valid
      //find the room
      let room = database.getRoomData(req.params.roomId);
      if (room == null) {
        //if no room was found
        //res.render('error', {"message": "room not found", "error": {status: 500, stack: "manual error"}});
        res.redirect('/');
      }else {
        //if room was found
        let roomId = database.joinRoom(req.session.user, room.id);
        if(!roomId){
          res.render('error', {"message": "This room is busy", "error": {status: 500, stack: "manual error"}});
        }
        //log into that room
        req.session.room = room;
        res.redirect('/room/'+req.params.roomId);
      }
    } else {
      //if roomId is not valid
      res.render('error', {"message": "roomId is invalid", "error": {status: 500, stack: "manual error"}});
      return;
    }
  }
});
router.get('/:roomid/json',function(req,res,next){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.session.room));
});

module.exports = router;
