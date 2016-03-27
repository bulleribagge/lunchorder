function Util() { }

Util.isEmpty = function(o) {
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

module.exports = Util;