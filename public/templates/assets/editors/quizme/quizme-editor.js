/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {

  Butter.Editor.register( "quizme", "load!{{baseDir}}templates/assets/editors/quizme/quizme-editor.html",
    function( rootElement, butter ) {

    var _rootElement = rootElement,
        _trackEvent,
        _manifestOptions,
        _butter,
        _this = this,
        _popcornOptions;

    /**
     * Member: setup
     *
     * Sets up the content of this editor
     *
     * @param {TrackEvent} trackEvent: The TrackEvent being edited
     */
    function setup( trackEvent ) {
      _trackEvent = trackEvent,
      _manifestOptions = _trackEvent.manifest.options;
      _popcornOptions = _trackEvent.popcornOptions;

      var container = _rootElement.querySelector( ".editor-options" ),
          advancedContainer = _rootElement.querySelector( ".advanced-options" ),
          pluginOptions = {},
          //ignoreKeys = ["color", "customColor", "customColorHeaderFont", "start", "end"],
          ignoreKeys = ["start", "end"],
          startEndElement;


      function callback( elementType, element, trackEvent, name ) {
        pluginOptions[ name ] = {
          element: element,
          trackEvent: trackEvent,
          elementType: elementType
        };
      }

      function attachHandlers() {
        var key,
            option,
            //colorQuiz = _rootElement.querySelector( "#color-quiz" ),
            //customColor = _rootElement.querySelector( "#custom-color-quiz" ),
            //customColorHeaderFont = _rootElement.querySelector( "#custom-color-header-font" );
            colorQuiz = pluginOptions.color,
            customColor = pluginOptions.customColor,
            customColorHeaderFont = pluginOptions.customColorHeaderFont;

        function customColorCallback( te, prop, message ) {
          if ( message ) {
            _this.setErrorState( message );
            return;
          } else {
            te.update({
              customColor: prop.customColor
            });
          }
        }
        function customColorHeadFontCallback( te, prop, message ) {
          if ( message ) {
            _this.setErrorState( message );
            return;
          } else {
            te.update({
              customColorHeaderFont: prop.customColorHeaderFont
            });
          }
        }

        function colorSelectHandler( e ) {
          _trackEvent.update({
            color: e.target.value
          });

          if ( e.target.value === "custom" ) {
            customColor.element.parentNode.style.display = "block";
            customColorHeaderFont.element.parentNode.style.display = "block";
          } else {
            customColor.element.parentNode.style.display = "none";
            customColorHeaderFont.element.parentNode.style.display = "none";
          }
        }

        for ( key in pluginOptions ) {
          if ( pluginOptions.hasOwnProperty( key ) ) {
            option = pluginOptions[ key ];

            if ( option.elementType === "select" ) {
              if ( key === "color" ) {
                option.element.addEventListener("change", colorSelectHandler, false);
              }
              else {
                _this.attachSelectChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
              }
            }
            else if ( option.elementType === "input" ) {
              if ( option.element.type === "checkbox" ) {
                _this.attachCheckboxChangeHandler( option.element, option.trackEvent, key );
              }
              else if ( key === "customColor" ) {
                _this.attachColorChangeHandler( option.element, option.trackEvent, key, customColorCallback );
              }
              else if ( key === "customColorHeaderFont" ) {
                _this.attachColorChangeHandler( option.element, option.trackEvent, key, customColorHeadFontCallback );
              }
              else {
                _this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
              }
            }
            else if ( option.elementType === "textarea" ) {
              _this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
            }
          }
        }

        if ( _popcornOptions.color === "custom" ) {
          customColor.element.parentNode.style.display = "block";
          customColorHeaderFont.element.parentNode.style.display = "block";
        } else {
          customColor.element.parentNode.style.display = "none";
          customColorHeaderFont.element.parentNode.style.display = "none";
        }
      }

      startEndElement = _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe );
      container.insertBefore( startEndElement, container.firstChild );

      _this.createPropertiesFromManifest({
        trackEvent: trackEvent,
        callback: callback,
        basicContainer: container,
        advancedContainer: advancedContainer,
        ignoreManifestKeys: ignoreKeys
      });

      attachHandlers();
      _this.updatePropertiesFromManifest( trackEvent );
      _this.setTrackEventUpdateErrorCallback( _this.setErrorState );

    }

    function onTrackEventUpdated( e ) {
      _this.updatePropertiesFromManifest( e.target );
      _this.setErrorState( false );
    }

    // Extend this object to become a TrackEventEditor
    Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
      open: function( parentElement, trackEvent ) {
        _butter = butter;
        // Update properties when TrackEvent is updated
        trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
        setup( trackEvent );
      },
      close: function() {
        _trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
      }
    });
  });
}( window.Butter ));
