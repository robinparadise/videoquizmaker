/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [], function() {

	function TrackNetwork() {

		var lines, canvas, ctx, stage;

		// Create Layer Canvas
		this.createCanvas = function() {
			//if (stage) return;
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
			var start, end, start_x, start_y, start_ID, end_x, end_y, end_ID;

			console.log("[calculateLines][***Loop***]");
			for(var i in tracks) {

				start_ID = tracks[i].popcornOptions.id;
				if(!tracks[Number(i)+1]) break;
				end_ID = tracks[Number(i)+1].popcornOptions.id;
				start = $(".butter-track-event[data-butter-trackevent-id='"+start_ID+"']");
				end = $(".butter-track-event[data-butter-trackevent-id='"+end_ID+"']");

				//Calculate coords
				start_x = start.position().left + start.width();
				start_y = start.parent().position().top + start.height()/2;
				end_x = end.position().left;
				end_y = end.parent().position().top + end.height()/2;

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
			console.log("[calculateLines][***END Loop***]");
			stage.add(layer);
		}
	}
	return TrackNetwork;
})