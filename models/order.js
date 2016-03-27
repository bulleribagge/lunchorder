"use strict"

class Order
{
    constructor(user, main, sideorder, sauce, drink, extra)
    {
        this.date = '';
        this.user = user;
        this.main = main == null ? 'BBQ' : main;
        this.sideorder = sideorder == null ? 'Pommes' : sideorder;
        this.sauce = sauce == null ? 'Aioli' : sauce;
        this.drink = drink == null ? 'Pepsi' : drink;
        this.extra = extra;
    }
    
    toString()
    {
        return "*" + this.user + "* " + this.main + " " + this.sideorder + " " + this.sauce + " " + this.drink == null ? "" : this.extra;
    } 
}

module.exports = Order;