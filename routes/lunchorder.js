var express = require('express');
var pg = require('pg');
var yargs = require('yargs');
var router = express.Router();
var Order = require('../models/order');
var Help = require('../help');
var OrderController = require('../controllers/ordercontroller');

router.all('/', function(req, res) {
    try{
        var argsv = yargs.parse(req.body.text);
    }catch(e){
        var help = new Help();
        //res.send(help.getHelp());
        res.send('FLEERP');
        return;
    }

    var user = req.body.user_name;
    var orderController = new OrderController();
    var command = argsv._;

    if (command == 'placeorder') {
        console.log('placeorder');
        var order = new Order(user, argsv.m, argsv.so, argsv.s, argsv.d, argsv.e);
        orderController.saveOrder(order, function() {
            res.send('Thank you for your order!');
        }
        );
    } else if (command == 'deleteorder') {
        console.log('deleteorder');
        if (!argsv.a) {
            orderController.deleteOrderForUser(user, function() {
                res.send('Your order has been deleted. Sorry you won\'t be dining with us  :(');
            });
        } 
    } else if (command == 'getorder') {
        console.log('getorder');
        if (!argsv.a) {
            //only get users order
            orderController.getOrderForUser(user, function(order) {
                console.log(JSON.stringify(order));
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

        var orders = [];

        client.query('SELECT * FROM public.order where date = CURRENT_DATE')
            .on('row', function(row) {
                orders.push(JSON.stringify(row));
            })
            .on('end', function(result) {
                res.send(orders);
            });
    });
});

module.exports = router