var express = require('express');
var router = express.Router();
router.get('/',function(req,res,next){
    res.render('user',{'user':req.session.user});
});

router.post('/name',function(req,res,next){
    if(req.session.user){
        req.session.user.name = req.body.name
    }
    res.redirect('/');
});

module.exports = router;
