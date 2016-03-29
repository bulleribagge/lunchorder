var express = require('express');
var pg = require('pg');
var yargs = require('yargs');
var router = express.Router();
var Order = require('../models/order');
var Help = require('../help');
var Util = require('../util');
var OrderController = require('../controllers/ordercontroller');

router.all('/', function(req, res) {

    if (req.body.token != process.env.SLACK_TOKEN) {
        res.sendStatus(403);
        return;
    }

    res.setHeader('Content-type', 'application/json');

    try {
        var argsv = yargs.parse(req.body.text);
    } catch (e) {
        res.send({ "text": Help.getHelp() });
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
    } else if (command == 'cancelorder') {
        console.log('cancelorder');
        if (!argsv.a) {
            orderController.cancelOrderForUser(user, function() {
                res.send('Your order has been canceled. Sorry you won\'t be dining with us  :(');
            });
        }
    } else if (command == 'getorder') {
        console.log('getorder');
        if (!argsv.a) {
            //only get users order
            orderController.getOrderForUser(user, function(order) {
                if (!Util.isEmpty(order)) {
                    res.send({ 'text': order.toString() });
                } else {
                    res.send({ 'text': 'No order found for user ' + user });
                }
            });
        } else {
            //get all orders
            orderController.getTodaysOrders(function(orders) {
                var result = "";
                var totals = {};
                for (var order of orders) {
                    result += order.toString() + '\n';
                    if (isNaN(totals[order.main])) {
                        totals[order.main] = 1;
                    } else {
                        totals[order.main]++;
                    }
                }

                for (var key in totals) {
                    result += key + ': ' + totals[key] + '\n';
                }

                res.send({ "text": result });
            });
        }
    } else {
        console.log('unknown command');
        //var help = new Help();
        res.send({ "text": Help.getHelp() });
    }
});

router.all('/getorders', function(req, res) {
    res.setHeader('Content-type', 'application/json');
    var orderController = new OrderController();
    orderController.getAllOrders(function(orders) {
        res.send(orders);
    });
});

router.all('/wipeorders', function(req, res) {
    if (req.query.p == process.env.SECRET) {
        res.setHeader('Content-type', 'application/json');
        var orderController = new OrderController();
        orderController.wipeAllOrders(function() {
            res.send('Stuff wiped');
        });
    } else {
        res.sendStatus(403);
    }
});

module.exports = router