var pg = require('pg');
var Order = require('../models/order');
var async = require('async');

function OrderController() { }

OrderController.prototype.saveOrder = function(order, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        client.query('INSERT INTO public."order"(date, username, main, side, sauce, drink, extra) VALUES (LOCALTIMESTAMP(0), $1, $2, $3, $4, $5, $6);',
            [order.username, order.main, order.sideorder, order.sauce, order.drink, order.extra])
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

OrderController.prototype.getOrderForUser = function(username, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        var order = {};
        console.log(username);
        client.query('SELECT username, date, main, side, sauce, drink, extra FROM public."order" WHERE username = $1 AND canceled = FALSE ORDER BY id DESC LIMIT 1', [username])
            .on('row', function(row) {
                console.log(row);
                order = new Order();
                order.username = row.username;
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

        client.query('SELECT DISTINCT username FROM public."order" WHERE "date" >= CURRENT_DATE AND canceled = FALSE')
            .on('row', function(row) {
                users.push(row.username);
            })
            .on('end', function() {
                done();
                callback(users);
            });
    });
}

OrderController.prototype.getAllOrders = function(callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        var orders = [];

        client.query('SELECT * FROM public."order" WHERE "date" >= CURRENT_DATE')
            .on('row', function(row){
                orders.push(row);
            })
            .on('end', function(){
               done();
               callback(orders); 
            });
    });
}

OrderController.prototype.wipeAllOrders = function(callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        client.query('DELETE FROM public."order" WHERE "date" >= CURRENT_DATE')
            .on('end', function(){
               done();
               callback(); 
            });
    });
}

OrderController.prototype.cancelOrderForUser = function(user, callback) {
    pg.connect(process.env.DB_URL, function(err, client, done) {
        if (err) throw err;

        client.query('UPDATE public."order" SET canceled = TRUE WHERE username = $1 AND "date" >= CURRENT_DATE', [user])
            .on('end', function() {
                done();
                callback();
            });
    });
}

module.exports = OrderController;