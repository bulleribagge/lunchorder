var myHooks = function (){
    this.Before(function (scenario, callback){
        this.slackRequest.token = process.env.SLACK_TOKEN;
        this.lastResponse = null;
        this.lastOrder = []; 
        this.wipedb(callback);
    });
};

module.exports = myHooks;