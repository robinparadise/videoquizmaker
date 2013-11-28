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
          "yellowgreen", "chocolate", "seagreen", "brown"
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
            _this.setSubTrackEvent(false);
            _this.setBackgroundColor();
          }
console.log("heyhey");
          _subTrackEvents = {};
          _subTrackEventsAll = [];
          _superTrackEvent.popcornTrackEvent.isSuperTrackEvent = val;
          // reset popcornTrackEvent
          _superTrackEvent.popcornTrackEvent.subTrackEvents = [];
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
            _this.setSuperTrackEvent(false);
          } else {
            _parent = null;
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

    // Set PopcornWrapper SuperTrackEvents
    this.setPopcornTrackEvent = function() {
      if (!_superTrackEvent.popcornTrackEvent) {
        _superTrackEvent.popcornTrackEvent.subTrackEvents = [];
      }
    }

    this.setBackgroundColor = function() {
      _background = _allBackground[Math.floor(Math.random()*_allBackground.length)];
    };
    this.setAttrElement = function(trackEvent, attrClass) {
      trackEvent.view.element.setAttribute("super-track-event", _background);
      trackEvent.view.element.classList.add(attrClass);
    };
    this.removeAttrElement = function(trackEvent, attrClass) {
      trackEvent.view.element.removeAttribute("super-track-event");
      trackEvent.view.element.classList.remove("super-track-event");
      trackEvent.view.element.classList.remove("sub-track-event");
    };

    /* SubTrackEvent */
    this.setSubTrackEvent = function( val, parent ) {
      _this.isSubTrackEvent = val;
      if (val && parent) {
        _parent = parent;
        _background = _parent.superTrackEvent.background;
        _this.setAttrElement(_superTrackEvent, "sub-track-event");
      } else {
        _this.removeAttrElement(_superTrackEvent, "sub-track-event");
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
        _this.setAttrElement(_superTrackEvent, "super-track-event");
      } else {
        _this.removeAttrElement(_superTrackEvent, "super-track-event");
      }
      // setPopcornTrackEvent
      _this.setPopcornTrackEvent();
    }

    this.addSubTrackEvent = function( trackEvent ) {
      if (!_subTrackEvents[trackEvent.id]) {
        _subTrackEventsAll.push(trackEvent);
        _subTrackEvents[trackEvent.id] = trackEvent;
        // set popcornTrackEvent
        _superTrackEvent.popcornTrackEvent.subTrackEvents.push(trackEvent.popcornTrackEvent);
        _this.setAttrElement(trackEvent);
      }
    }
    this.removeSubTrackEvent = function( trackEvent ) {
      trackEvent.superTrackEvent.setSubTrackEvent(false);
      delete _subTrackEvents[ trackEvent.id ];
      _subTrackEventsAll.splice( _subTrackEventsAll.indexOf( trackEvent ), 1 );
      // set popcornTrackEvent
      _superTrackEvent.popcornTrackEvent.subTrackEvents.splice(
        _subTrackEventsAll.indexOf( trackEvent.popcornTrackEvent), 1 );

      // If there're no subTracksEvents, then is a normal TrackEvent
      if (_subTrackEventsAll.length < 1) {
        _this.setSuperTrackEvent(false);
      }
    }

    // when the trackevent is dropped somewhere else we need to verify
    // if this still belongs to the SuperTrackEvent.
    this.stillBelongsToParent = function() {
      if (_parent) { // is subTrackEvent
        var distanceTracks = Math.abs( _superTrackEvent.track.order - _parent.track.order );
        // Is the subTrackEvent belong to the same space of time of the parent and
        // the track-id is close to the parent-track-id (distance is least one track)
        if (_superTrackEvent.popcornOptions.start <= _parent.popcornOptions.end   &&
            _superTrackEvent.popcornOptions.end   >= _parent.popcornOptions.start &&
            distanceTracks <= 1) {
          return true; // The subTrackEvent is close to the parent
        }
        // Remove from the superTrackEvent: removeTrackEvent
        // Call the function "removeSubTrackEvent" of the parent
        _parent.superTrackEvent.removeSubTrackEvent(_superTrackEvent);
      }
      return false;
    }

  }; //SuperTrackEvent
});
