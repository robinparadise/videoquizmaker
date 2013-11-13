/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [ "dialog/dialog", "ui/widget/tooltip" ], function( Dialog, ToolTip ) {

	function TrackNetwork(app) {
		var lines, stage, layer, dialog, $wrapper, lineMouse, trackEventStart;
		var GREEN = "#3FB58E";
		var GREY = "CCC";
		var RED = "red";
		var drawing = false;

		// Create Layer Canvas
		this.createCanvas = function() {
			if (!stage) {
				try {
					$wrapper = $(".tracks-container-wrapper");
					stage = new Kinetic.Stage({
						container: 'tracks-container-canvas'
					});
					layer = new Kinetic.Layer();
					stage.add(layer);
				} catch(err) {
					stage = undefined;
					return false
				}
				this.drawLineEventMouse(stage, layer);
			} else {
				layer.children.splice(0);
			}
			stage.setWidth($wrapper.width());
			stage.setHeight($wrapper.height());
			return true;
		}

		// List all tracks and then calculate coords for lines.
		this.calculateLines = function(ev) {
			if (!this.createCanvas()) return;
			var tracks = app.orderedTrackEventsSet;
console.log("calculateLines [tracks]", tracks);
			var flow = 0;
			//$(".trackMediaEvent.on-flow").removeClass("on-flow");

			for(var i in tracks) {
				var j = Number(i) + 1;
				if(!tracks[j]) break; // tracks[j] == Next track media

				if (tracks[i].length === 1) {
					try { var keyname = tracks[i][0].manifest.about.keyname }
					catch(ex) { var keyname }
					if (keyname === "quizme") { // Then draw lines (1-M)
						for (var l in tracks[j]) {
							this.drawLine(tracks[i][0], tracks[j][l], layer);
							flow = this.setFlow(flow, tracks[j][l]);
						}
					} else { // Else draw lines with media in the same Track
						// Draw Manual Lines
						var drew = this.drawManualLines(tracks[i][0], layer);
						if (!drew) {
							this.drawLineSameTrack(tracks[i][0], tracks[j], layer);
						}
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
						// Draw Manual Lines
						var drew = this.drawManualLines(tracks[i][k], layer);
						if (!drew) {
							this.drawLineSameTrack(tracks[i][k], tracks[j], layer);
						}
					}
				}
			}
			if (tracks.length > 0) {
				layer.draw();
			}
			this.mouseDownDrawing(stage, layer);
		}

		// Draw Lines between two points
		this.drawLine = function(start_obj, end_obj, layer, options) {
			if (start_obj.linesTo && start_obj.linesTo[end_obj.id] === "removed") return; // Lines removed
			if (options === undefined) options = {};
			try {
				var keyname  = start_obj.manifest.about.keyname;
				var quizname = start_obj.popcornOptions.name;
			}
			catch(ex) {
				var keyname, namequiz;
			}

			$start = $(start_obj.view.element);
			$end = $(end_obj.view.element);

			try { // Points (Start , End)
				var start_x = $start.position().left + $start.width();
				var start_y = $start.parent().position().top + $start.height()/2;
				var end_x   = $end.position().left;
				var end_y   = $end.parent().position().top + $end.height()/2;
			} catch(ex) {return}

			// Look if there is a line
			if (start_obj.linesTo && start_obj.linesTo[end_obj.id]) {
				var line = start_obj.linesTo[end_obj.id];
				line.getPoints()[0].x = start_x;
				line.getPoints()[0].y = start_y;
				line.getPoints()[1].x = end_x;
				line.getPoints()[1].y = end_y;
				if (options.manual && options.color) {
					line.attrs.stroke = options.color;
				}
			}
			else { // New line
				// start.addClass("on-flow").removeClass("out-of-flow");
				// end.addClass("on-flow").removeClass("out-of-flow");
				if (!options.color) options.color = GREY; // Default color gray

				var line = new Kinetic.Line({ // Create Kinetic Line
					points: [start_x, start_y, end_x, end_y],
					stroke: options.color,
					strokeWidth: 5,
					lineCap: 'round',
					lineJoin: 'round'
				});

				if (keyname === "quizme") {
					line.popup = {
						pass: "true",
						score: ["more-equal", 50],
						questions: [quizname],
						keyrule: 'score' // by Default
					}
				} else { // others plugins
					line.popup = {
						'pass': "true",
						'keyrule': 'pass' // by Default
					}
				}
				// Create event popup dialog for line
				line.on('click', function (ev) {
					this.popup.left = ev.offsetX,
					this.popup.top  = ev.screenY,
					dialog = Dialog.spawn( "dinamic", {'data': this.popup} );
					dialog.open( "empty" );
				});
			}
			// When the user define the line -> manual == True
			if (options.manual) {
				line.manual = true;
			}

			this.saveTo(start_obj, "linesTo", end_obj.id, line); // Save line into the object start_obj
			this.saveTo(start_obj.popcornTrackEvent, "rulesTo", end_obj.id, line.popup); // save Rule

			line.move(0, 0);
			layer.add(line);
			return true;
		}

		// Draw lines which are in the same Layer(Track)
		this.drawLineSameTrack = function(start, end_set, layer) {
console.log("[drawLineSameTrack]", start, start.track);
			if (!!!start.track) return;
			var startTrackId = start.track.id;
			for (var i in end_set) {
				if (!!!end_set[i].track) continue;
				var endTrackId = end_set[i].track.id;
				if (startTrackId === endTrackId) { // Then draw line between tracks in the same layer
					this.drawLine(start, end_set[i], layer);
					this.setSameFlow(start, end_set[i]);
					continue;
				}
				// if (!$(end_set[i].view.element).hasClass("on-flow"))
				//	$(end_set[i].view.element).addClass("out-of-flow");
				// if (!$(start.view.element).hasClass("on-flow"))
				//	$(start.view.element).addClass("out-of-flow");
			}
		}

		// Draw manual lines from first track to the last track
		this.drawLineFromFirst = function($objA, $objB, layer, options) {
			if ( !$objA.jquery || !$objB.jquery ) return;

			var trackA = app.getTrackEvents( "id", $objA.attr('data-butter-trackevent-id') )[0];
			var trackB = app.getTrackEvents( "id", $objB.attr('data-butter-trackevent-id') )[0];
			if (!trackA || !trackB) return;

			if (trackA.popcornOptions.start <= trackB.popcornOptions.start) {
				this.drawLine(trackA, trackB, layer, options);
			} else {
				this.drawLine(trackB, trackA, layer, options);
			}
		}

		// Draw manual lines
		this.drawManualLines = function(trackEventA, layer) {
			var drew = false, aux;
			for (var id in trackEventA.linesTo) {
				if (trackEventA.linesTo[id].manual) {
					var trackEventB = app.getTrackEvents( "id", id )[0];
					if (trackEventB) {
						aux = this.drawLine(trackEventA, trackEventB, layer, {'manual': true});
						if (aux) drew = true;
					}
				}
			}
			return drew;
		}

		// Save line into object track event
		this.saveTo = function(obj, key, id, data) {
			if (obj.jquery) { // get object trackEvent with ID
				var start = app.getTrackEvents( "id", obj.attr('data-butter-trackevent-id') );
			} else {
				var start = obj;
			}
			if ($.isEmptyObject(start[key])) {
				start[key] = {}
			} else {
				// if it is not a trackEvent quizme then remove all lines before
				try { 
					var keyname = obj.manifest.about.keyname }
				catch(ex) {
					var keyname
				}
				if (keyname !== "quizme") {
					for (var trackID in start[key]) {
						if (!!start[key][trackID].remove && id !== trackID) { // type of line
							start[key][trackID].remove();
							delete start[key][trackID]; // Remove all lines
						}
					}
				}
			}
			start[key][id] = data; // Add new line
		}

		// set the same Flow for Track Events Media
		this.setSameFlow = function(prev, track) {
			track.popcornTrackEvent.flow = prev.popcornTrackEvent.flow;
		}
		// set Flow for each Track Events Media
		this.setFlow = function(flow, track) {
			if ($(track.view.element).hasClass("mainFlow")) {
				track.popcornTrackEvent.flow = 0;
			} else {
				track.popcornTrackEvent.flow = ++flow;
			}
			return flow;
		}

		// Reset all events and then bind the events again (cause live events seen dont works)
		this.mouseDownDrawing = function(stage, layer) {
			var $butterTrackEv = $wrapper.find(".butter-track-event");
			$butterTrackEv.find(".left-handle-line, .right-handle-line").off();
			$butterTrackEv.off();

			// EventListener for handle pointers
			$butterTrackEv.find(".left-handle-line, .right-handle-line")
			.on("mousedown" ,  function(e) {
				console.log("[mousedown Live]");
				e.stopPropagation();
				if (drawing) {
					drawing = false;
					layer.draw();
				} else {
					trackEventStart = $(this).parent();
					var that = $(this);
					var wrapper = that.parent().parent();
					var mousePos = stage.getMousePosition();
					lineMouse = new Kinetic.Line({
						points: [0, 0, 50, 50],
						strokeWidth: 3,
						stroke: RED,
						lineCap: 'round',
						lineJoin: 'round',
						shadowColor: '#DDD',
						shadowBlur: 6,
						shadowOffset: 4,
						shadowOpacity: 0.5
					});
					layer.add(lineMouse);
					//start point and end point are the same
					lineMouse.getPoints()[0].x = that.parent().position().left + that.position().left;
					lineMouse.getPoints()[0].y = wrapper.position().top + that.outerHeight()/2 + that.position().top +1.5;
					lineMouse.getPoints()[1].x = lineMouse.getPoints()[0].x;
					lineMouse.getPoints()[1].y = lineMouse.getPoints()[0].y;

					drawing = true;
					layer.draw();
				}
				return false;
			});

			// When mouse drawing highlight track-event box
			$butterTrackEv.hover(function(e) {
				if (drawing) $(this).addClass("highlight");
			}, function() {
				$(this).removeClass("highlight");
			});
		}

		// Drawing lines along the cursor path
		this.drawLineEventMouse = function(stage, layer) {
			var trackNetwork = this, $wrapper;
			$(function() {
				$wrapper = $(".tracks-container-wrapper");

				// Try to close dialog when blur
				$(".butter-tray").on("mousedown", function(e) {
					try{ dialog.close() } catch(err){}
				});

				$wrapper.on("mousemove", function(e) {
					if (!drawing) return true;
					e.stopPropagation();
					var src = $(e.srcElement);
					// If track-event is hovered then calculate 'end-point-line'
					if (src.parents(".butter-track-event").length > 0 || src.hasClass("butter-track-event")) {
						var parent = $(e.srcElement).parents(".butter-track-event");
						if (src.hasClass("butter-track-event")) parent = src;
						lineMouse.getPoints()[1].x = parent.position().left;
						lineMouse.getPoints()[1].y = parent.height()/2 + parent.parent().position().top + parent.position().top;
					} else {
						lineMouse.getPoints()[1].x = e.offsetX;
						lineMouse.getPoints()[1].y = e.offsetY + $(e.srcElement).position().top;
					}
					
					layer.draw();
					return false;
				});

				$wrapper.on("mouseup", function(e) {
					if (!drawing) return true;
					e.stopPropagation();
					drawing = false;
					// we modify the orderedTrackEventsSet
					var src = $(e.srcElement);
					lineMouse.remove();
					if (src.parents(".butter-track-event").length > 0 || src.hasClass("butter-track-event")) {
						var parent = $(e.srcElement).parents(".butter-track-event");
						src.hasClass("butter-track-event") && !!(parent = src);
						lineMouse = trackNetwork.drawLineFromFirst(trackEventStart, parent, layer, {
							'color': GREEN,
							'manual': true
						});
					}
					layer.draw();
					return false;
				});



			});
		}
	}
	return TrackNetwork;
});