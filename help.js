function Help() { }

Help.prototype.placeOrderHelp = `\n*placeorder*: Places an order
                            \n*Usage*: placeorder -m "main dish" -d "drink" --so "side order" -s "sauce" -e "extra"
                            \n*Example*: placeorder -m "BBQ" --so "Pommes" -d "Pepsi" -s "Aioli" -e "Ingen lök"
                            \nAny values not supplied will be default according to:
                            \n-m = "BBQ" -d = "Pepsi" -s "Aioli" --so "Pommes"
                            \nIf you wish to change your order, just place a new one.`;
                            
Help.prototype.getOrderHelp = `\n*getorder*: Gets your order
                            \n*Usage*: getorder`
                            
Help.prototype.cancelOrderHelp = `\n*cancelorder*: Cancels your order
                            \n*Usage*: cancelorder`

Help.prototype.getHelp = function(){
    return this.placeOrderHelp + '\n' + this.getOrderHelp + '\n' + this.cancelOrderHelp;
}

module.exports = Help;