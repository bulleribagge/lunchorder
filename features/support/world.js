var pg = require('pg');
var request = require('request');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

function World() {

    this.helpText = `*placeorder*: Places an order
*Usage*: /lunchorder placeorder -r "restaurant" -m "main dish" -d "drink" --so "side order" -s "sauce" -e "extra"
*Example*: /lunchorder placeorder -r "lillaoskar" -m "BBQ" --so "Pommes" -d "Pepsi" -s "Aioli" -e "Ingen lök"
*Example 2*: /lunchorder placeorder -r "newyork" -m "Kebabpizza" -d "Pepsi" -s "Kebabsås mild"

The -r flag and the -m flag are mandatory, the rest are optional.

If you wish to change your order, just place a new one.

New feature! Type /lunchorder placeorder --lo to repeat your last order. Isn't that neat?

*getorder*: Gets your order
*Usage*: /lunchorder getorder

*cancelorder*: Cancels your order
*Usage*: /lunchorder cancelorder`;

    this.slackRequest = {
        token: 'testing123',
        team_id: 'T0001',
        team_domain: 'example',
        channel_id: 'C2147483705',
        channel_name: 'test',
        user_id: 'U2147483697',
        user_name: 'Steve',
        command: '/weather',
        text: '',
        response_url: 'https://hooks.slack.com/commands/1234/5678'
    };

    this.lastResponse = null;

    this.lastOrder = [];

    this.getRandomOrder = function () {
        var restaurants = ['lillaoskar', 'newyork'];
        var mains = ['bbq', 'cheese', 'vegetarian', 'chicken', 'mexican', 'oskar'];
        var sideorders = ['Pommes', 'Wedges'];
        var sauces = ['Aioli', 'Bea'];
        var drinks = ['Pepsi', 'Pepsi Max', 'Zingo', 'Zingo Exotic'];
        var extra = ['Ingen lök', 'Ingen tomat', 'Ketchup', 'Extra lök'];

        var o = {
            restaurant: this.getRandomFromArray(restaurants),
            main: this.getRandomFromArray(mains),
            sideorder: this.getRandomFromArray(sideorders),
            sauce: this.getRandomFromArray(sauces),
            drink: this.getRandomFromArray(drinks),
            extra: this.getRandomFromArray(extra)
        };

        return o;
    };

    this.getRandomFromArray = function (arr) {
        var n = Math.floor(Math.random() * arr.length);
        return arr[n];
    };

    this.buildOrderTextForUser = function (username) {
        var ot = 'placeorder';

        if (this.lastOrder[username].restaurant && this.lastOrder[username].restaurant !== '') {
            ot += ' -r "' + this.lastOrder[username].restaurant + '"';
        }

        if (this.lastOrder[username].main && this.lastOrder[username].main !== '') {
            ot += ' -m "' + this.lastOrder[username].main + '"';
        }

        if (this.lastOrder[username].sideorder && this.lastOrder[username].sideorder !== '') {
            ot += ' --so "' + this.lastOrder[username].sideorder + '"';
        }

        if (this.lastOrder[username].sauce && this.lastOrder[username].sauce !== '') {
            ot += ' -s "' + this.lastOrder[username].sauce + '"';
        }

        if (this.lastOrder[username].drink && this.lastOrder[username].drink !== '') {
            ot += ' -d "' + this.lastOrder[username].drink + '"';
        }

        if (this.lastOrder[username].extra && this.lastOrder[username].extra !== '') {
            ot += ' -e "' + this.lastOrder[username].extra + '"';
        }

        if (this.lastOrder[username].orderFor && this.lastOrder[username].orderFor !== '') {
            ot += ' -u "' + this.lastOrder[username].orderFor + '"';
        }

        return ot;
    };

    this.wipedb = function (callback) {
        if (process.env.DB_ENGINE == 'mssql') {
            var con = new Connection({
                userName: process.env.DB_USER,
                password: process.env.DB_PASS,
                server: process.env.DB_HOST,
                options: {
                    database: process.env.DB_NAME
                }
            });

            con.on('connect', function (err) {
                query = new Request("DELETE FROM orders;", function (err, rowCount) {
                    if (err) {
                        throw err;
                    } else {
                        callback();
                    }
                });

                con.execSql(query);
            });
        } else if (process.env.DB_ENGINE == 'postgre') {

            var client = new pg.Client({
                user: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                host: process.env.DB_HOST
            });

            client.query('DELETE FROM public."orders";')
                .on('end', function () {
                    callback();
                });
        }
    };

    this.sendEmptyRequest = function (callback) {
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw error;
                }
            }
        );
    };

    this.getOrderForUser = function (username, callback) {
        this.slackRequest.text = 'getorder';
        var data = this.slackRequest;
        this.slackRequest.user_name = username;
        request.post(
            'http://localhost:3000',
            { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw 'Something went wrong';
                }
            }
        );
    };

    this.placeOrderForUser = function (username, callback) {
        var world = this;
        this.slackRequest.text = 'placeorder';
        this.slackRequest.text = this.buildOrderTextForUser(username);
        var data = this.slackRequest;
        this.slackRequest.user_name = username;

        request.post('http://localhost:3000', { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    world.lastResponse = response;
                    throw error;
                }
            }
        );
    };

    this.placeOrderWithloFlagForUser = function (username, callback) {
        var world = this;
        this.slackRequest.text = 'placeorder --lo';
        var data = this.slackRequest;
        this.slackRequest.user_name = username;

        request.post('http://localhost:3000', { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    world.lastResponse = response;
                    throw error;
                }
            }
        );
    };

    this.placeOrderForOtherUser = function (username, orderFor, callback) {
        var world = this;
        this.slackRequest.text += this.buildOrderTextForUser(username, orderFor);
        var data = this.slackRequest;
        this.slackRequest.user_name = username;

        request.post('http://localhost:3000', { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    world.lastResponse = response;
                    throw error;
                }
            }
        );
    };

    this.getAllOrders = function (restaurant, callback) {
        this.slackRequest.text = 'getorder -a -r ' + restaurant;
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw 'Something went wrong!';
                }
            }
        );
    };

    this.cancelOrderForUser = function (username, callback) {
        this.slackRequest.text = 'cancelorder';
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw 'Something went wrong';
                }
            }
        );
    };

    this.compareToLastOrderForUser = function (username, res, includeRestaurant, orderedBy, callback) {
        var world = this;
        var expected = ""; 

        if(orderedBy && orderedBy !== "")
        {
            for(var o in this.lastOrder)
            {
                if(world.lastOrder[o].orderFor == username && o == orderedBy)
                {
                    expected = world.convertOrderToString(world.lastOrder[o], world.lastOrder[o].orderFor, true);
                }
            }
        }else{
            expected = world.convertOrderToString(world.lastOrder[username], username, true);
        }

        if (expected == res) {
            callback(true);
        } else {
            console.log('expected: ' + expected + '\r\n' + 'actual: ' + res);
            callback(false);
        }
    };

    this.isEmpty = function (o) {
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    };

    this.convertOrderToString = function (o, username, includeRestaurant) {
        var res = "*" + (username ? username : o.username) + "* " + o.main.toLowerCase() + (o.sideorder ? " " + o.sideorder : "") + (o.sauce ? " " + o.sauce : "") + (o.drink ? " " + o.drink : "") + (o.extra ? " " + o.extra : "") + (includeRestaurant ? " at " + o.restaurant : "");
        return res;
    };

    this.createOldOrder = function (username, order, callback) {
        if (process.env.DB_ENGINE == 'mssql') {
            var con = new Connection({
                userName: process.env.DB_USER,
                password: process.env.DB_PASS,
                server: process.env.DB_HOST,
                options: {
                    database: process.env.DB_NAME
                }
            });

            con.on('connect', function (err) {
                query = new Request('INSERT INTO orders (username, restaurant, main, sideorder, sauce, drink, extra, canceled, createdAt, updatedAt) VALUES (@username, @restaurant, @main, @sideorder, @sauce, @drink, @extra, @canceled, @createdat, @updatedat)', function (err, rowCount) {
                    if (err) {
                        throw err;
                    } else {
                        callback();
                    }
                });

                query.addParameter('username', TYPES.VarChar, username);
                query.addParameter('restaurant', TYPES.VarChar, order.restaurant);
                query.addParameter('main', TYPES.VarChar, order.main);
                query.addParameter('sideorder', TYPES.VarChar, order.sideorder);
                query.addParameter('sauce', TYPES.VarChar, order.sauce);
                query.addParameter('drink', TYPES.VarChar, order.drink);
                query.addParameter('extra', TYPES.VarChar, order.extra);
                query.addParameter('canceled', TYPES.Bit, false);
                query.addParameter('createdat', TYPES.DateTime2, "2016-08-23 20:55:31.0000000");
                query.addParameter('updatedat', TYPES.DateTime2, "2016-08-23 20:55:31.0000000");

                con.execSql(query);
            });
        } else if (process.env.DB_ENGINE == 'postgre') {
            var client = new pg.Client({
                user: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PASS,
                port: process.env.DB_PORT,
                host: process.env.DB_HOST
            });

            client.query({
                text: 'INSERT INTO orders VALUES (username = $1, main = $2, sideorder = $3, sauce = $4, drink = $5, extra = $6, canceled = FALSE, createdAt = "2016-08-19 08:46:27.948+00")',
                values: [username, order.main, order.sideorder, order.sauce, order.drink, order.extra]
            }).on('end', function () {
                callback();
            });
        }

    }
}

module.exports = function () {
    this.World = World;
};