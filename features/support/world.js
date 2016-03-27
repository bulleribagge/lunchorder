var pg = require('pg');
var request = require('request');

function World() {
    this.slackRequest = {
        token: '8oe5iPmwPnAMBcUGo5cRxl3n',
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

    this.lastOrder = [];

    this.getRandomOrder = function() {
        var mains = ['BBQ', 'Cheese', 'Vegetarian', 'Chicken', 'Mexican', 'Oskar'];
        var sideorders = ['Pommes', 'Wedges'];
        var sauces = ['Aioli', 'Bea'];
        var drinks = ['Pepsi', 'Pepsi Max', 'Zingo', 'Zingo Exotic'];
        var extra = ['Ingen lök', 'Ingen tomat', 'Ketchup', 'Extra lök'];

        var o = {
            main: this.getRandomFromArray(mains),
            sideorder: this.getRandomFromArray(sideorders),
            sauce: this.getRandomFromArray(sauces),
            drink: this.getRandomFromArray(drinks),
            extra: this.getRandomFromArray(extra)
        };

        return o;
    };

    this.getRandomFromArray = function(arr) {
        var n = Math.floor(Math.random() * arr.length);
        return arr[n];
    }

    this.buildOrderTextForUser = function(user) {
        var ot = 'placeorder';
        if (this.lastOrder[user].main && this.lastOrder[user].main != '') {
            ot += ' -m "' + this.lastOrder[user].main + '"';
        }

        if (this.lastOrder[user].sideorder && this.lastOrder[user].sideorder != '') {
            ot += ' --so "' + this.lastOrder[user].sideorder + '"';
        }

        if (this.lastOrder[user].sauce && this.lastOrder[user].sauce != '') {
            ot += ' -s "' + this.lastOrder[user].sauce + '"';
        }

        if (this.lastOrder[user].drink && this.lastOrder[user].drink != '') {
            ot += ' -d "' + this.lastOrder[user].drink + '"';
        }

        if (this.lastOrder[user].extra && this.lastOrder[user].extra != '') {
            ot += ' -e "' + this.lastOrder[user].extra + '"';
        }

        return ot;
    }

    this.wipedb = function(callback) {
        pg.connect(process.env.DB_URL, function(err, client) {
            if (err) throw err;
            client.query('DELETE FROM public."order";')
                .on('end', function() {
                    callback();
                });
        });
    };

    this.getOrderForUser = function(user, callback) {
        this.slackRequest.text = 'getorder';
        var data = this.slackRequest;
        this.slackRequest.user_name = user;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw error;
                }
            }
        );
    };

    this.placeOrderForUser = function(user, callback) {
        this.slackRequest.text = 'placeorder';
        this.slackRequest.text = this.buildOrderTextForUser(user);
        var data = this.slackRequest;
        this.slackRequest.user_name = user;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw error;
                }
            }
        );
    }

    this.getAllOrders = function(callback) {
        this.slackRequest.text = 'getorder -a';
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw error;
                }
            }
        )
    }

    this.cancelOrderForUser = function(user, callback) {
        this.slackRequest.text = 'cancelorder';
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw error;
                }
            }
        )
    }

    this.compareToLastOrderForUser = function(user, o, callback) {
        if (o.main == this.lastOrder[user].main && o.sideorder == this.lastOrder[user].sideorder &&
            o.sauce == this.lastOrder[user].sauce && o.drink == this.lastOrder[user].drink &&
            o.extra == this.lastOrder[user].extra) {
            callback(true);
        } else {
            callback(false);
        }
    }

    this.isEmpty = function(o) {
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = function() {
    this.World = World;
};