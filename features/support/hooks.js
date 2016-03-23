var myHooks = function (){
    this.Before(function (scenario, callback){
        this.lastOrder = []; 
        this.wipedb(callback);
    });
}

module.exports = myHooks;