/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [], function() {

	function TrackNetwork() {

		var lines, stage;

		// Create Layer Canvas
		this.createCanvas = function() {
			var wrapper = $(".tracks-container-wrapper");
			stage = new Kinetic.Stage({
				container: 'tracks-container-canvas',
				width: wrapper.width(),
				height: wrapper.height()
			});
		}

		// List all tracks and then calculate coords for lines.
		this.calculateLines = function() {
			this.createCanvas();
			var layer = new Kinetic.Layer();
			var tracks = Butter.app.orderedTrackEvents;
			var start, end, prevTrack, setMedias;

			// Set of Tracks
			var set = 1;
			if (tracks[0]) tracks[0].setMedia = set; // Init the first track to set=1

			for(var i in tracks) {

				// Get the current Track(start) and the next Track(end)
				var j = Number(i) + 1;
				var start_ID = tracks[i].popcornOptions.id;
				start = $(".butter-track-event[data-butter-trackevent-id='"+start_ID+"']");
				var start_layer = start.parent().attr("data-butter-track-id");
				if(!tracks[j]) break;
				var end_ID = tracks[j].popcornOptions.id;
				end = $(".butter-track-event[data-butter-trackevent-id='"+end_ID+"']");
				var end_layer = end.parent().attr("data-butter-track-id");

				console.log("[TrackNetwork][start_layer]", start_layer, "[end_layer]", end_layer);

				var belongsToSameSet = this.belongsToSameSet(start, end);
				if (belongsToSameSet) {
					if (!setMedias) {
						setMedias = [start];
					}
					else {
						setMedias.push(start);
					}
					tracks[j].setMedia = set; // Belongs to the same set of Tracks before
				} else { // Not Keep previous node origin
					prevTrack = start;
					tracks[j].setMedia = ++set; // New Set of Tracks
				}

				if (!belongsToSameSet && setMedias) {
					setMedias.push(prevTrack);
					this.drawLines(setMedias, end, layer); 
					setMedias = undefined;
				} else {
					this.drawLines(prevTrack, end, layer);
				}
			}
			stage.add(layer);
		}

		// Find when tracks are in the same level at time ("belongs to the same track")
		this.belongsToSameSet = function(start, end) {
			if (!start || !end) return;
			try {
				var line = {
					start: {
						left: start.position().left,
						right: start.position().left + start.width()
					},
					end: {
						left: end.position().left,
						right: end.position().left + end.width()
					}
				}
			} catch(ex) {return false}
			if (line.start.left <= line.end.right && line.end.left <= line.start.right) {
				return true;
			}
			return false;
		}

		// Draw Lines between two points
		this.drawLines = function(start, end, layer) {
			var start_x, start_y, end_x, end_y;
			try {
				end_x = end.position().left;
				end_y = end.parent().position().top + end.height()/2;
			} catch(ex) {return}

			for(var i in start) {
				start[i] = $(start[i]) // reload jQuery, ugly trick but it works
				// Calculate coords from prevTrack to end(Track)
				try {
					start_x = start[i].position().left + start[i].width();
					start_y = start[i].parent().position().top + start[i].height()/2;
				} catch(ex) {return}

				// Create Kinetic Layer
				var line = new Kinetic.Line({
					points: [start_x, start_y, end_x, end_y],
					stroke: '#3FB58E',
					strokeWidth: 3,
					lineCap: 'square',
					lineJoin: 'square'
				});

				line.move(0, 0);
				layer.add(line);
			}
		}
	}
	return TrackNetwork;
})