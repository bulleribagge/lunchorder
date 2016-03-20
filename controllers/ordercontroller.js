var pg = require('pg');
var Order = require('../models/order');

function OrderController() { }

OrderController.prototype.saveOrder = function(order, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        client.query('INSERT INTO public."order"(date, "user", main, side, sauce, drink, extra) VALUES (LOCALTIMESTAMP(0), $1, $2, $3, $4, $5, $6);',
            [order.user, order.main, order.sideorder, order.sauce, order.drink, order.extra])
            .on('end', function() {
                done();
                callback(true);
            })
            .on('error', function(error) {
                done();
                console.log(error);
                throw error;
            });
    });
}

OrderController.prototype.getOrderForUser = function(user, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done){
       if (err) throw err;
       
       var order = new Order();
       
       client.query('SELECT date, main, side, sauce, drink, extra FROM public."order" WHERE "user" = $1 ORDER BY date DESC LIMIT 1', [user])
       .on('row', function(row)
       {
           order.date = row.date;
           order.main = row.main;
           order.sideorder = row.side;
           order.sauce = row.sauce;
           order.drink = row.drink;
           order.extra = row.extra;
       })
       .on('end', function(){
           done();
           callback(order);
       }); 
    });
}

OrderController.prototype.getAllOrders = function(callback){
    pg.connect(process.env.DB_URL, function(err, client, done){
       if(err) throw err;
       
       var orders = [];
       
       client.query('') 
    });
}

module.exports = OrderController;