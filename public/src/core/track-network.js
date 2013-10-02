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
			var tracks = Butter.app.orderedTrackEventsSet;
			var start, end, prevTrack;
			$(".on-flow").removeClass("on-flow");

			for(var i in tracks) {
				var j = Number(i) + 1;
				if(!tracks[j]) break;

				if (tracks[i].length === 1) { // Draw line from start to all next setTracks
					start = $(tracks[i][0].view.element);
					end = tracks[j]; // setTracks
					this.drawLines(start, end, layer);
				} else if (tracks[j].length === 1) { // Draw line from setTracks to next track
					for (var k in tracks[i]) {
						this.drawLines($(tracks[i][k].view.element), tracks[j], layer);
					}
				} else if (tracks[i].length > 1) { // Draw lines with media in the same Track
					for (var k in tracks[i]) {
						this.drawLineSameTrackId($(tracks[i][k].view.element), tracks[j], layer);
					}
				}
			}
			stage.add(layer);
		}

		// Draw Lines between two points
		// start: jquery element
		// end_set: Array of objects
		this.drawLines = function(start, end_set, layer) {
			var start_x, start_y, end_x, end_y;

			try { // Point Start
				start_x = start.position().left + start.width();
				start_y = start.parent().position().top + start.height()/2;
			} catch(ex) {return}
			start.addClass("on-flow").removeClass("out-of-flow");

			for(var i in end_set) {
				var end = $(end_set[i].view.element);
				end.addClass("on-flow").removeClass("out-of-flow");
				try { // Point End
					end_x = end.position().left;
					end_y = end.parent().position().top + end.height()/2;
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

		this.drawLineSameTrackId = function(start, end_set, layer) {
			var startTrackId = start.attr("data-butter-track-id");
			for (var i in end_set) {
				var endTrackId = $(end_set[i].view.element).attr("data-butter-track-id");
				if (startTrackId === endTrackId) {
					this.drawLines(start, [end_set[i]], layer);
				} else if (!$(end_set[i].view.element).hasClass("on-flow")) {
					$(end_set[i].view.element).addClass("out-of-flow");
				} else if (!start.hasClass("on-flow")) {
					start.addClass("out-of-flow");
				}
			}
		}
	}
	return TrackNetwork;
})