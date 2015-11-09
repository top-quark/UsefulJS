/**
 * Event handling
 * Author: Christopher Williams
 */

UsefulJS.Event = (function() {
    // Registered event map
    var _regMap = {}, _u = UsefulJS, __typ = _u._typeof;

    // ID resolver
    var _resolveId = function(elem, addFake) {
        switch (elem) {
            case _u.globalObject:
                return _u.globalObjectName;

            case document:
                return "__DOCUMENT__";

            default:
                break;
        }
        if (addFake && !elem.id) {
            // Fake up an ID
            elem.id = _u.uuid();
        }

        return elem.id;
    };

    // Central event dispatcher
    var _handler = function(evt) {
        // Usual: get the event
        if (!evt) {
            evt = window.event;
        }
        // Get event source and ttype
        var evtSrc = evt.target ? evt.target : evt.srcElement,
            evtType = evt.type;
        // If the event source is a text node, then we want the target's parent
        // element (clicking inside a textarea, for example, will fire off an
        // event with a text node as the event source)
        if (3 == evtSrc.nodeType) {
            evtSrc = evtSrc.parentNode;
        }

        // Because of the ways events propagate, the element that fired the
        // event may not be the one that the event was registered for
        var evtRoot = evtSrc;
        while (evtRoot) {
            var eId = _resolveId(evtRoot), cbM = _regMap[eId] || {},
                cbL = cbM[evtType] || [], n = cbL.length, 
                i, cbObj, ctx, f, cbRet;
            for (i = 0; i < n; i++) {
                cbObj = cbL[i];
                f = cbObj.f;
                ctx = cbObj.ctx;
                // Call the callback with the supplied context and the API
                // specified parameters
                try {
                    cbRet = f.call(ctx, evt, evtType, evtSrc, evtRoot);
                }
                catch(e) {
                    // Exception not caught in the handler - lose it!
                    cbL.splice(i, 1);
                    throw(e);
                }
                if (false === cbRet) {
                    // An explicit false return - stop the event
                    if ("cancelable" in evt) {
                        // DOM level 3
                        if (evt.cancelable) {
                            evt.stopPropagation();
                            evt.preventDefault();
                        }
                    }
                    else if ("cancelBubble" in evt) {
                        // Legacy event interface
                        evt.cancelBubble = false;
                        evt.returnValue = false;
                    }
                    // Don't make any more callbacks ourselves
                    break;
                }
            }
            if (n) {
                // Found our listener
                break;
            }
            // Try the next node up
            evtRoot = (evtRoot === _u.globalObject) ? null : evtRoot.parentNode;
        }
    };

    var ceSupport = ("CustomEvent" in _u.globalObject);

    // Emulates a custom event object
    var _event = function(type, target, props) {
        this.type = type;
        this.target = this.currentTarget = target;
        this.bubbles = false;
        this.cancelable = true;
        this.defaultPrevented = false;
        this.timestamp = ("now" in Date) ? Date.now() : (new Date()).getTime();
        this.stopPropagation = this.stopImmediatePropagation = function() {};
        this.preventDefault = function() {
            this.defaultPrevented = true;
        };
        // Bubbling phase
        this.eventPhase = 3;
        this.detail = props;
    };

    var _getElem = function(e) {
        return ("string" === __typ(e)) ? document.getElementById(e) : e;
    };
    
    var _reg = function(elem, eId, evtType, callback, ctx, domEvent) {
        if (!_regMap[eId][evtType]) {
            _regMap[eId][evtType] = [];
        }
        var cbL = _regMap[eId][evtType], n = cbL.length, i;
        // Check that this isn't a duplicate registration
        for (i = 0; i < n; i++) {
            if (cbL[i].f === callback && cbL[i].ctx === ctx) {
                // Yep
                return false;
            }
        }
        cbL.push( { f : callback, ctx : ctx } );
        if (domEvent && !n) {
            // First registration
            if ("addEventListener" in elem) {
                // DOM Level 2 event model
                elem.addEventListener(evtType, _handler, true);
            }
            else if ("attachEvent" in elem) {
                // Legacy event model
                elem.attachEvent("on" + evtType, _handler);
            }
        }
            
        return true;
    };
    
    var _dereg = function(elem, eId, evtType, callback, ctx) {
        if (!_regMap[eId][evtType]) {
            // Nothing registered
            return false;
        }
        var cbL = _regMap[eId][evtType], i, cbObj;
        var ret = false;
        for (i = cbL.length - 1; i >= 0; i--) {
            cbObj = cbL[i];
            if (cbObj.f === callback && cbObj.ctx === ctx) {
                // Remove it and we're done
                cbL.splice(i, 1);
                ret = true;
                break;
            }
        }
        if (0 === cbL.length) {
            if ("removeEventListener" in elem) {
                elem.removeEventListener(evtType, _handler, true);
            }
            else if ("detachEvent" in elem) {
                elem.detachEvent("on" + evtType, _handler);
            }
            delete(_regMap[eId][evtType]);
        }
        return ret;
    };

    return {
        /**
         * Event registration
         * @param elem {Object} The element for which you want to register
         *  an event, may be an element, a string (in which case
         *  document.getElementById will be called to resolve it), the document
         *  object or the window object; pass in nothing to register with the
         *  global object
         * @param evtType {String|Array} The event type(s) that you're interested in;
         *  should be specified as "click" rather than "onclick"
         * @param callback {Function} the callback for the event
         * @param ctx {Object} (optional) the "this" context for the callback
         * @param domEvent {Boolean} (optional) false to signify a dummy event,
         *  true to signify a DOM event; defaults to true when the global
         *  object is window
         * @return {Boolean} true if the event was successfully registered,
         *  false otherwise
         * NOTE: if the element does not have an ID, a random ID will be
         *  assigned to it; this is needed to lookup registered callback
         *  functions
         * Callback function should take the following form:
         *  function(evt, evtType, evtSrc, evtRoot)
         *  - evt is the Event object
         *  - evtType is the event type (one function may be registered for
         *    multiple event types)
         *  - evtSrc is the element that fired the event
         *  - evtRoot is the element that the listener was registered for
         *
         * Registration is not limited to DOM events; you may register a
         *  listener for any named "event" and then use the fire() method to
         *  send a custom event to any registered listeners
         */
        register : function(elem, evtType, callback, ctx, domEvent) {
            var _eT = __typ(evtType),
                _cT = __typ(callback);
            if ("string" === _eT) {
                evtType = [evtType];
                _eT = "array";
            }
            if (!("array" === _eT && evtType && "function" === _cT)) {
                // Bad parameters
                return false;
            }
            elem = _getElem(elem);
            if (!elem) {
                elem = _u.globalObject;
            }
            if (undefined === ctx) {
                ctx = null;
            }
            if (!_u.defined(domEvent)) {
                domEvent = "window" === _u.globalObjectName ? true : false;
            }
            var eId = _resolveId(elem, true);
            if (!_regMap[eId]) {
                _regMap[eId] = {};
            }        
            var ret = false, i;
            for (i = 0; i < evtType.length; i++) {
                if ("string" === __typ(evtType[i]) && 
                    _reg(elem, eId, evtType[i], callback, ctx, domEvent)) {
                    ret = true;
                }
            }
            return ret;
        },

        /**
         * Deregisters a previously registered event listener
         * @param elem {Object} The element whose events you want to stop
         *  listening to, may be an element, a string (in which case
         *  document.getElementById will be called to resolve it), the document
         *  object or the window object; defaults to the global object
         * @param evtType {String|Array} The event type that you're no longer
         *  interested in; should be specified as "click" rather than "onclick"
         * @param callback {Function} the callback previously registered for
         *  the event
         * @param ctx {Object} (optional) the "this" context for the callback
         * @return {Boolean} true if deregistration was successful
         */
        deregister : function(elem, evtType, callback, ctx) {
            var _eT = __typ(evtType),
                _cT = __typ(callback);
            if ("string" === _eT) {
                evtType = [evtType];
                _eT = "array";
            }
            if (!("array" === _eT && evtType && "function" === _cT)) {
                // Bad parameters
                return false;
            }
            elem = _getElem(elem);
            if (!elem) {
                elem = _u.globalObject;
            }
            if (undefined === ctx) {
                ctx = null;
            }
            var eId = _resolveId(elem);
            if (!(eId && _regMap[eId])) {
                // Nothing registered
                return false;
            }
            var ret = false, i;
            for (i = 0; i < evtType.length; i++) {
                if ("string" === __typ(evtType[i]) && 
                    _dereg(elem, eId, evtType[i], callback, ctx)) {
                    ret = true;
                }
            }
            return ret;
        },
        
        /**
         * Clears all handlers foe an ID
         */
        clear : function(elem) {
            elem = _getElem(elem);
            if (!elem) {
                elem = _u.globalObject;
            }
            var eId = _resolveId(elem), evtType;
            if (eId in _regMap) {
                for (evtType in _regMap[eId]) {
                    if ("removeEventListener" in elem) {
                        elem.removeEventListener(evtType, _handler, true);
                    }
                    else if ("detachEvent" in elem) {
                        elem.detachEvent("on" + evtType, _handler);
                    }
                }
                delete(_regMap[eId]);
            }
        },

        /**
         * Fires an event
         * @param type {String} the event type to fire
         * @param target {Object} the element from which this event will
         *  purportedly come
         * @param props {Object} custom properties of the event
         */
        fire : function(type, target, props) {
            if (!(type && "string" === __typ(type))) {
                return;
            }
            if ("object" !== __typ(props)) {
                props = {};
            }
            target = _getElem(target);
            if (!target) {
                target = _u.globalObject;
            }
            if (ceSupport) {
                try {
                    target.dispatchEvent(new CustomEvent(type,
                        { cancelable : true, detail : props }));
                    return;
                }
                catch(e) {
                    // Let's not try this again
                    ceSupport = false;
                }
            }
            // Let's do it ourselves
            _handler(new _event(type, target, props));
        }
    };
})();

