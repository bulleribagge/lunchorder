var express = require('express');
var pg = require('pg');

var app = express();
var port = 3000;

app.get('/', function(req, res){
    res.send('Hello World!');
});

app.all('/derp', function(req, res){
   res.send('fleerp 2'); 
});

app.all('/db', function(req, res){
   pg.connect(process.env.DB_URL, function(err, client){
      if(err) throw err;
      console.log('Connected to postgres! Getting orders...');
      
      client
      .query('SELECT * FROM order;')
      .on('row', function(row){
          console.log(JSON.stringify(row));
      });
   });
});

app.listen(process.env.PORT || port);
console.log('listening on port ' + port + ' ...')