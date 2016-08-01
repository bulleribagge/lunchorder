var pg = require('pg');
var request = require('request');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

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

    this.getRandomFromArray = function(arr) {
        var n = Math.floor(Math.random() * arr.length);
        return arr[n];
    };

    this.buildOrderTextForUser = function(username) {
        var ot = 'placeorder';
        
        if(this.lastOrder[username].restaurant && this.lastOrder[username].restaurant !== ''){
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

        return ot;
    };

    this.wipedb = function(callback) {
        if(process.env.DB_ENGINE == 'mssql')
        {
            var con = new Connection({
                userName: process.env.DB_USER,
                password: process.env.DB_PASS,
                server: process.env.DB_HOST,
                options: {
                    database: process.env.DB_NAME
                }
            });
            
            con.on('connect', function(err){
                query = new Request("DELETE FROM orders;", function(err, rowCount){
                   if(err)
                   {
                       throw err;
                   }else{
                       callback();
                   }
                });
                
                con.execSql(query);
            });
        }else if(process.env.DB_ENGINE == 'postgre')
        {
            pg.connect(process.env.DB_URL2, function(err, client) {
                if (err) throw err;
                client.query('DELETE FROM public."orders";')
                    .on('end', function() {
                        callback();
                    });
            });
        }
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
    };

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
                    throw 'Something went wrong';
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

        request.post('http://localhost:3000', { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    _this.lastResponse = response;
                    throw error;
                }
            }
        );
    };

    this.getAllOrders = function(restaurant, callback) {
        this.slackRequest.text = 'getorder -a -r ' + restaurant;
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    throw 'Something went wrong!';
                }
            }
        );
    };

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
                    throw 'Something went wrong';
                }
            }
        );
    };

    this.compareToLastOrderForUser = function(username, res, callback) {
        this.lastOrder[username].username = username;
        var expected = this.convertOrderToString(this.lastOrder[username]);
        if(expected == res){
            callback(true);
        } else {
            console.log('expected: ' + expected + '\r\n' + 'actual: ' + res);
            callback(false);
        }
    };

    this.isEmpty = function(o) {
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    };
    
    this.convertOrderToString = function(o)
    {
        var res = "*" + o.username + "* " + o.main.toLowerCase() + " " + o.sideorder + " " + o.sauce + " " + o.drink  + " " + (o.extra === null ? "" : o.extra);
        return res;
    };
}

module.exports = function() {
    this.World = World;
};