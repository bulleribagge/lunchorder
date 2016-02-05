var express = require('express');
var pg = require('pg');
var router = express.Router();

router.all('/', function(req, res){
    console.log(req.params('text'));
    res.send('flerp');
});

module.exports = router