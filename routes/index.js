var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.room){
    res.redirect('/room/'+req.session.room.id);
  }else {
    res.render('index');
  }
});

module.exports = router;
