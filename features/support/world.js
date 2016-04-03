var pg = require('pg');
var request = require('request');

function World() {
    
    this.helpText = '*placeorder*: Places an order\n*Usage*: placeorder -m \"main dish\" -d \"drink\" --so \"side order\" -s \"sauce\" -e \"extra\"\n*Example*: placeorder -m \"BBQ\" --so \"Pommes\" -d \"Pepsi\" -s \"Aioli\" -e \"Ingen lök\"\nAny values not supplied will be default according to:\n-m = \"BBQ\" -d = \"Pepsi\" -s \"Aioli\" --so \"Pommes\"\nIf you wish to change your order, just place a new one.\n\n*getorder*: Gets your order\n*Usage*: getorder\n\n*cancelorder*: Cancels your order\n*Usage*: cancelorder';
    
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

    this.getRandomOrder = function() {
        var mains = ['BBQ', 'Cheese', 'Vegetarian', 'Chicken', 'Mexican', 'Oskar'];
        var sideorders = ['Pommes', 'Wedges'];
        var sauces = ['Aioli', 'Bea'];
        var drinks = ['Pepsi', 'Pepsi Max', 'Zingo', 'Zingo Exotic'];
        var extra = ['Ingen lök', 'Ingen tomat', 'Ketchup', 'Extra lök', ''];

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

    this.buildOrderTextForUser = function(username) {
        var ot = 'placeorder';
        if (this.lastOrder[username].main && this.lastOrder[username].main != '') {
            ot += ' -m "' + this.lastOrder[username].main + '"';
        }

        if (this.lastOrder[username].sideorder && this.lastOrder[username].sideorder != '') {
            ot += ' --so "' + this.lastOrder[username].sideorder + '"';
        }

        if (this.lastOrder[username].sauce && this.lastOrder[username].sauce != '') {
            ot += ' -s "' + this.lastOrder[username].sauce + '"';
        }

        if (this.lastOrder[username].drink && this.lastOrder[username].drink != '') {
            ot += ' -d "' + this.lastOrder[username].drink + '"';
        }

        if (this.lastOrder[username].extra && this.lastOrder[username].extra != '') {
            ot += ' -e "' + this.lastOrder[username].extra + '"';
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

    this.sendEmptyRequest = function(callback) {
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
        );
    }

    this.getOrderForUser = function(username, callback) {
        this.slackRequest.text = 'getorder';
        var data = this.slackRequest;
        this.slackRequest.user_name = username;
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

    this.placeOrderForUser = function(username, callback) {
        _this = this;
        this.slackRequest.text = 'placeorder';
        this.slackRequest.text = this.buildOrderTextForUser(username);
        var data = this.slackRequest;
        this.slackRequest.user_name = username;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    _this.lastResponse = response;
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

    this.cancelOrderForUser = function(username, callback) {
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

    this.compareToLastOrderForUser = function(username, res, callback) {
        this.lastOrder[username].username = username;
        var expected = this.convertOrderToString(this.lastOrder[username]);
        if(expected == res){
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
    
    this.convertOrderToString = function(o)
    {
        var res = "*" + o.username + "* " + o.main + " " + o.sideorder + " " + o.sauce + " " + o.drink  + " " + (o.extra == null ? "" : o.extra);
        return res;
    }
}

module.exports = function() {
    this.World = World;
};