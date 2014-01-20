/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {

  Butter.Editor.register( "quizme", "load!{{baseDir}}templates/assets/editors/quizme/quizme-editor.html",
    function( rootElement, butter ) {

    var _rootElement = rootElement,
        _trackEvent,
        _butter,
        $containerQuiz,
        _this = this,
        _colorQuiz = _rootElement.querySelector( "#color-quiz" ),

        // Constans
        defaultColor = "#ffaa33",
        defaultFontHeader = "white";

    /**
     * Member: setup
     *
     * Sets up the content of this editor
     *
     * @param {TrackEvent} trackEvent: The TrackEvent being edited
     */
    function setup( trackEvent ) {
      _trackEvent = trackEvent;

      var container = _rootElement.querySelector( ".editor-options" ),
          advancedContainer = _rootElement.querySelector( ".advanced-options" ),
          pluginOptions = {},
          ignoreKeys = ["color", "customColor", "customColorHeaderFont", "start", "end"],
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
            colorQuiz = _rootElement.querySelector( "#color-quiz" ),
            customColor = _rootElement.querySelector( "#custom-color-quiz" ),
            customColorHeaderFont = _rootElement.querySelector( "#custom-color-header-font" );

        function updateCustomColor( e ) {
          trackEvent.update({
            customColor: e.target.value,
          });
        }

        function updateCustomColorHeaderFont( e ) {
          trackEvent.update({
            customColorHeaderFont: e.target.value,
          });
        }

        function handler( e ) {
          var oldValue = e.target.value;

          trackEvent.update({
            color: e.target.value
          });
          var target = e.target;

          if ( e.target.value === "custom" ) {
            customColor.parentNode.style.display = "block";
            customColorHeaderFont.parentNode.style.display = "block";
          } else {
            customColor.parentNode.style.display = "none";
            customColorHeaderFont.parentNode.style.display = "none";
          }
        }

        customColor.parentNode.style.display = "none";
        customColorHeaderFont.parentNode.style.display = "none";
        customColor.addEventListener( "change", updateCustomColor, false );
        customColorHeaderFont.addEventListener( "change", updateCustomColorHeaderFont, false );
        colorQuiz.addEventListener( "change", handler, false );

        for ( key in pluginOptions ) {
          if ( pluginOptions.hasOwnProperty( key ) ) {
            option = pluginOptions[ key ];

            if ( option.elementType === "select" ) {
              _this.attachSelectChangeHandler( option.element, option.trackEvent, key, option.trackEvent.updateTrackEventSafe );
            }
            else if ( option.elementType === "input" ) {
              if ( option.element.type === "checkbox" ) {
                _this.attachCheckboxChangeHandler( option.element, option.trackEvent, key );
              } else {
                _this.attachInputChangeHandler( option.element, option.trackEvent, key, option.trackEvent.updateTrackEventSafe );
              }
            }
            else if ( option.elementType === "textarea" ) {
              _this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
            }
          }
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
