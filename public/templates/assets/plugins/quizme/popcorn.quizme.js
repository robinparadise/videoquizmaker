(function ( Popcorn ) {
  function validateDimension( value, fallback ) {
    if ( typeof value === "number" ) {
      return value;
    }
    return fallback;
  }

  var optDefault = {
      title: "Simple statements",
      disableRestart: true,
      disableDelete: false,
      allRandom: false,
      random: false,
      fxSpeed: "fast",
      hoverClass: "q-ol-hover",
      showFeedback: false
  };
  var target, gettingQuizzes;

  var changeQuizCSS = function($elem, options) {
    if (options.color && options.color !== $elem.attr("color-quiz")) {
      $elem.attr("color-quiz", options.color);
      if (options.color === "custom") {
        $elem.css({
          'border-color': options.customColor,   // Change Header Background Color
          'background': options.customBodyColor, // change Body Background Color
          'color': options.customBodyFontColor   // change Body Font Color
        });
        $elem.find(".q-header-main").css({
          'background': options.customColor,     // Change Header Background Color
          'color': options.customHeaderFontColor // change Header Font Color
        });
      }
    }
    if (options.customFontSize) {
      $elem.css({'font-size': options.customFontSize + "px"});   // change Quiz Font Size
    }
  }

  // get Quizzes
  var GlobalQuiz = {};
  var createQuiz = function(options) {
    if (!!options.name && GlobalQuiz[options.name]) {
      options.quiz = GlobalQuiz[options.name];
    } else {
      options.quiz = GlobalQuiz["TrueFalse"]; // Default
    }
    if (!!options.quiz) {

      options.$container.find(".quiz-el").remove();
      options.$container.jQuizMe(options.quiz, options.optQuiz, options.callback);
      var $quizElem = options.$container.find(".quiz-el");
      // Change Quiz Appearence
      changeQuizCSS($quizElem, options);
    }
  }

  Popcorn.plugin( "quizme", {

    manifest: {
      about:{
        name: "Popcorn jQuizme Plugin",
        version: "0.1",
        author: "@robin",
        website: "jquizme.googlecode.com",
        keyname: "quizme"
      },
      options:{
        title: {
          elem: "input", 
          type: "text", 
          label: "Title",
          optional: true,
          "default": "Simple statements"
        },
        name: {
          elem: "select", 
          options: [], 
          label: "Quiz",
          "default": "TrueFalse"
        },
        help: {
          elem: "input", 
          type: "text", 
          label: "Help",
          optional: true,
          "default": "You do not need help.",
          group: "advanced"
        },
        review: {
          elem: "input",
          type: "checkbox",
          label: "Review",
          "default": false,
          optional: true
        },
        random: {
          elem: "input",
          type: "checkbox",
          label: "Random",
          "default": false,
          optional: true
        },
        intro: {
          elem: "textarea",
          label: "Introduction",
          optional: true,
          group: "advanced"
        },
        customFontSize: {
          elem: "input",
          type: "number",
          label: "Font Size",
          units: "px",
          "default": "19",
          group: "style"
        },
        color: {
          elem: "select", 
          options: [
            "darkQuiz",
            "whiteQuiz",
            "redQuiz",
            "yellowQuiz",
            "goldQuiz",
            "greenQuiz",
            "blueQuiz",
            "darkGreyQuiz",
            "custom"
          ], 
          label: "Color Quiz",
          "default": "custom",
          group: "style"
        },
        customColor: {
          elem: "input",
          type: "color",
          optional: true,
          label: "Custom Color Quiz",
          "default": "#052938",
          group: "style"
        },
        customHeaderFontColor: {
          elem: "input",
          type: "color",
          optional: true,
          label: "Custom Header Font Color",
          "default": "#FFF",
          group: "style"
        },
        customBodyColor: {
          elem: "input",
          type: "color",
          optional: true,
          label: "Custom Body Background Color",
          "default": "#ffffff",
          group: "style"
        },
        customBodyFontColor: {
          elem: "input",
          type: "color",
          optional: true,
          label: "Custom Body Font Color",
          "default": "#000000",
          group: "style"
        },
        start: {
          elem: "input", 
          type: "text", 
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        width: {
          elem: "input",
          type: "number",
          label: "Width",
          "default": 60,
          "units": "%",
          hidden: true
        },
        height: {
          elem: "input",
          type: "number",
          label: "Height",
          "default": 80,
          "units": "%",
          hidden: true
        },
        top: {
          elem: "input",
          type: "number",
          label: "Top",
          "default": 0,
          "units": "%",
          hidden: true
        },
        left: {
          elem: "input",
          type: "number",
          label: "Left",
          "default": 10,
          "units": "%",
          hidden: true
        },
        transition: {
          elem: "select",
          options: [ "None", "Pop", "Slide Up", "Slide Down", "Fade" ],
          values: [ "popcorn-none", "popcorn-pop", "popcorn-slide-up", "popcorn-slide-down", "popcorn-fade" ],
          label: "Transition",
          "default": "popcorn-fade"
        },
        block: {
          elem: "select",
          options: ["No", "Yes"],
          label: "Block",
          "default": "No",
          hidden: true
        },
        zindex: {
          "default": 1,
          hidden: true
        },
        target: {
          hidden: true
        },
      }
    },

    _setup: function( options, event ) {
      options._target = target = Popcorn.dom.find( options.target );
      options._container = document.createElement( "div" );
      options._container.classList.add( "jquizme-container" );
      options._container.style.width = validateDimension( options.width, "100" ) + "%";
      options._container.style.height = validateDimension( options.height, "100" ) + "%";
      options._container.style.top = validateDimension( options.top, "0" ) + "%";
      options._container.style.left = validateDimension( options.left, "0" ) + "%";
      options._container.style.zIndex = +options.zindex;
      options._container.classList.add( options.transition );
      options._container.classList.add( "off" );

      options._container.style.display = "none";
      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "target container doesn't exist" );
      }
      target && target.appendChild( options._container );

      var manifest = options._natives.manifest.options;

      // Default Values
      if (!options.title) {
        options.title = manifest.title.default;
      }
      if (!options.help) {
        options.help = manifest.help.default;
      }

      // jQuizme options
      options.optQuiz = $.extend({}, optDefault);
      options.optQuiz.title = options.title;
      options.optQuiz.review = options.review;
      options.optQuiz.help = options.help;
      options.optQuiz.allRandom = options.random;
      options.optQuiz.intro = options.intro;

/*      // Change color Quiz
      if (!options.color) {
        options.color = manifest.color.default;
      }*/

      // Object Callback with functions that jquizme execute when finish
      options.callback = {
        popcorn: this,
        continueFlow: this.continueFlow,
        quizResult: function(info) { // Continue with the next Flow
          this.popcorn.continueFlow(options, info); 
        }
      }
      options.$container = $(options._container);
      if ( $.isEmptyObject(GlobalQuiz) ) {
        gettingQuizzes = true;
        this.getQuizzes(function(data) {
          gettingQuizzes = false;
          for(var n in data.json.all) {
            GlobalQuiz[data.json.all[n].name] = JSON.parse(data.json.all[n].data);
          }
          createQuiz(options);
        });
      }
      else {
        createQuiz(options);
      }
    },

    start: function( event, options ) {
      if (!options.$container.children().hasClass("quiz-el") && !gettingQuizzes) {
        if ( $.isEmptyObject(GlobalQuiz) ) {
          gettingQuizzes = true;
          this.getQuizzes(function(data) {
            gettingQuizzes = false;
            for(var n in data.json.all) {
              GlobalQuiz[data.json.all[n].name] = JSON.parse(data.json.all[n].data);
            }
            createQuiz(options);
          });
        }
        else {
          createQuiz(options);
        }
      }
      if ( options._container ) {
        options._container.classList.add( "on" );
        options._container.classList.remove( "off" );
        options._container.style.display = "";
      }
      this.pause();
    },

    end: function( event, options ) {
      if ( options._container ) {
        options._container.classList.add( "off" );
        options._container.classList.remove( "on" );
        options._container.style.display = "none";
      }
    },

    _teardown: function( options ){
      target && target.removeChild( options._container );
    },
  });
}( window.Popcorn ));
