// PLUGIN: Media

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
          "default": "Video2.mp4",
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
        source: {
          elem: "input", 
          type: "text", 
          label: "Source"
        },
        videoStart: {
          elem: "input", 
          type: "text", 
          label: "Video Start",
          "default": 0,
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

      for (var i = 0;; i+=1) {
          if (!document.getElementById(options.target + i)) {
              options._container.id = options.target + i;
              break;
          }
      }
      $(options._container).hide();

      if ( !target && Popcorn.plugin.debug ) {
          throw new Error( "target container doesn't exist" );
      }
      target && target.appendChild( options._container );

      var video_source;
      if (options.source && options.source !== '') {
        video_source = options.source;
      } else {
        video_source = options.name;
      }

      options._video = Popcorn.smart( options._container, video_source );
      $(options._container).find("video").attr({
        'controls': 'controls',
        'data-butter': 'media',
        'width': '380px' // *We need to use fitVid.js to resize videos
      });
    },
    /**
     * The start function will be executed when the currentTime 
     * of the video  reaches the start time provided by the 
     * options variable
     */
    start: function( event, options ){
      if (!$(options._container).hasClass("hideFlow")) {
        $(options._container).show();
        if ($(".status-button").attr("data-state") == "true") {
          options._video.currentTime(options.videoStart);
          options._video.play();
        }
      }
    },
    /**
     * The end function will be executed when the currentTime 
     * of the video  reaches the end time provided by the 
     * options variable
     */
    end: function( event, options ) {
      // ensure that the data was actually added to the 
      // DOM before removal
      if (options._video) {
        try {
          options._video.pause();
          options._video.currentTime(options.videoStart);     
        } catch(ex) {}
      }
      if (!options.block || options.block === "No") {
        $(options._container).hide();
      }
    },

    _teardown: function( options ){
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
      $(options._container).parent().remove();
    }
  });

})( Popcorn );
