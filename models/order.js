"use strict"

class Order
{
    constructor(username, restaurant, main, sideorder, sauce, drink, extra)
    {
        this.date = '';
        this.restaurant = restaurant;
        this.username = username;
        this.main = main;
        this.sideorder = sideorder;
        this.sauce = sauce;
        this.drink = drink;
        this.extra = extra;
    }
    
    toString()
    {
        var res = "*" + this.username + "* " + this.main + " " + (this.sideorder ? this.sideorder : "") + " " + (this.sauce ? this.sauce : "") + " " + (this.drink ? this.drink : "")  + " " + (this.extra ? this.extra : "");
        return res;
    } 
}

module.exports = Order;