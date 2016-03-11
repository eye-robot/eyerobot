var sphero = require("sphero");
var orb = sphero("COM10");

orb.connect(function() { 
	console.log("Connected"); 
	var timer = setInterval(moveRandom, 1000);
});	

function moveRandom() {
	orb.roll(60, Math.floor(Math.random() * 360));
}