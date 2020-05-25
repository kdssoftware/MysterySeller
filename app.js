var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var roomsRouter = require('./routes/rooms');
var createRouter = require('./routes/create');
var userRouter = require('./routes/user');
var app = express();
var ugen = require('username-generator');
var database = require('./services/database');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const socketsExport = require('./services/socket');
exports.io = io;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var sess = {
  secret:String.raw`),c0 N^Yx! W4c-!e7792+y$\\FSyc+!}=73e`,
  cookie: {}
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));
//every request middleware
app.use((req,res,next)=>{
  if(!req.session.user){
    req.session.user = {
      name:ugen.generateUsername(' '),
      id:req.session.id,
      plays:0
    }
  }
  req.session.juser = JSON.stringify(req.session.user);
  if(req.session.room){ //if use is in a room, stringify and put in session as json
    //store json as locals
    req.session.jroom = JSON.stringify(req.session.room);
  }
  res.locals = req.session;
  next();
});
app.use('/', indexRouter);
app.use('/room', roomsRouter);
app.use('/create',createRouter);
app.use('/user',userRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
let currentlyInRoomUsers = [];
io.on('connection',(socket) => {
  console.log('running on socket: '+ socket.id);
  socket.on('join',(user,room)=>{
    let userInRoom = false;
    currentlyInRoomUsers.forEach((u)=>{
      if(u===user.id){
        userInRoom = true;
      }
    });
    if(!userInRoom){
      socket.join(room.id);
      socket.to(room.id).emit('user joined',user);
      currentlyInRoomUsers.push(user.id);
      console.log("[socket.io] join: "+user.name+' joined the room');
    }else{
      console.log("[socket.io] join: "+user.name+' already joined a room');
    }
  });
  socket.on('leave', (user,room,fn)=> {
    let userInRoom = false;
    let userIndex = 0;
    currentlyInRoomUsers.forEach((u)=>{
      if(u===user.id){
        userInRoom = true;
        currentlyInRoomUsers.splice(userIndex,1);
      }
      userIndex++;
    });
    if(userInRoom){
      socket.to(room.id).emit('user left',user);
      socket.leave(room.id);
      console.log("[socket.io] leave: "+user.name+' left the room');
    }else{
      console.log("[socket.io] leave: "+user.name+' already left a room');
    }
    fn('/room/leave');
  });

  socket.on('user joined',(user,room)=>{
    socket.to(room.id).emit('user joined',user);
    console.log("[socket.io] user joined: "+user.name+' joined the room');
  });

  socket.on('user left',(user,room)=>{
    socket.to(room.id).emit('user left',user);
    console.log("[socket.io] user left: "+user.name+' joined the room');
  });

  socket.on('start game', (user,room)=>{
    database.startRoom(user,room.id);
    console.log("[socket.io] start game: game has started on room "+room.name);
    console.log("[socket.io] start game: currently playing: "+user.name);
    socket.to(room.id).emit('start game',database.getCurrentPlayer(room.id),database.getFirstItem(room.id));
  });

  socket.on('next player',(room)=>{
    database.nextPlayer(room.id);
    console.log("[socket.io] next round");
    let item = database.getFirstItem(room.id);
    if(!item){//no items no more
      socket.to(room.id).emit('end game');
    }else{
      socket.to(room.id).emit('next player',database.getCurrentPlayer(room.id),item);
    }
  });
});


http.listen(port, () => console.log('listening on port ' + port));
