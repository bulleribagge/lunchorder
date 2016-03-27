var request = require('request');
var assert = require('assert');
var async = require('async');

module.exports = function() {
    /* ----------------------------- GIVEN ---------------------------- */
    
    this.Given(/^I have an invalid slack token$/, function(callback){
        this.slackRequest.token = 'invalid_token';
        callback();
    });
    
    /* ----------------------------- WHEN ----------------------------- */
    this.When(/^I order lunch without parameters$/, function(callback) {
        var user = 'Steve';
        this.lastOrder[user] = {};
        this.placeOrderForUser(user, function(res) {
            callback();
        });
    });

    this.When(/^I order lunch$/, function(callback) {
        var user = 'Steve';
        var lastOrder = this.lastOrder[user] = {
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        }

        this.placeOrderForUser(user, function(res) {
            callback();
        });
    });

    this.When(/^I order lunch twice$/, function(callback) {
        var user = 'Steve';
        var world = this;
        this.lastOrder[user] = {
            main: 'Cheese',
            sideorder: 'Wedges',
            sauce: 'Bea',
            drink: 'Pepsi Max',
            extra: 'Extra lök'
        }

        this.placeOrderForUser(user, function() {
            world.lastOrder[user].drink = 'Pepsi';
            world.placeOrderForUser(user, function(res) {
                callback();
            });
        });
    });

    this.When(/^many people have ordered$/, function(callback) {
        var world = this;
        var users = ['Steve', 'Billy', 'Dan', 'Jessica', 'Gorbatchov', 'Putin'];
        for (var u of users) {
            var o = this.getRandomOrder();
            this.lastOrder[u] = o;
        }

        async.each(users, function(user, callback) {
            world.placeOrderForUser(user, function(res) {
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
    
    this.When(/^I wait for (\d+) seconds$/, function(seconds, callback){
       setTimeout(function(){
           callback();
       }, parseInt(seconds) * 1000); 
    });

    /* ----------------------------- THEN ----------------------------- */

    this.Then(/^I should see my order$/, function(callback) {
        var user = 'Steve';
        var lastOrder = this.lastOrder[user];
        var world = this;
        this.getOrderForUser(user, function(res) {
            var o = JSON.parse(res);
            world.compareToLastOrderForUser(user, o, function(equal) {
                assert(equal);
                callback();
            });
        });
    });

    this.Then(/^I should get default values$/, function(callback) {
        var user = 'Steve';
        this.getOrderForUser(user, function(res) {
            var o = JSON.parse(res);
            assert.equal(o.main, 'BBQ');
            assert.equal(o.sideorder, 'Pommes');
            assert.equal(o.sauce, 'Aioli');
            assert.equal(o.drink, 'Pepsi');
            assert.equal(o.extra, null);
            callback();
        });
    });

    this.Then(/^I should see all orders$/, function(callback) {
        var world = this;
        this.getAllOrders(function(body) {
            var orders = JSON.parse(body);
            async.each(orders, function(order, callback) {
                world.compareToLastOrderForUser(order.user, order, function(equal) {
                    assert(equal);
                    callback();
                });
            }, function() {
                callback();
            });
        });
    });

    this.Then(/^I should not see my order$/, function(callback) {
        world = this;
        this.getOrderForUser('Steve', function(res) {
            var o = JSON.parse(res);
            assert(world.isEmpty(o));
            callback();
        });
    });
    
    this.Then(/^I should get an HTTP error (\d+) back$/, function(code, callback){
        assert.equal(this.lastResponse.statusCode, code);
        callback();
    })
}