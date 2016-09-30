var pg = require('pg');
var Order = require('../models/order');
var async = require('async');
var Model = require('../model');

function OrderController() { }

OrderController.prototype.createOrder = function (order, callback) {

    Model.Order.create({
        username: order.username,
        restaurant: order.restaurant.toLowerCase().trim(),
        main: order.main.toLowerCase().trim(),
        sideorder: order.sideorder,
        sauce: order.sauce,
        drink: order.drink,
        extra: order.extra,
        canceled: false
    }).then(function () {
        console.log('order created');
        callback(true);
    });
}; 

OrderController.prototype.insertOrUpdateOrder = function (username, newOrder, callback) {
    var oc = this;
    oc.getOrderForUser(username, function (order) {
        if (order) {
            //update
            console.log('there is already an order for this user');

            if (order.restaurant !== newOrder.restaurant) {
                oc.deleteOrder(order, function(){
                    oc.createOrder(newOrder, function(){
                        callback(newOrder);
                    });
                });
            }

            oc.updateOrder(order.id, newOrder, function () {
                callback(newOrder);
            });

        } else {
            //insert
            oc.createOrder(newOrder, function () {
                console.log('order created in db');
                callback(newOrder);
            });
        }
    });
}

OrderController.prototype.updateOrder = function (id, order, callback) {
    Model.Order.update({
        restaurant: order.restaurant.toLowerCase().trim(),
        main: order.main.toLowerCase().trim(),
        sideorder: order.sideorder,
        sauce: order.sauce,
        drink: order.drink,
        extra: order.extra,
        canceled: false
    }, {
            where: {
                id: id
            }
        }).then(function () {
            callback();
        });
};

OrderController.prototype.getOrderForUser = function (username, callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.findOne({
        where: {
            username: username,
            createdAt: {
                $gt: date
            },
            canceled: false
        },
    }).then(function (order) {
        callback(order);
    });
};

OrderController.prototype.getLastOrderForUser = function (username, callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.findOne({
        order: [['createdAt', 'DESC']],
        where: {
            username: username,
            canceled: false,
            createdAt: {
                $lt: date
            }
        },
    }).then(function (order) {
        callback(order);
    });
};

OrderController.prototype.getTodaysOrdersForRestaurant = function (restaurant, callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.findAll({
        where: {
            restaurant: restaurant,
            createdAt: {
                $gt: date
            },
            canceled: false
        }
    }).then(function (orders) {
        callback(orders);
    });
};

OrderController.prototype.getAllOrders = function (callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.findAll({
        where: {
            createdAt: {
                $gt: date
            }
        }
    }).then(function (orders) {
        callback(orders);
    });
};

OrderController.prototype.wipeAllOrders = function (callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.destroy({
        where: {
            createdAt: {
                $gt: date
            }
        }
    }).then(function () {
        callback();
    });
};

OrderController.prototype.cancelOrderForUser = function (username, callback) {
    var date = new Date();
    date.setHours(0, 0, 0, 0);

    Model.Order.update({
        canceled: true
    }, {
            where: {
                username: username,
                createdAt: {
                    $gt: date
                }
            }
        }).then(function () {
            callback();
        });
};

OrderController.prototype.deleteOrder = function (order, callback){
    Model.Order.destroy({
        where: {
            id: order.id
        }
    }).then(function(){
        callback();
    });
};

module.exports = OrderController;