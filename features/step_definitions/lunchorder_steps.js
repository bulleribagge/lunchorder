var request = require('request');
var assert = require('assert');
var async = require('async');

module.exports = function() {
    /* ----------------------------- GIVEN ---------------------------- */

    this.Given(/^I have an invalid slack token$/, function(callback) {
        this.slackRequest.token = 'invalid_token';
        callback();
    });

    /* ----------------------------- WHEN ----------------------------- */
    this.When(/^I order lunch without parameters$/, function(callback) {
        var username = 'Steve';
        this.lastOrder[username] = {};
        this.placeOrderForUser(username, function(res) {
            callback();
        });
    });

    this.When(/^I order lunch$/, function(callback) {
        var username = 'Steve';
        var lastOrder = this.lastOrder[username] = {
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        }

        this.placeOrderForUser(username, function(res) {
            callback();
        });
    });

    this.When(/^I order lunch twice$/, function(callback) {
        var username = 'Steve';
        var world = this;
        this.lastOrder[username] = {
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        }

        this.placeOrderForUser(username, function() {
            world.lastOrder[username].drink = 'Pepsi';
            world.placeOrderForUser(username, function(res) {
                callback();
            });
        });
    });

    this.When(/^many people have ordered$/, function(callback) {
        var world = this;
        var usernames = ['Steve', 'Billy', 'Dan', 'Jessica', 'Gorbatchov', 'Putin'];
        for (var u of usernames) {
            var o = this.getRandomOrder();
            this.lastOrder[u] = o;
        }

        async.each(usernames, function(username, callback) {
            world.placeOrderForUser(username, function(res) {
                callback();
            });
        }, function(err) {
            world.lastOrder['Dan'] = world.getRandomOrder();
            world.lastOrder['Steve'] = world.getRandomOrder();
            world.placeOrderForUser('Dan', function(res) {
                world.placeOrderForUser('Steve', function(res) {
                    callback();
                });
            });
        });
    });

    this.When(/^I cancel it$/, function(callback) {
        var world = this;
        world.cancelOrderForUser('Steve', function(res) {
            callback();
        });
    });

    this.When(/^I wait for (\d+) seconds$/, function(seconds, callback) {
        setTimeout(function() {
            callback();
        }, parseInt(seconds) * 1000);
    });

    this.When(/^I use an invalid command$/, function(callback) {
        var world = this;
        this.sendEmptyRequest(function(res) {
            world.lastResponse = JSON.parse(res);
            callback();
        });
    })

    /* ----------------------------- THEN ----------------------------- */

    this.Then(/^I should see my order$/, function(callback) {
        var username = 'Steve';
        var lastOrder = this.lastOrder[username];
        var world = this;
        this.getOrderForUser(username, function(res) {
            oRes = JSON.parse(res).text;
            world.compareToLastOrderForUser(username, oRes, function(equal) {
                assert(equal);
                callback();
            });
        });
    });

    this.Then(/^I should get default values$/, function(callback) {
        var username = 'Steve';

        var o = {
            username: username,
            main: 'BBQ',
            sideorder: 'Pommes',
            sauce: 'Aioli',
            drink: 'Pepsi',
            extra: null
        };

        var expected = this.convertOrderToString(o);

        this.getOrderForUser(username, function(res) {
            var actual = JSON.parse(res).text;
            assert.equal(expected, actual);
            callback();
        });
    });

    this.Then(/^I should see all orders$/, function(callback) {
        var world = this;
        this.getAllOrders(function(body) {
            var actualStr = JSON.parse(body).text;

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

    this.Then(/^I should not see my order$/, function(callback) {
        world = this;
        this.getOrderForUser('Steve', function(res) {
            var resStr = JSON.parse(res).text;
            assert.equal(resStr, 'No order found for username Steve');
            callback();
        });
    });

    this.Then(/^I should get an HTTP error (\d+) back$/, function(code, callback) {
        assert.equal(this.lastResponse.statusCode, code);
        callback();
    });

    this.Then(/^I should see the help text$/, function(callback) {
        assert.equal(this.helpText, this.lastResponse.text);
        callback();
    });
}