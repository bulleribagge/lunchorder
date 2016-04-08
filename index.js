var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var routes = require('./routes/lunchorder');
var Sequelize = require('sequelize');
var Model = require('./model');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', routes);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

Model.create(function(){
    app.listen(process.env.PORT || port);
    console.log('listening on port ' + port + ' ...');        
});
