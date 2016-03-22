var express = require('express');
var pg = require('pg');
var yargs = require('yargs');
var router = express.Router();
var Order = require('../models/order');
var OrderController = require('../controllers/ordercontroller');

router.all('/', function(req, res) {

    //console.log(req.body);
    var argsv = yargs.parse(req.body.text);

    var user = req.body.user_name;
    var orderController = new OrderController();
    var command = argsv._;

    if (command == 'placeorder') {
        console.log('command: placeorder');
        var order = new Order(user, argsv.m, argsv.so, argsv.s, argsv.d, argsv.e);
        orderController.saveOrder(order, function() {
            console.log('order saved');
            res.send('order succesfully saved: ' + JSON.stringify(order));
        }
        );
    } else if (command == 'deleteorder') {
        console.log('command: deleteorder');
    } else if (command == 'getorder') {
        console.log('command: getorder');
        if (!argsv.a) {
            //only get users order
            orderController.getOrderForUser(user, function(order) {
                res.send(JSON.stringify(order));
            });
        } else {
            //get all orders
            orderController.getTodaysOrders(function(orders) {
                res.send(JSON.stringify(orders));
            });
        }
    }
});

router.all('/getorders', function(req, res) {
    pg.connect(process.env.DB_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting orders...');

        var orders = [];

        client
            .query('SELECT * FROM public.order where date = CURRENT_DATE')
            .on('row', function(row) {
                orders.push(JSON.stringify(row));
            })
            .on('end', function(result) {
                res.send(orders);
            });
    });
});

module.exports = router