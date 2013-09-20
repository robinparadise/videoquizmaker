/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [], function() {

	function TrackNetwork() {

		var lines, canvas, ctx;

		// List all tracks and then calculate coords for lines.
		this.calculateLines = function() {
			lines = [];
			var tracks = Butter.app.orderedTrackEvents;

			console.log("[calculateLines][***&&&***]");
			console.log("[calculateLines]", tracks);

			var start, end, start_x, start_y, start_ID, end_x, end_y, end_ID;
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

				this.addLine(start_x, start_y, end_x, end_y, "#3FB58E");
			}
			console.log("[calculateLines][***END Loop***]");
			console.log("[calculateLines][***Lines***]", lines);
			this.drawLines();
		}

		//Adds a line in the drawing loop of the background canvas
		this.addLine = function(start_x, start_y, end_x, end_y, color) {
			lines.push({
				start:{
					x: start_x,
					y: start_y
				},
				end:{
					x: end_x,
					y: end_y
				},
				'color': color?color:"#"+("000"+(Math.random()*(1<<24)|0).toString(16)).substr(-6)
			});
		}

		this.drawLines = function() {
			console.log("[DrawLine][***###***]");

			canvas = document.getElementById("tracks-container-canvas");
			if (!canvas) return;
			ctx = ctx?ctx:canvas.getContext("2d");

			console.log("[DrawLine][***getContext OK***]");

			ctx.fillStyle="#fff";
			//Clear the background
			canvas.width = canvas.width;

			for(var i in lines) {
			//Draw each line in the draw buffer            
				ctx.beginPath();
				ctx.lineWidth = 3;//Math.floor((1+Math.random() * 10));
				ctx.strokeStyle = lines[i].color;
				ctx.moveTo(lines[i].start.x, lines[i].start.y);
				ctx.lineTo(lines[i].end.x, lines[i].end.y);
				ctx.stroke();
			}	
		}
	}
	return TrackNetwork;
})