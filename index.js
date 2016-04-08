var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var routes = require('./routes/lunchorder');
var Sequelize = require('sequelize');
var Model = require('./model');
var cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', routes);

Model.create(function(){
    app.listen(process.env.PORT || port);
    console.log('listening on port ' + port + ' ...');        
});
