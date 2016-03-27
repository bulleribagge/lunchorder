var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var routes = require('./routes/lunchorder')

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', routes);

app.listen(process.env.PORT || port);
console.log('listening on port ' + port + ' ...');