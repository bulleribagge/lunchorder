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

app.get('/', function(req, res){
    res.send('Hello World!');
});

app.all('/lunchorders', function(req, res){
    
   pg.connect(process.env.DB_URL, function(err, client){
      if(err) throw err;
      console.log('Connected to postgres! Getting orders...');
      
      var orders = [];
      
      client
      .query('SELECT * FROM public.order where date = CURRENT_DATE')
      .on('row', function(row){
          orders.push(JSON.stringify(row));
      })
      .on('end', function(result){
          res.send(orders);
      });
   });
});

app.all('/')

app.listen(process.env.PORT || port);
console.log('listening on port ' + port + ' ...')