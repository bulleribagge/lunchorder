var pg = require('pg');
var Order = require('../models/order');
var async = require('async');

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
                throw error;
            });
    });
}

OrderController.prototype.getOrderForUser = function(user, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        var order = {};

        client.query('SELECT "user", date, main, side, sauce, drink, extra FROM public."order" WHERE "user" = $1 AND canceled = FALSE ORDER BY id DESC LIMIT 1', [user])
            .on('row', function(row) {
                order = new Order();
                order.user = row.user;
                order.date = row.date;
                order.main = row.main;
                order.sideorder = row.side;
                order.sauce = row.sauce;
                order.drink = row.drink;
                order.extra = row.extra;
            })
            .on('end', function() {
                done();
                callback(order);
            });
    });
}

OrderController.prototype.getTodaysOrders = function(callback) {
    var _this = this;
    var orders = [];

    this.getTodaysUsers(function(users) {
        if (users.length > 0) {
            async.each(users, function(user, callback) {
                _this.getOrderForUser(user, function(order) {
                    orders.push(order);
                    callback();
                });
            }, function(err) {
                callback(orders);
            });
        }
    });
}

OrderController.prototype.getTodaysUsers = function(callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        var users = [];

        client.query('SELECT DISTINCT "user" FROM public."order" WHERE "date" >= CURRENT_DATE AND canceled = FALSE')
            .on('row', function(row) {
                users.push(row.user);
            })
            .on('end', function() {
                done();
                callback(users);
            });
    });
}

OrderController.prototype.cancelOrderForUser = function(user, callback){
    pg.connect(process.env.DB_URL, function(err, client, done){
       if(err) throw err;
       
       client.query('UPDATE public."order" SET canceled = TRUE WHERE "user" = $1 AND "date" >= CURRENT_DATE', [user])
       .on('end', function(){
           done();
           callback();
       });
    });
}

module.exports = OrderController;