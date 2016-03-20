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

    this.lastOrder = {
        main: '',
        sideorder: '',
        sauce: '',
        drink: '',
        extra: ''
    }

    this.buildOrderText = function(){
        var ot = 'placeorder';
        if(this.lastOrder.main && this.lastOrder.main != '')
        {
            ot += ' -m "' + this.lastOrder.main + '"';
        }
        
        if(this.lastOrder.sideorder && this.lastOrder.sideorder != '')
        {
            ot += ' --so "' + this.lastOrder.sideorder + '"';
        }
        
        if(this.lastOrder.sauce && this.lastOrder.sauce != '')
        {
            ot += ' -s "' + this.lastOrder.sauce + '"';
        }
        
        if(this.lastOrder.drink && this.lastOrder.drink != '')
        {
            ot += ' -d "' + this.lastOrder.drink + '"';
        }
        
        if(this.lastOrder.extra && this.lastOrder.extra != '')
        {
            ot += ' -e "' + this.lastOrder.extra + '"';
        }
        
        return ot;
    }

    this.wipedb = function(callback) {
        pg.connect(process.env.DB_URL, function(err, client) {
            if (err) throw err;
            client.query('DELETE FROM public."order";')
            .on('end', function(){
                callback();
            });
        });
    };
    
    this.getOrder = function(callback){
        
        var data = this.slackRequest;
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                }else{
                    throw error;
                }
            }
        );
    };
    
    this.placeOrder = function(callback){
        
        this.slackRequest.text = this.buildOrderText();
        
        var data = this.slackRequest;
        
        request.post(
            'http://localhost:3000',
            { form: data },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(body);
                }else{
                    throw error;
                }
            }
        );
    }
    
    this.compareToLastOrder = function(res, callback){
        var o = JSON.parse(res);
        if(o.main == this.lastOrder.main && o.sideorder == this.lastOrder.sideorder &&
        o.sauce == this.lastOrder.sauce && o.drink == this.lastOrder.drink &&
        o.extra == this.lastOrder.extra)
        {
            callback(true);
        }else{
            callback(false);
        }
    }
}

module.exports = function() {
    this.World = World;
};