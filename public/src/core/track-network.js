/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [ "dialog/dialog" ], function( Dialog ) {

	function TrackNetwork(app) {
		var stage, layer, dialog, $wrapper, lineMouse, lineBack, $instStart, instStart, $scrollHandle,
			GREEN = "MediumSeaGreen",
			GREY = "silver",
			BLUE = "royalblue",
			RED = "red",
			_trackHeigh,
			_scrollLeft = 0,
			_scrollTop = 0;
			drawing = false;

		var trackNetwork = this;

		// Create Layer Canvas
		this.createCanvas = function() {
			if (!stage) {
				try {
					$wrapper = $(".tracks-container-wrapper");
					$scrollHandle = $wrapper.find(".tracks-container");
					_trackHeigh = app.tracks[0].view.element.offsetHeight;
					stage = new Kinetic.Stage({
						container: 'tracks-container-canvas'
					});
					layer = new Kinetic.Layer();
					stage.add(layer);
					stage.$content = $(stage.content);
				} catch(err) {
					stage = undefined;
					return false
				}
				layer.lines = {} // Object to save lines by ID
				this.createLineEventMouse(stage, layer);
			}
			_scrollLeft = $wrapper[0].scrollLeft;
			_scrollTop  = $scrollHandle.position().top;
			stage.setWidth($wrapper.width());
			stage.setHeight($wrapper.height());
			return true;
		}

		// List all tracks and then calculate coords for lines.
		this.calculateLines = function(evType, evTrack) {
			if (!this.createCanvas()) return;
			var tracks = app.orderedTrackEventsSet, tempTracksIDs, drawn;
			// Remove all lines when is trackeventremoved
			if (evType === "trackeventremoved") {
				this.cleanOldLines(evTrack, {});
			}

			for(var i in tracks) {
				var j = Number(i) + 1;
				tempTracksIDs = {} // We save the keys Id of the trackevents

				if( !tracks[j] ) { // there's not next track media
					for (var k in tracks[i]) { // so we clean all lines for every media
						this.drawManualLines(tracks[i][k], tempTracksIDs);
						this.cleanOldLines(tracks[i][k], tempTracksIDs);
					}
					break;
				}; // tracks[j] == Next track media

				// Draw lines
				if (tracks[i].length === 1) {
					if (tracks[i][0].type === "quizme") { // Then draw lines (1-M)
						for (var l in tracks[j]) { // draw lines for the nextSet
							this.drawLine(tracks[i][0], tracks[j][l]);
							tempTracksIDs[tracks[j][l].id] = true; // This means is not a old lines
						}
						this.drawManualLines(tracks[i][0], tempTracksIDs); // Draw manual Lines
						this.cleanOldLines(tracks[i][0], tempTracksIDs); // Clean the old ones
						continue;
					}
				}
				if (tracks[j].length === 1) { // Draw lines (M-1)
					for (var k in tracks[i]) {
						tempTracksIDs = {};
						drawn = this.drawManualLines(tracks[i][k], tempTracksIDs); // Draw manual Lines
						if (!drawn || (!tempTracksIDs[tracks[j][0].id] && tracks[i][k].type === "quizme")) {
							if (this.drawLine(tracks[i][k], tracks[j][0])) {
								tempTracksIDs[tracks[j][0].id] = true; // This means is not a old lines
							}
							this.cleanOldLines(tracks[i][k], tempTracksIDs); // Clean the old ones
						}
					}
				}
				else { // Draw lines with media in the same Track
					for (var k in tracks[i]) {
						tempTracksIDs = {};
						if ( this.drawManualLines(tracks[i][k], tempTracksIDs) ) { // Draw Manual Lines
							continue;
						}
						drawn = false;
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
					layer.lines[id].startTrackEvent,
					layer.lines[id].endTrackEvent,
					layer.lines[id].backward
				);
				if (!points) return;
				// update points of every line
				layer.lines[id].setPoints(points);
			});
			layer.draw();
		}

		this.calculatePoints = function(start, end, backward) {
			var aux, track, trackOrder, trackTop, $start, $end;
			$start = start.$element;
			$end = end.$element;
			try { // Points (Start , End)
				var start_x = $start.position().left + $start.width() - _scrollLeft;
				var start_y = $start.parent().position().top + $start.height()/2 + _scrollTop;
				var end_x   = $end.position().left - _scrollLeft;
				var end_y   = $end.parent().position().top + $end.height()/2 + _scrollTop;
			} catch(ex) {
				return false;
			}
			aux = [start_x, start_y];
			// calculate the points for a backward line
			if (backward) {
				track = start.track._media.findNextAvailableTrackFromTimes(
					end.popcornOptions.start,
					start.popcornOptions.end);
				if (!track) {
					track = start.track._media.orderedTracks[start.track._media.tracks.length-1]; // last Track
					trackOrder = track.order + 1;
				} else {
					trackOrder = track.order;
				}
				// trackTop for 'start' trackEvent
				trackTop = (trackOrder - start.track.order) * _trackHeigh;
				// point 2
				aux.push( start_x + 15 );
				aux.push( start_y + (trackOrder - start.track.order)*_trackHeigh/2 );
				// point 3
				aux.push( start_x + 15 );
				aux.push( start_y + trackTop );
				// trackTop for 'end' trackEvent
				trackTop = (trackOrder - end.track.order) * _trackHeigh;
				// point 4
				aux.push( end_x - 15 );
				aux.push( aux[5] ); // same as point3
				// point 5
				aux.push( end_x - 15 );
				aux.push( end_y + (trackOrder - end.track.order)*_trackHeigh/2 );
			}
			aux.push(end_x);
			aux.push(end_y);
			return aux;
		}

		// Draw Lines between two points
		this.drawLine = function(start, end, options) {
			if ( options === undefined ) options = {};
			if ( !options.manual && start.linesTo && 
					start.linesTo[end.id] === false ) {
				return false; // Line was removed
			}

			var points = this.calculatePoints(start, end, options.backward);
			if (!points) return false;

			// Look if there is a line
			if (start.linesTo && start.linesTo[end.id] instanceof Kinetic.Line) {
				var line = start.linesTo[end.id]; // get line by id
				line.setPoints(points);
				if (options.manual && options.color) {
					line.attrs.stroke = options.color; // change color
				}
				this.removeOthersLines(start, end.id);
			}
			else { // New line
				if (!options.color) options.color = GREY; // Default color gray

				var line = new Kinetic.Line({ // Create Kinetic Line
					points: points,
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
							assured: "correct answer", // default assured by answered correctly
							userAnswer: "true"
						},
						keyrule: 'score' // by Default
					}
				} else { // others plugins
					line.popup = {
						pass: "true",
						keyrule: 'pass' // by Default
					}
				}
				line.popup.instance = end.popcornTrackEvent;
				// Create event popup dialog for line
				line.on('click', function (ev) {
					if (ev.offsetX) {
						this.popup.left = ev.offsetX;
						this.popup.top  = ev.screenY;
					} else { // Firefox
						this.popup.left = ev.pageX - stage.$content.offset().left;
						this.popup.top  = ev.screenY;
					}
					dialog = Dialog.spawn( "dinamic", {
						data: {
							popup: this.popup,
							lineId: this._id,
							trackEvent: start
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
			if (options.manual) line.manual = true;
			if (options.backward || line.backward) {
				line.backward = true;
				line.popup.backward = true;
			} else {
				line.popup.backward = false;
			}
			return true;
		}

		this.drawManualLines = function(trackA, tempKeys) {
			if (!tempKeys) tempKeys = {};
			var options = {manual: true};
			var drawn = false, trackB;
			!!trackA.linesTo && Object.keys(trackA.linesTo).forEach(function(id) {
				if (!tempKeys[id] && !!trackA.linesTo[id] && trackA.linesTo[id].manual) {
					trackB = app.getTrackEvents( "id", id )[0];
					if (!!trackB) {
						// if the drawing is backwards then draw a backwards-line with options backward = true
						if (trackA.popcornTrackEvent.setMedia !== trackB.popcornTrackEvent.setMedia) {
							if (trackA.popcornOptions.start >= trackB.popcornOptions.start) { // Draw Backward Line
								options.backward = true;
							}
						}
						else { // Draw Backward Line in Same Set
							options.backward = true;
						}
						if ( trackNetwork.drawLine(trackA, trackB, options) ) {
							tempKeys[id] = true;
							drawn = true;
						}
					}
				}
			});
			return drawn;
		}

		// Draw line from mouse event
		this.drawLineFromEvent = function($objA, $objB, options) {
			if ( !$objA.jquery || !$objB.jquery ) return;
			var trackA = app.getTrackEvents( "id", $objA.attr('data-butter-trackevent-id') )[0];
			var trackB = app.getTrackEvents( "id", $objB.attr('data-butter-trackevent-id') )[0];
			if (!trackA || !trackB) return;
			// if some trackEvent is a SubTrackEvent look for the parent
			if (trackA.superTrackEvent.isSubTrackEvent) {
				trackA = trackA.superTrackEvent.parent;
			}
			if (trackB.superTrackEvent.isSubTrackEvent) {
				trackB = trackB.superTrackEvent.parent;
			}

			// if the drawing is backwards then draw a backwards-line with options backward = true
			if (trackA.popcornTrackEvent.setMedia !== trackB.popcornTrackEvent.setMedia) {
				if (trackA.popcornOptions.start >= trackB.popcornOptions.start) { // Draw Backward Line
					console.log("Draw Backward Line");
					options.backward = true;
				}
			}
			else { // Draw Backward Line in Same Set
				console.log("Draw Backward Line (in the same Set)");
				options.backward = true;
			}
			this.drawLine(trackA, trackB, options);
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

		// Active all instance of this branch
		this.enableAll = function(that, instance) {
			if (instance.isSuperTrackEvent) { // Enable all SubTrackEvents
				for (var i in  instance.subTrackEvents) {
					instance.subTrackEvents[i].disable = false;
				}
			}
			if (!instance.rulesTo) { // is leaf node
				instance.disable = false;
			} else {
				Object.keys(instance.rulesTo).forEach(function(id) {
					if (instance.rulesTo[id] !== false) {
						that.enableAll(that, instance.rulesTo[id].instance);
					}
				});
				instance.disable = false;
			}
	    }

		this.removeLine = function(id) {
			var line = layer.lines[id];
			// False means It's a deleted line
			line.startTrackEvent.linesTo[line.endTrackEvent.id] = false;
			line.startTrackEvent.popcornTrackEvent.rulesTo[line.endTrackEvent.id] = false;
			if (!line.backward) {
				this.enableAll(this, line.endTrackEvent.popcornTrackEvent); // active trackEvents of this branch
			}
			delete layer.lines[id]; // remove reference in the layer
			line.remove();
			layer.draw();
		}

		this.clearLayer = function() {
			layer.children.splice(0);
			layer.draw();
		}

		this.calculatePointsEvent = function(start, points) {
			var aux, track, trackOrder, trackTop;
			aux = [points[0], points[1]];
			// calculate the points for a backward line
			track = start.track._media.findNextAvailableTrackFromTimes(
				start.popcornOptions.start,
				start.popcornOptions.end);
			if (!track) {
				track = start.track._media.orderedTracks[start.track._media.tracks.length-1]; // last Track
				trackOrder = track.order + 1;
			} else {
				trackOrder = track.order;
			}
			// trackTop for 'start' trackEvent
			trackTop = (trackOrder - start.track.order) * _trackHeigh;
			// point 2
			aux.push( aux[0] + 15 );
			aux.push( aux[1] + (trackOrder - start.track.order)*_trackHeigh/2 );
			// point 3
			aux.push( aux[0] + 15 );
			aux.push( aux[1] + trackTop );
			// point 4
			aux.push( points[2] );
			aux.push( aux[1] + trackTop );
			// point 5
			aux.push( points[2] );
			aux.push( points[3] );

			return aux;
		}

		// Reset all events and then bind the events again (cause live events seem dont works)
		this.mouseDownDrawing = function(stage, layer) {
			var $butterTrackEv = $wrapper.find(".butter-track-event");
			$butterTrackEv.find(".right-handle-line").off();
			$butterTrackEv.off();

			// EventListener for handle pointers
			$butterTrackEv.find(".right-handle-line")
			.on("mousedown" ,  function(e) {
				e.stopPropagation();
				e.preventDefault();
				if (drawing) {
					drawing = false;
					layer.draw();
				} else {
					$instStart = $(this).parent();
					instStart = app.getTrackEvents( "id", $instStart.attr('data-butter-trackevent-id') )[0];
					var $that = $(this);
					var $wrap = $that.parent().parent();
					lineMouse = new Kinetic.Line({
						points: [0, 0, 50, 50],
						strokeWidth: 3,
						stroke: RED,
						lineCap: 'round',
						lineJoin: 'round',
						shadowColor: GREY,
						shadowBlur: 6,
						shadowOffset: 4,
						shadowOpacity: 0.4
					});
					lineBack = new Kinetic.Line({
						points: [0, 0, 50, 50],
						strokeWidth: 3,
						stroke: BLUE,
						lineCap: 'round',
						lineJoin: 'round',
						shadowColor: GREY,
						shadowBlur: 6,
						shadowOffset: 4,
						shadowOpacity: 0.2
					});
					layer.add(lineMouse);
					layer.add(lineBack);
					//start point and end point are the same
					var points = [
						$that.parent().position().left + $that.position().left,
						$wrap.position().top + $that.outerHeight()/2 + $that.position().top +1.5
					];
					points.push(points[0]);
					points.push(points[1]);
					lineMouse.setPoints(points);

					drawing = true;
					layer.draw();
				}
			});

			// When mouse drawing highlight track-event box
			$butterTrackEv.hover(function(e) {
				if (drawing) $(this).addClass("highlight");
			}, function() {
				$(this).removeClass("highlight");
			});
		}

		// Drawing lines along the cursor path
		this.createLineEventMouse = function(stage, layer) {
			var points, pointOrig, pointDest, $src, $parent;

			// Try to close dialog when blur
			$(".butter-tray").on("mousedown", function(e) {
				try { dialog.close() } catch(err) {};
				app.deselectAllTrackEvents();
			});

			$wrapper.on("mousemove", function(e) {
				if (!drawing) return true;
				e.stopPropagation();
				e.preventDefault();
				if (!e.srcElement) {
					$src = $(e.originalEvent.originalTarget);
				} else {
					$src = $(e.srcElement);
				}
				// If track-event is hovered then calculate 'end-point-line'
				if ($src.parents(".butter-track-event").length > 0 || $src.hasClass("butter-track-event")) {
					$parent = $src.parents(".butter-track-event");
					if ($src.hasClass("butter-track-event")) $parent = $src;
					lineMouse.getPoints()[1].x = $parent.position().left;
					lineMouse.getPoints()[1].y = $parent.height()/2 + $parent.parent().position().top;
				} else {
					if (e.offsetX) {
						lineMouse.getPoints()[1].x = e.offsetX;
						lineMouse.getPoints()[1].y = e.offsetY;
					} else { // Firefox
						lineMouse.getPoints()[1].x = e.pageX - stage.$content.offset().left;
						lineMouse.getPoints()[1].y = e.pageY - stage.$content.offset().top;
					}
				}
				pointOrig = lineMouse.getPoints()[0];
				pointDest = lineMouse.getPoints()[1];
				if (pointDest.x - pointOrig.x < 0) {
					points = trackNetwork.calculatePointsEvent(instStart,
						[pointOrig.x, pointOrig.y, pointDest.x, pointDest.y]
					);
					lineBack.setPoints(points);
					lineBack.show();
				} else {
					lineBack.hide();
				}			
				layer.draw();
			});

			$wrapper.on("mouseup", function(e) {
				if (!drawing) return true;
				e.stopPropagation();
				e.preventDefault();
				drawing = false;

				if (!e.srcElement) {
					$src = $(e.originalEvent.originalTarget);
				} else { // Firefox
					$src = $(e.srcElement);
				}
				lineMouse.remove();
				lineBack.remove();

				if ($src.parents(".butter-track-event").length > 0 || $src.hasClass("butter-track-event")) {
					$parent = $src.parents(".butter-track-event");
					$src.hasClass("butter-track-event") && !!($parent = $src);
					trackNetwork.drawLineFromEvent($instStart, $parent, {
						color: GREEN,
						manual: true
					});
				}
				layer.draw();
			});
		}
	}

	return TrackNetwork;
});