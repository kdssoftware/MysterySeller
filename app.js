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
  secret: 'keyboard cat',
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
      id:req.session.id
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

io.on('connection',(socket) => {
  console.log('running on socket: '+ socket.id);
  socket.on('join',(user,room)=>{

    socket.join(room.id);
    io.to(room.id).emit('join',user);

  });
  socket.on('leave', (user,room)=> {
    io.to(room.id).emit('left',user);

    socket.leave(room.id);
  });
});


http.listen(port, () => console.log('listening on port ' + port));
