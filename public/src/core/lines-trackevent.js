/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "core/eventmanager" ],
  function( EventManager ) {

  return function( trackEventObj ) {

    var _id = trackEventObj.id,
        _trackEvent = trackEventObj,
        _this = this,
        _type = _trackEvent.type,
        _lines = {},
        _rules = {};

    Object.defineProperties( this, {
      id: {
        enumerable: true,
        get: function() {
          return _id;
        }
      },
      allLines: {
        enumerable: true,
        get: function() {
          return _lines;
        }
      },
      allRules: {
        enumerable: true,
        get: function() {
          return _rules;
        }
      }
    });

    this.createPopupRule = function() {
      if (_trackEvent.type === "quizme") { // Rule for plugin quizme
        return {
          time: {},
          pass: "true",
          score: {
            condition: "more-equal",
            value: 50
          },
          questions: {
            name: _trackEvent.popcornOptions.name, // name Quiz
            assured: "correct answer", // default assured by answered correctly
            userAnswer: "true"
          },
          keyrule: 'score' // by Default
        }
      } else { // others plugins
        return {
          pass: "true",
          keyrule: 'pass', // by Default
        }
      }
    }

    this.addLine = function( trackEvent, options ) {
      if ( !_lines[trackEvent.id] ) { // New Line
        var popupRule = _this.createPopupRule();
        popupRule.backward = options.backward;
        _lines[trackEvent.id] = {
          line: options.line,
          manual: options.manual,
          backward: options.backward,
          color: options.color,
          startInstance: _trackEvent,
          endInstance: trackEvent,
          rule: popupRule,
        }
        // New Popup Rule
        _rules[trackEvent.id] = popupRule;
        _trackEvent.update({rules: _rules});
      }
      else {
        this.setLine(trackEvent.id, options);
      }
    }

    this.setLine = function(trackEventID, options) {
      if ( !!_lines[trackEventID] ) {
        if (options.backward) {
          _lines[trackEventID].backward = options.backward;
          _rules[trackEventID].backward = options.backward;
        }
        if (options.manual)   _lines[trackEventID].manual   = options.manual;
        if (options.color)    _lines[trackEventID].color    = options.color;
        _trackEvent.update({rules: _rules});
      }
    }
    this.setRule = function(trackEventID, options) {
      if ( !!_rules[trackEventID] ) {
        if (options.left)  _rules[trackEventID].left = options.left;
        if (options.top)   _rules[trackEventID].top  = options.top;
        _trackEvent.update({rules: _rules});
      }
    }

    this.removeLine = function(trackEventID, preventUpdate) {
      if ( !!_lines[trackEventID] ) {
        delete _lines[trackEventID];
        delete _rules[trackEventID];
      }
      if (!preventUpdate) {
        _trackEvent.update({rules: _rules});
      }
    }

    this.setDeletedLine = function(trackEventID) {
      if ( !!_lines[trackEventID] ) {
        _lines[trackEventID] = {deleted: true};
        _rules[trackEventID] = _lines[trackEventID];
        _trackEvent.update({rules: _rules});
      }
    }

    this.isLine = function(trackEventID) {
      if (!!_lines[trackEventID]) {
        return _lines[trackEventID].line instanceof Kinetic.Line;
      }
      return false;
    }

    this.isDeletedLine = function(trackEventID) {
      if (!!_lines[trackEventID]) {
        if (!!_lines[trackEventID].deleted) {
          return true;
        }
      }
      return false;
    }

    this.update = function() {
      _trackEvent.update({rules: _rules});
    }

    this.isLeafNode = function() {
      return Object.keys(_lines).length < 1;
    }

  }; //Lines
});
