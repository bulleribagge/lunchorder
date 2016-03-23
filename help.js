function Help() { }

Help.prototype.placeOrderHelp = `placeorder: Places an order
                            </br>Usage: placeorder -m "main dish" -d "drink" --so "side order" -s "sauce" -e "extra"
                            </br>Example: placeorder -m "BBQ" --so "Pommes" -d "Pepsi" -s "Aioli" -e "Ingen lök"
                            </br>Any values not supplied will be default according to:
                            </br>-m = "BBQ" -d = "Pepsi" -s "Aioli" --so "Pommes"
                            </br>If you wish to change your order, just place a new one.`;
                            
Help.prototype.getOrderHelp = `getorder: Gets your order
                            </br>Usage: getorder`
                            
Help.prototype.cancelOrderHelp = `cancelorder: Cancels your order
                            </br>Usage: cancelorder`

Help.prototype.getHelp = function(){
    return this.placeOrderHelp + '</br></br>' + this.getOrderHelp + '</br></br>' + this.cancelOrderHelp;
}

module.exports = Help;