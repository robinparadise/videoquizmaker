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
			var flow = 0;
			$(".on-flow").removeClass("on-flow");

			for(var i in tracks) {
				var j = Number(i) + 1;
				if(!tracks[j]) break; // tracks[j] == Next track media

				if (tracks[i].length === 1) {
					try { var keyname = tracks[i][0].manifest.about.keyname }
					catch(ex) {var keyname;}
					if (keyname === "quizme") { // Then draw lines (1-M)
						for (var l in tracks[j]) {
							this.drawLine(tracks[i][0], tracks[j][l], layer);
							flow = this.setFlow(flow, tracks[j][l]);
						}
					} else { // Else draw lines with media in the same Track
						this.drawLineSameTrack(tracks[i][0], tracks[j], layer);
					}
				}
				if (tracks[j].length === 1) { // Draw lines (M-1)
					for (var k in tracks[i]) {
						for (var l in tracks[j]) {
							this.drawLine(tracks[i][k], tracks[j][l], layer);
							flow = this.setFlow(flow, tracks[j][l]);
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
		this.drawLine = function(start_obj, end_obj, layer) {
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
					this.drawLine(start, end_set[i], layer);
					this.setSameFlow(start, end_set[i]);
					continue;
				} 
				if (!$(end_set[i].view.element).hasClass("on-flow"))
					$(end_set[i].view.element).addClass("out-of-flow");
				if (!$(start.view.element).hasClass("on-flow"))
					$(start.view.element).addClass("out-of-flow");
			}
		}

		// set the same Flow for Track Events Media
		this.setSameFlow = function(prev, track) {
			var prevFlow = Number( $(prev.view.element).attr("flow") );
			$(track.view.element).attr("flow", prevFlow);
			$(track.popcornTrackEvent._container).attr("flow", prevFlow);
		}
		// set Flow for each Track Events Media
		this.setFlow = function(flow, track) {
			if ($(track.view.element).hasClass("mainFlow")) return flow;
			$(track.view.element).attr("flow", ++flow);
			$(track.popcornTrackEvent._container).attr("flow", flow);
			return flow;
		}
	}
	return TrackNetwork;
})