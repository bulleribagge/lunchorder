var request = require('request');
var assert = require('assert');
var async = require('async');

module.exports = function () {
    /* ----------------------------- GIVEN ---------------------------- */

    this.Given(/^I have an invalid slack token$/, function (callback) {
        this.slackRequest.token = 'invalid_token';
        callback();
    });

    /* ----------------------------- WHEN ----------------------------- */
    this.When(/^I order lunch without parameters$/, function (callback) {
        var username = 'Steve';
        var world = this;
        this.lastOrder[username] = { restaurant: 'newyork' };
        this.placeOrderForUser(username, function (res) {
            world.lastResponse = JSON.parse(res);
            callback();
        });
    });

    this.When(/^I order lunch at (.*)$/, function ( restaurant, callback) {
        var username = 'Steve';
        var world = this;
        var lastOrder = this.lastOrder[username] = {
            restaurant: restaurant,
            main: 'cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        };
        try 
        {
            this.placeOrderForUser(username, function (res) {
                world.lastResponse = JSON.parse(res);
                callback();
            });
        } catch (error) {
            console.log('what the fudge');
            console.log(error);
            throw error;
        } 
    });

    this.When(/^I order lunch without specifying restaurant$/, function (callback) {
        var username = 'Steve';
        var world = this;
        var lastOrder = this.lastOrder[username] = {
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        };
        try {
            this.placeOrderForUser(username, function (res) {
                world.lastResponse = JSON.parse(res);
                callback();
            });
            } catch (error) {
                console.log(error);
                throw error;   
            }
    });

    this.When(/^I order lunch twice at (.*)$/, function (restaurant, callback) {
        var username = 'Steve';
        var world = this;
        this.lastOrder[username] = {
            restaurant: restaurant,
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        };

        this.placeOrderForUser(username, function (res) {
            world.lastResponse = JSON.parse(res);
            world.lastOrder[username].drink = 'Pepsi';
            world.placeOrderForUser(username, function (res) {
                world.lastResponse = JSON.parse(res);
                callback();
            });
        });
    });

    this.When(/^many people have ordered at (.*)$/, function (restaurant, callback) {
        var world = this;
        var usernames = ['Steve', 'Billy', 'Dan', 'Jessica', 'Gorbatchov', 'Putin'];
        for (var u of usernames) {
            var o = this.getRandomOrder();
            o.restaurant = restaurant;
            this.lastOrder[u] = o;
        }

        async.each(usernames, function (username, callback) {
            world.placeOrderForUser(username, function (res) {
                world.lastResponse = JSON.parse(res);
                callback();
            });
        }, function (err) {
            world.lastOrder.Dan = world.getRandomOrder();
            world.lastOrder.Dan.restaurant = restaurant;
            world.lastOrder.Steve = world.getRandomOrder();
            world.lastOrder.Steve.restaurant = restaurant;
            world.placeOrderForUser('Dan', function (res) {
                world.lastResponse = JSON.parse(res);
                world.placeOrderForUser('Steve', function (res) {
                    world.lastResponse = JSON.parse(res);
                    callback();
                });
            });
        });
    });

    this.When(/^I cancel it$/, function (callback) {
        var world = this;
        world.cancelOrderForUser('Steve', function (res) {
            world.lastResponse = JSON.parse(res);
            callback();
        });
    });

    this.When(/^I wait for (\d+) seconds$/, function (seconds, callback) {
        setTimeout(function () {
            callback();
        }, parseInt(seconds) * 1000);
    });

    this.When(/^I use an invalid command$/, function (callback) {
        var world = this;
        this.sendEmptyRequest(function (res) {
            world.lastResponse = JSON.parse(res);
            callback();
        });
    });

    this.When(/^I order with just the r and m flag$/, function (callback){
        var world = this;
        var username = "Steve";
        var restaurant = "newyork";

        this.lastOrder[username] = {
            restaurant: restaurant,
            main: "Kebabpizza"
        };

        this.placeOrderForUser(username, function(res){
            world.lastResponse = JSON.parse(res);
            callback();
        });
    });

    /* ----------------------------- THEN ----------------------------- */

    this.Then(/^I should see my order$/, function (callback) {
        var username = 'Steve';
        var lastOrder = this.lastOrder[username];
        var world = this;
        this.getOrderForUser(username, function (res) {
            world.lastResponse = JSON.parse(res);
            oRes = JSON.parse(res).text;
            world.compareToLastOrderForUser(username, oRes, function (equal) {
                assert(equal);
                callback();
            });
        });
    });

    this.Then(/^I should see all orders$/, function (callback) {
        var world = this;
        var restaurant = world.lastOrder['Steve'].restaurant;
        this.getAllOrders(restaurant, function (res) {
            world.lastResponse = JSON.parse(res);
            var actualStr = JSON.parse(res).text;
            var expectedTotals = {};

            for (var key in world.lastOrder) {
                world.lastOrder[key].username = key;
                assert(actualStr.indexOf(world.convertOrderToString(world.lastOrder[key])) != -1);

                var main = world.lastOrder[key].main;

                if (isNaN(expectedTotals[main])) {
                    expectedTotals[main] = 1;
                } else {
                    expectedTotals[main]++;
                }
            }

            for (var key in expectedTotals) {
                assert(actualStr.indexOf(key + ': ' + expectedTotals[key]) != -1);
            }

            callback();
        });
    });

    this.Then(/^I should not see my order$/, function (callback) {
        world = this;
        this.getOrderForUser('Steve', function (res) {
            world.lastResponse = JSON.parse(res);
            var resStr = JSON.parse(res).text;
            assert.equal(resStr, 'No order found for username Steve');
            callback();
        });
    });

    this.Then(/^I should get an HTTP error (\d+) back$/, function (code, callback) {
        assert.equal(this.lastResponse.statusCode, code);
        callback();
    });

    this.Then(/^I should see the help text$/, function (callback) {
        assert.equal(this.helpText, this.lastResponse.text);
        callback();
    });

    this.Then(/^I should get a list of all the restaurants$/, function (callback){
        var expected = 'Unknown restaurant! Please specify one of the following restaurants: ';
        expected += '\r\nlillaoskar';
        expected += '\r\nnewyork'; 
        assert.equal(expected, this.lastResponse.text);
        callback();
    });
    
    this.Then(/^I should get an error message and a list of all the restaurants$/, function (callback) {
        var expected = 'No restaurant supplied! Please specify one of the following restaurants using the -r flag: ';
        expected += '\r\nlillaoskar';
        expected += '\r\nnewyork'; 
        assert.equal(expected, this.lastResponse.text);
        callback();
    });

    this.Then(/^I should get a warning about missing parameters$/, function(callback){
        var expected = 'Oh no! Looks like you didn\'t specify your main dish with the -m flag. Here\'s an example: \r\n /lunchorder placeorder -r "newyork" -m "kebabpizza"';
        assert.equal(expected, this.lastResponse.text);
        callback();
    });

    this.Then(/^I should get the correct text in the response$/, function(callback){
        var expected = 'Thank you for your order! Here is what you ordered: \r\n ' + this.convertOrderToString(this.lastOrder['Steve'], 'Steve');
        var actual = this.lastResponse.text;

        assert.equal(expected, this.lastResponse.text);
        callback();
    });
}