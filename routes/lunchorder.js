var express = require('express');
var pg = require('pg');
var yargs = require('yargs');
var router = express.Router();
var Order = require('../models/order');
var Help = require('../help');
var Util = require('../util');
var OrderController = require('../controllers/ordercontroller');

router.all('/', function (req, res) {

    var argsv;

    if (req.body.token != process.env.SLACK_TOKEN) {
        console.log(req.body.text);
        res.sendStatus(403);
        return;
    }

    res.setHeader('Content-type', 'application/json');

    try {
        console.log(req.body.text);
        argsv = yargs.parse(req.body.text);
    } catch (e) {
        res.send({ "text": Help.getHelp() });
        return;
    }

    var restaurants = ['lillaoskar', 'newyork'];

    var username = req.body.user_name;
    var orderController = new OrderController();
    var command = argsv._;

    if (command == 'placeorder') {
        if (argsv.lo) {
            //repeat last order for this user
            orderController.getLastOrderForUser(username, function (order) {
                orderController.createOrder(order, function () {
                    console.log('repeating last order');
                    res.send({ 'text': 'Thank you for your order! Here is what you ordered: \r\n ' + order.toString() });
                    return;
                });
            });
        } else {
            if (!argsv.r) {
                var str = 'No restaurant supplied! Please specify one of the following restaurants using the -r flag: ';
                for (var r of restaurants) {
                    str += '\r\n' + r;
                }
                res.send({ 'text': str });
                return;
            }
            if (restaurants.indexOf(argsv.r.toLowerCase()) == -1) {
                console.log('unknown restaurant: ' + argsv.r);
                var str = 'Unknown restaurant! Please specify one of the following restaurants: ';
                for (var r of restaurants) {
                    str += '\r\n' + r;
                }
                res.send({ 'text': str });
                return;
            }


            var newOrder = new Order(username, argsv.r, argsv.m, argsv.so, argsv.s, argsv.d, argsv.e);

            if (!newOrder.main) {
                res.send({ 'text': 'Oh no! Looks like you didn\'t specify your main dish with the -m flag. Here\'s an example: \r\n /lunchorder placeorder -r "newyork" -m "kebabpizza"' });
                return;
            }

            //is there already an order for this user?
            orderController.getOrderForUser(username, function (order) {
                if (order) {
                    //update
                    console.log('there is already an order for this user');
                    orderController.updateOrder(order.id, newOrder, function () {
                        res.send({ 'text': 'Your order has been updated. Here is what you ordered: \r\n' + newOrder.toString(true) });
                    });
                } else {
                    //insert
                    orderController.createOrder(newOrder, function () {
                        console.log('order created in db');
                        res.send({ 'text': 'Thank you for your order! Here is what you ordered: \r\n ' + newOrder.toString(true) });
                    });
                }
            });
        }
    } else if (command == 'cancelorder') {
        console.log('cancelorder');
        if (!argsv.a) {
            orderController.cancelOrderForUser(username, function () {
                res.send({ 'text': 'Your order has been canceled. Sorry you won\'t be dining with us  :(' });
            });
        }
    } else if (command == 'getorder') {
        if (!argsv.a) {
            //only get users order
            console.log('getorder');
            orderController.getOrderForUser(username, function (order) {
                if (!Util.isEmpty(order)) {
                    console.log(order.toString());
                    res.send({ 'text': order.toString(true) });
                } else {
                    res.send({ 'text': 'No order found for username ' + username });
                }
            });
        } else {
            if (argsv.r) {
                //get all orders
                console.log('getorder -a -r');
                orderController.getTodaysOrdersForRestaurant(argsv.r, function (orders) {
                    var result = "";
                    var totals = {};
                    for (var order of orders) {
                        result += order.toString(false) + '\n';

                        if (isNaN(totals[order.main])) {
                            totals[order.main] = 1;
                        } else {
                            totals[order.main]++;
                        }
                    }

                    for (var key in totals) {
                        result += key + ': ' + totals[key] + '\n';
                    }

                    res.send({ "text": result === "" ? "No orders for this restaurant today" : result });
                });
            } else {
                res.send({ 'text': 'You need to specify a restaurant with the -r flag' });
            }
        }
    } else {
        console.log('unknown command');
        res.send({ "text": Help.getHelp() });
    }
});

router.all('/getorders', function (req, res) {
    res.setHeader('Content-type', 'application/json');
    var orderController = new OrderController();
    orderController.getTodaysOrders(function (orders) {
        res.send(orders);
    });
});

router.all('/wipeorders', function (req, res) {
    if (req.query.p == process.env.SECRET) {
        res.setHeader('Content-type', 'application/json');
        var orderController = new OrderController();
        orderController.wipeAllOrders(function () {
            res.send('Stuff wiped');
        });
    } else {
        res.sendStatus(403);
    }
});

module.exports = router;
