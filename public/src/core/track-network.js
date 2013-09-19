/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [], function() {

	function TrackNetwork() {

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

		this.drawLine = function() {
			console.log("[DrawLine][***###***]");
			var canvasElem = document.getElementById("tracks-container-canvas");
			if (!canvasElem) return;

			var ctx = canvasElem.getContext("2d");
			var lines = [];

			console.log("[DrawLine][***getContext OK***]");

			ctx.fillStyle="#fff";
			//Clear the background
			ctx.width = ctx.width;

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