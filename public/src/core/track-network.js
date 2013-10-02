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
				if(!tracks[j]) break; // tracks[j] == Next track media

				if (tracks[i].length === 1 || tracks[j].length === 1) { // Draw lines (1-M)(M-1)
					for (var k in tracks[i]) {
						for (var l in tracks[j]) {
							this.drawLines(tracks[i][k], tracks[j][l], layer);
						}
					}
				} else if (tracks[i].length > 1) { // Draw lines with media in the same Track
					for (var k in tracks[i]) {
						this.drawLineSameTrack(tracks[i][k], tracks[j], layer);
					}
				}
			}
			stage.add(layer);
		}

		// Draw Lines between two points
		this.drawLines = function(start_obj, end_obj, layer) {
			try { // Points (Start , End)
				var start = $(start_obj.view.element);
				var end = $(end_obj.view.element);
				var start_x = start.position().left + start.width();
				var start_y = start.parent().position().top + start.height()/2;
				var end_x = end.position().left;
				var end_y = end.parent().position().top + end.height()/2;
			} catch(ex) {return}
			start.addClass("on-flow").removeClass("out-of-flow");
			end.addClass("on-flow").removeClass("out-of-flow");

			var line = new Kinetic.Line({ // Create Kinetic Line
				points: [start_x, start_y, end_x, end_y],
				stroke: '#3FB58E',
				strokeWidth: 3,
				lineCap: 'square',
				lineJoin: 'square'
			});

			line.move(0, 0);
			layer.add(line);
		}

		// Draw lines which are in the same Layer(Track)
		this.drawLineSameTrack = function(start, end_set, layer) {
			var startTrackId = $(start.view.element).attr("data-butter-track-id");
			for (var i in end_set) {
				var endTrackId = $(end_set[i].view.element).attr("data-butter-track-id");
				if (startTrackId === endTrackId) {
					this.drawLines(start, end_set[i], layer);
					continue;
				} 
				if (!$(end_set[i].view.element).hasClass("on-flow"))
					$(end_set[i].view.element).addClass("out-of-flow");
				if (!$(start.view.element).hasClass("on-flow"))
					$(start.view.element).addClass("out-of-flow");
			}
		}
	}
	return TrackNetwork;
})