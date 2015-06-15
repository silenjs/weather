var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/loading',function(req,res,next){
    res.render('index2');
})
module.exports = router;
