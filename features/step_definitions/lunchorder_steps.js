var request = require('request');
var assert = require('assert');

module.exports = function() {

    this.When(/^I order lunch without parameters$/, function(callback) {
        this.placeOrder(function(res) {
            assert(res.indexOf('order succesfully saved: ') != -1);
            callback();
        });
    });

    this.When(/^I order lunch$/, function(callback) {
        this.lastOrder.main = 'Cheese';
        this.lastOrder.sideorder = 'Wedges';
        this.lastOrder.sauce = 'Bea';
        this.lastOrder.drink = 'Pepsi Max';
        this.lastOrder.extra = 'Extra lök';

        this.placeOrder(function(res) {
            assert(res.indexOf('order succesfully saved: ') != -1);
            callback();
        });
    });

    this.When(/^I order lunch twice$/, function(callback) {
        var world = this;
        var lastOrder = this.lastOrder;

        lastOrder.main = 'Cheese';
        lastOrder.sideorder = 'Wedges';
        lastOrder.sauce = 'Bea';
        lastOrder.drink = 'Pepsi Max';
        lastOrder.extra = 'Extra lök';

        this.placeOrder(function() {
            lastOrder.drink = 'Pepsi';

            setTimeout(function(){world.placeOrder(function(res) {
                callback();
            })}, 1100);
        });
    });

    this.Then(/^I should see my order$/, function(callback) {
        var orderText = 'getorder';

        this.slackRequest.text = orderText;
        var lastOrder = this.lastOrder;
        var world = this;

        this.getOrder(function(res) {
            world.compareToLastOrder(res, function(equal) {
                assert(equal);
                callback();
            });
        });
    });

    this.Then(/^I should get default values$/, function(callback) {
        var orderText = 'getorder';

        this.slackRequest.text = orderText;

        this.getOrder(function(res) {
            console.log(o);
            var o = JSON.parse(res);
            assert.equal(o.main, 'BBQ');
            assert.equal(o.sideorder, 'Pommes');
            assert.equal(o.sauce, 'Aioli');
            assert.equal(o.drink, 'Pepsi');
            assert.equal(o.extra, null);
            callback();
        });
    });
}