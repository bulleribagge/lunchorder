function Help() { }

Help.prototype.placeOrderHelp = `*placeorder*: Places an order
                            *Usage*: placeorder -m "main dish" -d "drink" --so "side order" -s "sauce" -e "extra"
                            *Example*: placeorder -m "BBQ" --so "Pommes" -d "Pepsi" -s "Aioli" -e "Ingen lök"
                            Any values not supplied will be default according to:
                            -m = "BBQ" -d = "Pepsi" -s "Aioli" --so "Pommes"
                            If you wish to change your order, just place a new one.`;
                            
Help.prototype.getOrderHelp = `*getorder*: Gets your order
                            *Usage*: getorder`
                            
Help.prototype.cancelOrderHelp = `*cancelorder*: Cancels your order
                            *Usage*: cancelorder`

Help.prototype.getHelp = function(){
    return this.placeOrderHelp + '\n' + this.getOrderHelp + '\n' + this.cancelOrderHelp;
}

module.exports = Help;