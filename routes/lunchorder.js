var express = require('express');
var pg = require('pg');
var yargs = require('yargs');
var router = express.Router();
var Order = require('../models/order');
var Help = require('../help');
var OrderController = require('../controllers/ordercontroller');

router.all('/', function(req, res) {
    
    res.setHeader('Content-type', 'application/json');
    
    try {
        var argsv = yargs.parse(req.body.text);
    } catch (e) {
        var help = new Help();
        res.send({ "text": help.getHelp() });
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
                res.send(JSON.stringify(order));
            });
        } else {
            //get all orders
            orderController.getTodaysOrders(function(orders) {
                res.send(JSON.stringify(orders));
            });
        }
    } else {
        console.log('unknown command');
        var help = new Help();
        res.send({ "text": help.getHelp() });
    }
});

module.exports = router