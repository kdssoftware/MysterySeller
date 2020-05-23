var express = require('express');
var router = express.Router();
var database = require('../services/database');
const shortid = require('shortid');
var www = require('../bin/www');
const io = require('socket.io')(www.server);

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
    io.on('connection', function(socket){
      socket.leave(req.session.room.id);
    });
    io.sockets.in(req.session.room.id).emit('roomUpdate',
        {messages:req.session.user.name+' left the room'}
        );
    database.leaveRoom(req.session.user);
    req.session.room = null;
  }
  res.redirect('/');
});

// GET /room/:roomId , goes to a new room. if logged in another room logs out in that one.
router.get('/:roomId',function(req,res,next){
  if(req.session.room){ //already in a room, go to your room
    req.session.room = database.getRoomData(req.session.room.id); //update room
    res.render('room')
  }else { //not in a room
    if (shortid.isValid(req.params.roomId)) { //if roomId is valid
      let room = database.getRoomData(req.params.roomId); //find the room
      if (room == null) { //if no room was foudn
        res.render('error', {"message": "room not found", "error": {status: 500, stack: "manual error"}});
        return;
      }else { //if room was found
        database.joinRoom(req.session.user, room.id); //join that room
        req.session.room = room; //log into that room
        io.on('connection', function(socket){
          socket.join(room.id);
        });
        io.sockets.in(req.session.room.id).emit('roomUpdate',
            {messages:req.session.user.name+' joined the room'}
            );
        res.render('room')
      }
    } else { //if roomId is not valid
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
