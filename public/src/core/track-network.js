/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [ "dialog/dialog" ], function( Dialog ) {

	function TrackNetwork(app) {
		var lines, stage, layer, dialog, $wrapper, lineMouse, trackEventStart;
		var GREEN = "#3FB58E";
		var GREY = "CCC";
		var RED = "red";
		var drawing = false;
		var trackNetwork = this;

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
				layer.lines = {} // Object to save lines by ID
				this.drawLineEventMouse(stage, layer);
			}
			stage.setWidth($wrapper.width());
			stage.setHeight($wrapper.height());
			return true;
		}

		// List all tracks and then calculate coords for lines.
		this.calculateLines = function(evType, evTrack) {
			if (!this.createCanvas()) return;
			var tracks = app.orderedTrackEventsSet, tempTracksIDs;
			// Remove all lines when is trackeventremoved
			if (evType === "trackeventremoved") {
				this.cleanOldLines(evTrack, {});
			}

			for(var i in tracks) {
				var j = Number(i) + 1;
				tempTracksIDs = {} // We save the keys Id of the trackevents

				if( !tracks[j] ) { // there's not next track media
					for (var k in tracks[i]) { // so we clean all lines for every media
						this.cleanOldLines(tracks[i][k], {});
					}
					break;
				}; // tracks[j] == Next track media

				// Draw lines
				if (tracks[i].length === 1) {
					if (tracks[i][0].type === "quizme") { // Then draw lines (1-M)
						for (var l in tracks[j]) {
							this.drawLine(tracks[i][0], tracks[j][l]);
							tempTracksIDs[tracks[j][l].id] = true; // This means is not a old lines
						}
						this.cleanOldLines(tracks[i][0], tempTracksIDs); // Clean the old ones
						continue;
					} 
				}
				if (tracks[j].length === 1) { // Draw lines (M-1)
					for (var k in tracks[i]) {
						if ( !this.drawLine(tracks[i][k], tracks[j][0]) || tracks[i][k].type === "quizme" ) {
							tempTracksIDs = {};
							tempTracksIDs[tracks[j][0].id] = true; // This means is not a old lines
							this.cleanOldLines(tracks[i][k], tempTracksIDs); // Clean the old ones
						}
					}
				}
				else { // Draw lines with media in the same Track
					var drawn;
					for (var k in tracks[i]) {
						// Draw Manual Lines
						if ( this.drawManualLines(tracks[i][k]) ) {
							continue;
						}
						drawn = false;
						tempTracksIDs = {};
						for (var l in tracks[j]) {
							// Then draw line between tracks in the same layer
							if (tracks[i][k].track.id === tracks[j][l].track.id) {
								if (this.drawLine(tracks[i][k], tracks[j][l])) {
									drawn = true;
								}
								tempTracksIDs[tracks[j][l].id] = true; // This means is not a old lines
								break; // Just one line
							}
						}
						if (!drawn || tracks[i][k].type === "quizme") {
							this.cleanOldLines(tracks[i][k], tempTracksIDs); // Clean the old ones
						}
					}
				}
			}
			if (tracks.length > 0) {
				layer.draw();
			}
			this.mouseDownDrawing(stage, layer);
		}

		// calculate and redraw all lines of the layer
		this.updateLinesOfLayer = function() {
			if (!stage) {
				this.calculateLines();
				return;
			} else {
				this.createCanvas();
			}
			var points;
			Object.keys(layer.lines).forEach(function(id) {
				points = trackNetwork.calculatePoints(
					layer.lines[id].startTrackEvent.$element,
					layer.lines[id].endTrackEvent.$element
				);
				if (!points) return;
				// update points of every line
				layer.lines[id].getPoints()[0].x = points[0];
				layer.lines[id].getPoints()[0].y = points[1];
				layer.lines[id].getPoints()[1].x = points[2];
				layer.lines[id].getPoints()[1].y = points[3];
			});
			layer.draw();
		}

		this.calculatePoints = function($start, $end) {
			try { // Points (Start , End)
				var start_x = $start.position().left + $start.width();
				var start_y = $start.parent().position().top + $start.height()/2;
				var end_x   = $end.position().left;
				var end_y   = $end.parent().position().top + $end.height()/2;
				return [start_x, start_y, end_x, end_y];
			} catch(ex) {
				return false;
			}
		}

		// Draw Lines between two points
		this.drawLine = function(start, end, options) {
			if ( options === undefined ) options = {};
			if ( !options.manual && start.linesTo && 
					start.linesTo[end.id] === false ) {
				return false; // Line was removed
			}

			var points = this.calculatePoints(start.$element, end.$element);
			if (!points) return false;

			// Look if there is a line
			if (start.linesTo && start.linesTo[end.id] instanceof Kinetic.Line) {
				var line = start.linesTo[end.id]; // get line by id
				line.getPoints()[0].x = points[0];
				line.getPoints()[0].y = points[1];
				line.getPoints()[1].x = points[2];
				line.getPoints()[1].y = points[3];
				if (options.manual && options.color) {
					line.attrs.stroke = options.color; // change color
				}
				this.removeOthersLines(start, end.id);
			}
			else { // New line
				if (!options.color) options.color = GREY; // Default color gray

				var line = new Kinetic.Line({ // Create Kinetic Line
					points: [points[0], points[1], points[2], points[3]],
					stroke: options.color,
					strokeWidth: 5,
					lineCap: 'round',
					lineJoin: 'round'
				});

				if (start.type === "quizme") { // Rule for plugin quizme
					line.popup = {
						pass: "true",
						score: ["more-equal", 50],
						questions: {
							name: start.popcornOptions.name, // name Quiz
							assured: "answer pass", // default asssure by respond (respond || answers)
							answerpass: "true", // default assured by answered correctly
						},
						keyrule: 'score' // by Default
					}
				} else { // others plugins
					line.popup = {
						pass: "true",
						keyrule: 'pass' // by Default
					}
				}
				// Create event popup dialog for line
				line.on('click', function (ev) {
					this.popup.left = ev.offsetX;
					this.popup.top  = ev.screenY;
					dialog = Dialog.spawn( "dinamic", {
						data: {
							popup: this.popup,
							lineId: this._id
						},
						events: {
							delete: function(e) { // e.Data is LineId
								// remove line.id from layer
								trackNetwork.removeLine(e.data);
								dialog.close();
							}
						}
					});
					dialog.open( "empty" );
				});

				layer.add(line);
				layer.lines[line._id] = line;

				// Save "line" and "popup rule" into the object
				this.saveLinesTo(start, end.id, line);
				// Save references to the tracks events
				line.startTrackEvent = start;
				line.endTrackEvent = end;
			}
			if (options.manual) {
				line.manual = true;
			}
			return true;
		}

		this.drawManualLines = function(trackA, options) {
			var drawn = false, aux;
			for (var id in trackA.linesTo) {
				var trackB = app.getTrackEvents( "id", id )[0];
				if (!!trackB && !!trackA.linesTo[id] && trackA.linesTo[id].manual) {
					if ( this.drawLine(trackA, trackB, {manual: true}) ) {
						drawn = true;
					}
				}
			}
			return drawn;
		}

		// Draw manual lines from first track to the last track
		this.drawLineFromFirst = function($objA, $objB, options) {
			if ( !$objA.jquery || !$objB.jquery ) return;

			var trackA = app.getTrackEvents( "id", $objA.attr('data-butter-trackevent-id') )[0];
			var trackB = app.getTrackEvents( "id", $objB.attr('data-butter-trackevent-id') )[0];
			if (!trackA || !trackB) return;

			if (trackA.popcornOptions.start <= trackB.popcornOptions.start) {
				this.drawLine(trackA, trackB, options);
			} else {
				this.drawLine(trackB, trackA, options);
			}
		}

		// Save line into object track event
		this.saveLinesTo = function(obj, id, line) {
			if ($.isEmptyObject(obj.linesTo)) {
				obj.linesTo = {}
				obj.popcornTrackEvent.rulesTo = {}
			} else {
				this.removeOthersLines(obj, id);
			}
			obj.linesTo[id] = line; // Save new line
			obj.popcornTrackEvent.rulesTo[id] = line.popup;
		}
		this.removeOthersLines = function(obj, id) {
			// if it's not a trackEvent quizme then remove all lines before
			if (obj.type !== "quizme") {
				Object.keys(obj.linesTo).forEach(function(trackID) {
					if (obj.linesTo[trackID] instanceof Kinetic.Line && id !== trackID) {
						delete layer.lines[obj.linesTo[trackID]._id] // delete from layer
						obj.linesTo[trackID].remove(); // remove line from layer children
					}
					if (id !== trackID) {
						delete obj.linesTo[trackID]; // Remove all lines from TrackEvent
						delete obj.popcornTrackEvent.rulesTo[trackID] // from popcornTrackEvent
					}
				});
			}
		}

		// Remove old lines references
		this.cleanOldLines = function(obj, tempKeys) {
			if ( obj && obj.linesTo ) {
				Object.keys(obj.linesTo).forEach(function(trackID) {
					if (!tempKeys[trackID]) { // It's an old line
						try {
							delete layer.lines[obj.linesTo[trackID]._id] // delete from layer
							obj.linesTo[trackID].remove(); // remove line from layer children
						}
						catch(err) {}
						try {
							delete obj.linesTo[trackID]; // Remove all lines from TrackEvent
							delete obj.popcornTrackEvent.rulesTo[trackID]; // from popcornTrackEvent
						}
						catch(err) {}
					}
				});
			}
		}

		this.removeLine = function(id) {
			var line = layer.lines[id];
			// False means It's a deleted line
			line.startTrackEvent.linesTo[line.endTrackEvent.id] = false;
			line.startTrackEvent.popcornTrackEvent.rulesTo[line.endTrackEvent.id] = false;
			delete layer.lines[id]; // remove reference in the layer
			line.remove();
			layer.draw();
		}

		this.clearLayer = function() {
			layer.children.splice(0);
			layer.draw();
		}

		// Reset all events and then bind the events again (cause live events seem dont works)
		this.mouseDownDrawing = function(stage, layer) {
			var $butterTrackEv = $wrapper.find(".butter-track-event");
			$butterTrackEv.find(".left-handle-line, .right-handle-line").off();
			$butterTrackEv.off();

			// EventListener for handle pointers
			$butterTrackEv.find(".left-handle-line, .right-handle-line")
			.on("mousedown" ,  function(e) {
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
			var trackNetwork = this;

			// Try to close dialog when blur
			$(".butter-tray").on("mousedown", function(e) {
				try { dialog.close() } catch(err) {}
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
					lineMouse = trackNetwork.drawLineFromFirst(trackEventStart, parent, {
						color: GREEN,
						manual: true
					});
				}
				layer.draw();
				return false;
			});
		}
	}

	return TrackNetwork;
});