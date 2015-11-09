/**
 * Unit conversion module
 * Author: Christopher Williams.
 */
 
(function() {
    "use strict";
    var _u = UsefulJS;
    
    // Currency conversion routines
    var _c = {
        base : "",
        rates : {}
    };
    // Loads currency conversion table
    _c.load = _u.bindFunction(function(base, rates) {
        this.base = base;
        this.rates = _u.clone(rates);
        this.rates[base] = 1;
        return this;
    }, _c);
    // Conversion function
    _c.convert = _u.bindFunction(function(v) {
        v = Number(v);
        if (!isFinite(v)) {
            throw new TypeError("Value to convert must be a finite number");
        }
        var _a = arguments, _from = _a[1] || this.base, _to = _a[2] || this.base,
            _r = this.rates, rF = _r[_from], rT = _r[_to];
        if (!((_from in _r) && (_to in _r))) {
            throw new RangeError("Unknown currency code");
        }
        return v * rT / rF;
    }, _c);
    // Chaining
    _c.cnv = _u.bindFunction(function(v) {
        this.v = v;
        return this;
    }, _c);
    _c.from = _u.bindFunction(function(f) {
        this.f = f;
        return this;
    }, _c);
    _c.to = _u.bindFunction(function(t) {
        return this.convert(this.v, this.f, t);
    }, _c);
    
    _u.Currency = _c;
})();