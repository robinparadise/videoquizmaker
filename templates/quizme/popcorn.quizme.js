// PLUGIN: JQUIZME

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
    title: "Simple statements 1.",
    disableRestart: true,
    disableDelete: false,
    intro: "Welcome to the  simple statements quiz. If you are an experienced user, I hope you won't be offended by the simplicity of the questions. This series is intended for beginners, jQuizMe is easily the best jQuery quiz plugin around.",
    help: "You do not need help.",
    multiLen: 5,
    showAns: false,
    allRandom: true,
    fxSpeed: "fast",
};


(function ( Popcorn ) {
  
  /**
   * Wikipedia popcorn plug-in 
   * Displays a wikipedia aricle in the target specified by the user by using
   * new DOM element instead overwriting them
   * Options parameter will need a start, end, target, lang, src, title and numberofwords.
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing 
   * -Target is the id of the document element that the text from the article needs to be  
   * attached to, this target element must exist on the DOM
   * -Lang (optional, defaults to english) is the language in which the article is in.
   * -Src is the url of the article 
   * -Title (optional) is the title of the article
   * -numberofwords (optional, defaults to 200) is  the number of words you want displaid.  
   *
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn("#video")
        .wikipedia({
          start: 5, // seconds
          end: 15, // seconds
          src: "http://en.wikipedia.org/wiki/Cape_Town",
          target: "wikidiv"
        } )
   *
   */
  Popcorn.plugin( "quizme" , {
      
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
          optional: true
        },
        name: {
          elem: "select", 
          options: ["default", "TrueFalse", "Fill", "Multilist"], 
          label: "Quiz",
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
          value: "No",
        },       
        target: "quizme-container",
      }
    },
    /**
     * @member quizme
     * The setup function will get all of the needed 
     * items in place before the start function is called. 
     */
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
//       $("#quiz1").jQuizMe( quiz, opt1 );
      // if the user didn't specify a language default to english
      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "target container doesn't exist" );
      }
      target && target.appendChild( options._container );
      $("#" + options._container.id).jQuizMe(Default, opt1);

    },
    /**
     * @member wikipedia 
     * The start function will be executed when the currentTime 
     * of the video  reaches the start time provided by the 
     * options variable
     */
    start: function( event, options ){
      // dont do anything if the information didn't come back from wiki
      options._container.style.display = "block";
        
    },
    /**
     * @member wikipedia 
     * The end function will be executed when the currentTime 
     * of the video  reaches the end time provided by the 
     * options variable
     */
    end: function( event, options ){
      // ensure that the data was actually added to the 
      // DOM before removal
      options._container.style.display = "none";
    },

    _teardown: function( options ){

      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });

})( Popcorn );
