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
    
    toString(includeRestaurant)
    {
        var res = "*" + this.username + "*";
                res += " " + this.main;
                if(this.sideorder)
                {
                    res += " " + this.sideorder;
                }
                if(this.sauce)
                {
                    res += " " + this.sauce;
                }
                if(this.drink)
                {
                    res += " " + this.drink;
                }
                if(this.extra)
                {
                    res += " " + this.extra;
                }

                if(includeRestaurant)
                {
                    res += " at " + this.restaurant;
                }
                return res;
    } 
}

module.exports = Order;