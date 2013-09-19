/*
	@autor: Robin Giles Ribera
	* Module: TrackNetwork
	* Used on trackevent.js
*/

define( [], function() {
	console.log("[TrackNetwork][***###***]");

	function TrackNetwork() {

		this.drawLine = function() {
			console.log("[DrawLine][***###***]");
			var canvasElem = document.getElementById("tracks-container-canvas");
			if (!canvasElem) return;

			var ctx = canvasElem.getContext("2d");
			var lines = [];

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