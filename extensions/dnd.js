/**
 * Drag and drop support
 * Author: Christopher Williams
 */

UsefulJS.DnD = (function() {
    "use strict";
    var _u = UsefulJS, _evt = UsefulJS.Event, __typ = _u._typeof, 
        dragging = false, dragEl = null, clientX = null, clientY = null,
        eX = null, eY = null, currX = null, currY = null, maxX = null, maxY = null,
        _pCallback = null, _ctx = null, _registered = false;
        
    // Mousedown and touchstart handler registries
    var md = {};
    
    var _getElem = function(e) {
        return ("string" === __typ(e)) ? document.getElementById(e) : e;
    };
    
    // Calculates the offset of an element from document.body
    var _offsFromBody = function(e) {
        if (e === document.body) {
            return [0, 0];
        }
        var t = 0, l = 0, _t, _l;
        do {
            _t = e.offsetTop;
            _l = e.offsetLeft;
            if (!isNaN(_t)) {
                t += _t;
            }
            if (!isNaN(_l)) {
                l += _l;
            }
        }
        while (e !== document.body && (e = e.offsetParent));
        return [l, t];
    };
    
    // Offset of an element from another element
    var _eOffs = function(e, _e) {        
        var c1 = _offsFromBody(e), c2 = _offsFromBody(_e);
        return [c1[0] - c2[0], c1[1] - c2[1]];
    };
    
    var _startFn = function(evt, eSrc, eReg, eBound, startCallback, pCallback, ctx) {
        // Get the x and y offset of eReg from eBound
        var xy = _eOffs(eReg, eBound);
        dragEl = startCallback ? startCallback.call(ctx, evt, eSrc, eReg) : eReg;
        if (!dragEl) {
            return;
        }
        eX = parseInt(dragEl.style.left, 10);
        if (isNaN(eX)) {
            eX = xy[0];
        }
        eY = parseInt(dragEl.style.top, 10);
        if (isNaN(eY)) {
            eY = xy[1];
        }
        maxX = eBound.clientWidth - dragEl.offsetWidth; 
        maxY = eBound.clientHeight - dragEl.offsetHeight;

        // Ensure that positioning is absolute
        dragEl.style.position = "absolute";
        dragging = true;
        
        // Save callback references
        _pCallback = pCallback;
        _ctx = ctx;
    };
    
    // Move handler
    var _mmFn = function(evt, eType, eSrc, eReg) {
        if (!dragging) {
            return;
        }
        // Get change in mouse position since last time
        var cX, cY;
        if ("touches" in evt) {
            cX = evt.touches[0].clientX;
            cY = evt.touches[0].clientY;
        }
        else {
            cX = evt.clientX;
            cY = evt.clientY;
        }
        var dx = cX - currX, dy = cY - currY;
        // Update the element position
        eX = Math.min(Math.max(eX + dx, 0), maxX);
        eY = Math.min(Math.max(eY + dy, 0), maxY);
        dragEl.style.left = eX + "px";
        dragEl.style.top = eY + "px";
        _pCallback.call(_ctx, evt, eX, eY, dragEl, false);
        currX = cX;
        currY = cY;
    };
    
    // Mouseup handler
    var _muFn = function(evt, eType, eSrc, eReg) {
        if (!dragging) {
            return;
        }
        var eId = dragEl.id;                
        if (_pCallback) {
            _pCallback.call(_ctx, evt, eX, eY, dragEl, true);
        }
        dragging = false;
        dragEl = currX = currY = _pCallback = _ctx = null;
    };
    
    // Legacy selection start handler
    var _ssFn = function() {
        return !dragging;
    };
    
    return {
        /**
         * Gets the offset (x and y) of an element from an element in its parent chain
         * @param eQ the element to query 
         * @param eRel the element to measure against
         * @return the x and y offsets in a two-element Array
         */
        elementOffset : function(eQ, eRel) {
            var e = _getElem(eQ), _e = _getElem(eRel);
            if (!e) {
                throw new TypeError("eQ is not an element");
            }
            if (!_e) {
                _e = document.body;
            }
            return _eOffs(e, _e);
        },
    
        /**
         * Registers an element for drag and drop
         * @param e the element to register
         * @param eBound the bounding element; defaults to document.body
         * @param startCallback callback function when dragging starts
         * @param pCallback callback function when dragging ends
         */
        register : function(e, eBound, startCallback, pCallback, ctx) {
            e = _getElem(e);
            eBound = _getElem(eBound);
            if ("element" !== __typ(e)) {
                throw new TypeError("e is not an element");
            }
            if ("element" !== __typ(eBound)) {
                eBound = document.body;
            }
            if (md[e.id]) {
                // Previously registered
                return;
            }
            
            // Mouse down handler
            var mdFn = function(evt, eType, eSrc, eReg) {
                // Only left mouse button should initiate drag
                if (("buttons" in evt && evt.buttons !== 1) || 
                    ("button" in evt && evt.button === 2)) {
                    return;    
                }
                var cX, cY;
                if ("touches" in evt) {
                    cX = evt.touches[0].clientX;
                    cY = evt.touches[0].clientY;
                }
                else {
                    cX = evt.clientX;
                    cY = evt.clientY;
                }
                
                _startFn(evt, eSrc, eReg, eBound, startCallback, pCallback, ctx);
                currX = cX;
                currY = cY;
                // Don't begin text element selection
                return false;
            };
            
            // Allow mouse and touch events
            _evt.register(e, ["mousedown", "touchstart"], mdFn, _u.DnD);
            if (!_registered) {
                // Add body handlers
                var _b = document.body;
                _evt.register(_b, ["mousemove", "touchmove"], _mmFn, _u.DnD);
                _evt.register(_b, ["mouseup", "touchend"], _muFn, _u.DnD);
                // Just in case!
                _evt.register(_b, "selectstart", _ssFn);
                _registered = true;
            }    
            md[e.id] = mdFn;
        },
        
        deregister : function(e) {
            e = _getElem(e);
            if ("element" !== __typ(e)) {
                throw new TypeError("e is not an element");
            }
            _evt.deregister(e, ["mousedown", "touchstart"], md[e.id], _u.DnD);
            delete(md[e.id]);
        }
    };
})();

