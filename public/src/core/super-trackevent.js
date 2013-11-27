/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "core/eventmanager" ],
  function( EventManager ) {

  return function( superTrackEvent ) {

    var _id = superTrackEvent.id,
        _superTrackEvent = superTrackEvent,
        _isSuperTrackEvent = false,
        _isSubTrackEvent = false,
        _this = this,
        _subTrackEvents = {},
        _subTrackEventsAll = [],
        _allBackground = [
          "cornflowerblue",
          "yellowgreen",
          "orangered",
          "chocolate",
          "seagreen",
          "brown"
        ],
        _element,
        _parent,
        _background;

    Object.defineProperties( this, {
      id: {
        enumerable: true,
        get: function() {
          return _id;
        }
      },
      isSuperTrackEvent: {
        enumerable: true,
        get: function() {
          return _isSuperTrackEvent;
        },
        set: function(val) {
          _isSuperTrackEvent = val;
          if (val === true) {
            _isSubTrackEvent = false;
            _background = _allBackground[Math.floor(Math.random()*_allBackground.length)];
          } else {
            _this.subTrackEvents = {};
            _this.subTrackEventsAll = [];
            _this.removeAttrElement();
          }
        }
      },
      isSubTrackEvent: {
        enumerable: true,
        get: function() {
          return _isSubTrackEvent;
        },
        set: function(val) {
          _isSubTrackEvent = val;
          if (val === true) {
            _isSuperTrackEvent = false;
          } else {
            _parent = null;
            _this.removeAttrElement();
          }
        }
      },
      parent: {
        enumerable: true,
        get: function() {
          return _parent;
        }
      },
      background: {
        enumerable: true,
        get: function() {
          return _background;
        }
      },
      subTrackEvents: {
        enumerable: true,
        get: function(){
          return _subTrackEvents;
        }
      },
      selectAll: {
        enumerable: true,
        get: function(){
          return _subTrackEvents;
        },
        set: function( val ){
          _selected = val;
        }
      }
    });

    this.setBackgroundColor = function() {
      _background = _allBackground[Math.floor(Math.random()*_allBackground.length)];
    };
    this.setAttrElement = function(subTrackEvent) {
      subTrackEvent.view.element.setAttribute("super-track-event", _background);
    };
    this.removeAttrElement = function() {
      _subTrackEvent.view.element.removeAttribute("super-track-event");
    };

    /* SubTrackEvent */
    this.setSubTrackEvent = function( val, parent ) {
      _this.isSubTrackEvent = val;
      if (parent) {
        _parent = parent;
        _background = _parent.superTrackEvent.background;
      }
    };

    this.isSubTrackEventOf = function(parent) {
      if (!_parent) {
        return false
      }
      return _parent.id === parent.id;
    };

    /* SuperTrackEvent */
    this.setSuperTrackEvent = function( val ) {
      _this.isSuperTrackEvent = val;
      if (val === true) {
        this.setAttrElement(_superTrackEvent);
      }
    }

    this.addSubTrackEvent = function( trackEvent ) {
      if (!_subTrackEvents[trackEvent.id]) {
        _subTrackEventsAll.push(trackEvent);
        _subTrackEvents[trackEvent.id] = trackEvent;
        _this.setAttrElement(trackEvent);
      }
    };
    this.removeSubTrackEvent = function( trackEvent ) {
      trackEvent.superTrackEvent.setSubTrackEvent(false);
      delete _subTrackEvents[ trackEvent.id ];
      _subTrackEventsAll.splice( _subTrackEventsAll.indexOf( trackEvent ), 1 );
    };

    // when the trackevent is dropped somewhere else we need to verify
    // if this still belongs to the SuperTrackEvent.
    this.closeToSuperTrackEvent = function() {
      if (_parent) {
        return true;
      }
      return false;
    }

  }; //SuperTrackEvent
});
