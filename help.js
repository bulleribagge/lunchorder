function Help() { }

Help.placeOrderHelp = `*placeorder*: Places an order
*Usage*: /lunchorder placeorder -r "restaurant" -m "main dish" -d "drink" --so "side order" -s "sauce" -e "extra"
*Example*: /lunchorder placeorder -r "lillaoskar" -m "BBQ" --so "Pommes" -d "Pepsi" -s "Aioli" -e "Ingen lök"
*Example 2*: /lunchorder placeorder -r "newyork" -m "Kebabpizza" -d "Pepsi" -s "Kebabsås mild"

The -r flag and the -m flag are mandatory, the rest are optional.

If you wish to change your order, just place a new one.

New feature! Type /lunchorder placeorder --lo to repeat your last order. Isn't that neat?`;
                            
Help.getOrderHelp = `*getorder*: Gets your order
*Usage*: /lunchorder getorder`;
                            
Help.cancelOrderHelp = `*cancelorder*: Cancels your order
*Usage*: /lunchorder cancelorder`;

Help.getHelp = function(){
    return this.placeOrderHelp + '\n\n' + this.getOrderHelp + '\n\n' + this.cancelOrderHelp;
};

module.exports = Help;