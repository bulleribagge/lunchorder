var express = require('express');

var app = express();
var port = 3000;

app.all('/derp', function(req, res){
   res.send('fleerp 2'); 
});

app.listen(process.env.PORT || port);
console.log('listening on port ' + port + ' ...')