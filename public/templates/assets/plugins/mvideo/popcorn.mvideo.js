// PLUGIN: JQUIZME

(function ( Popcorn ) {
  
  Popcorn.plugin( "mvideo" , {
      
    manifest: {
      about:{
        name: "Popcorn Video Plugin",
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
          options: ["Video1.mp4", "Video2.mp4", "Video3.mp4"],
          label: "Video",
          "default": "Video1.mp4",
          optional: true
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
          optional: true
        },       
        target: "video-container",
      }
    },
    /**
     * @member
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
        $("."+options._container.id).hide();

        if ( !target && Popcorn.plugin.debug ) {
            throw new Error( "target container doesn't exist" );
        }
        target && target.appendChild( options._container );
        
        if (!!options.title && options.title !== opt.title) {
            opt["title"] = options.title;
        }
        
        options._container.innerHTML = '<video class='+options._container.id+' data-butter="media" controls width=380px><source src='+options.name+'></video>';

    },
    /**
     * @member wikipedia 
     * The start function will be executed when the currentTime 
     * of the video  reaches the start time provided by the 
     * options variable
     */
    start: function( event, options ){
      $("."+options._container.id).show();
      if ($(".status-button").attr("data-state") == "true") {
        $("."+options._container.id)[0].play();
      }
      // this.play();
        
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
      $("."+options._container.id)[0].pause();
      if (options.block === "No" || !options.block) {
        $("."+options._container.id).hide();
      }
    },

    _teardown: function( options ){

      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
      $("."+options._container.id).parent().remove();
    }
  });

})( Popcorn );
