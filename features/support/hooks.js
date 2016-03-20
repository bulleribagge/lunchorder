var myHooks = function (){
    this.Before(function (scenario, callback){
        this.wipedb(callback);
    });
}

module.exports = myHooks;