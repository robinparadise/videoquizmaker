(function ( Popcorn ) {

  var Default = {tf: [
    {
      ques: "Directions given by teachers should be very unclear.",
      ans: false,
    },
    {
      ques: "The official language of all the countries in South America is Spanish.",
      ans: false,
      ansInfo: "This statement is false because of the absolute word all. Spanish is the official language of 9 of the 13 countries in South America. The exceptions are Brazil (Portuguese), French Guiana (French), Guyana (English), and Suriname (Dutch).",
    },
    {
      ques: "Shaking hands with women is acceptable in Indonesia.",
      ans: true,
    },
  ]};

  var opt1 = {
      title: "Simple statements",
      disableRestart: true,
      disableDelete: false,
      // intro: "Welcome to the  simple statements quiz. If you are an experienced user, I hope you won't be offended by the simplicity of the questions. This series is intended for beginners, jQuizMe is easily the best jQuery quiz plugin around.",
      help: "You do not need help.",
      multiLen: 5,
      showAns: false,
      allRandom: true,
      fxSpeed: "fast",
  };
  var quiz, callback, optionsId, target, tracks;

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
          options: ["Default"], 
          label: "Quiz",
          "default": "Default",
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
        block: {
          elem: "select",
          options: ["No", "Yes"],
          label: "Block",
          "default": "No",
        },       
        target: "quizme-container",
      }
    },

    _setup: function( options ) {
      tracks = Butter.app.orderedTrackEventsSet;
      target = document.getElementById( options.target );
      options._container = document.createElement( "div" );

      for (var i = 0;; i+=1) {
        if (!document.getElementById(options.target + i)) {
            optionsId = options._container.id = options.target + i;
            break;
        }
      }
      options._container.style.display = "none";
      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "target container doesn't exist" );
      }
      target && target.appendChild( options._container );

      if (!!options.title && options.title !== opt1.title) {
        opt1["title"] = options.title;
      }

      if (options.name !== "Default") {     
        quiz = Butter.QuizOptions[options.name];
      }
      else {
        quiz = Default;
      }
      // Object Callback with functions that jquizme execute when finish
      callback = {
        this: this,
        skipTime: options.end,
        quizResult: function(info) {
          var optionsId = options._container.id;
          var setMedia = Number($("#"+optionsId).attr("setmedia"));
          if ( !(tracks[setMedia +1] && tracks[setMedia +1].length >1) ) return;
          var firstFlow = $(tracks[setMedia +1][0].view.element).attr("flow");
          var secondFlow = $(tracks[setMedia +1][1].view.element).attr("flow");
          if (info.score >= 50) { // Continue with the first flow
            $(".trackMediaEvent[flow='"+ firstFlow +"']").removeClass("hideFlow");
            $(".trackMediaEvent[flow='"+ secondFlow +"']").addClass("hideFlow");
          }
          else { // Continue with the second flow
            $(".trackMediaEvent[flow='"+ secondFlow +"']").removeClass("hideFlow");
            $(".trackMediaEvent[flow='"+ firstFlow +"']").addClass("hideFlow");
          }
        }
      }
      $("#"+optionsId).jQuizMe(quiz, opt1, callback);
    },

    start: function( event, options ){
      var child = $("#"+optionsId).children();
      if (!child.hasClass("quiz-el")) { //Create again 'cause was deleted
        $("#"+optionsId).jQuizMe(quiz, opt1, callback);
      }
      if (!$(options._container).hasClass("hideFlow")) {
        options._container.style.display = "block";
      }
      this.pause();
    },

    end: function( event, options ) {
      options._container.style.display = "none";
    },

    _teardown: function( options ){
      target && target.removeChild( options._container );
    }
  });
}( window.Popcorn ));
