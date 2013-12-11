(function ( Popcorn ) {
  function validateDimension( value, fallback ) {
    if ( typeof value === "number" ) {
      return value;
    }
    return fallback;
  }

  var opt1 = {
      title: "Simple statements",
      disableRestart: true,
      disableDelete: false,
      help: "You do not need help.",
      showAns: false,
      allRandom: false,
      random: false,
      fxSpeed: "fast",
      hoverClass: "q-ol-hover",
      review: true,
      showFeedback: false
  };
  var target, gettingQuizzes;

  // get Quizzes
  var GlobalQuiz = {};
  var createQuiz = function(options) {
    if (!!options.name && GlobalQuiz[options.name]) {
      options.quiz = GlobalQuiz[options.name];
    } else {
      options.quiz = GlobalQuiz["TrueFalse"]; // Default
    }
    !!options.quiz && options.$container.jQuizMe(options.quiz, opt1, options.callback);
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
          "default": "TrueFalse",
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
          "default": 90,
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
        target: "video-overlay",
      }
    },

    _setup: function( options ) {
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

      !!options.title && !!(options.title = opt1.title);

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
