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

  var DEFAULT_FONT_COLOR = "#000000",
      DEFAULT_SHADOW_COLOR = "#444444",
      DEFAULT_BACKGROUND_COLOR = "#888888";

  function newlineToBreak( string ) {
    // Deal with both \r\n and \n
    return string.replace( /\r?\n/gm, "<br>" );
  }

  Popcorn.plugin( "quizme", {

    manifest: {
      about:{
        name: "Popcorn jQuizme Plugin",
        version: "0.1",
        author: "@robin",
        website: "jquizme.googlecode.com"
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

    _setup : function( options ) {
        
      var target = document.getElementById( options.target );
      
      options._container = document.createElement( "div" );

      var i;
      for (i = 0;; i+=1) {
        if (!document.getElementById(options.target + i)) {
            options._container.id = options.target + i;
            break;
        }
      }
      options._container.style.display = "none";
      // $("#quiz1").jQuizMe( quiz, opt1 );
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
      $("#" + options._container.id).jQuizMe(quiz, opt1);

    },

    start: function( event, options ){
      options._container.style.display = "block";
        
    },

    end: function( event, options ){
      options._container.style.display = "none";
    },

    _teardown: function( options ){

      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
}( window.Popcorn ));
