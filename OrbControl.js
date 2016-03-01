"use strict";

var port = "/dev/tty.Sphero-ORO-AMP-SPP"; // change to the port the sphero is connected to
// var port = "/COM4";

function orbControl(port, initialColor) {
	this.port = port;

	this.initialColor = initialColor;

	this.orbTimer = null;

	this.orb = null;

	this.setup = function(callback) {
		this.sphero = require("sphero");
		this.orb = this.sphero(port);

		var boundColor = this.changeColorDefault.bind(this);
		this.orb.connect(callback);	

		return this.orb;
	};

	this.changeColor = function(color) {
		this.orb.color(color);
	};

	this.changeColorDefault = function() {
		this.changeColor(this.initialColor);
	}

	// rolls sphero in a direction based on x/y coordinates of
	// gaze in screen: Up if in the upper 1/3, down if in the lower 1/3,
	// left/right if in left/right 1/3, nowhere if in middle
	this.rollDirection = function(xWidthRatio, yHeightRatio) {
		// x = x * 1.0;
		// y = y * 1.0;
		// var xWidthRatio = x / width;
		// var yHeightRatio = y / height;
		console.log("xratio: " + xWidthRatio);
		console.log("yratio: " + yHeightRatio);
		var direction;
		if (xWidthRatio < .25) {
			if (yHeightRatio < .25) {
				direction = this.moveUpLeft;
			} else if (yHeightRatio > .75) {
				direction = this.moveDownLeft;
			} else {
				direction = this.moveLeft;
			}
		} else if (xWidthRatio > .75) {
			if (yHeightRatio < .25) {
				direction = this.moveUpRight;
			} else if (yHeightRatio > .75) {
				direction = this.moveDownRight;
			} else {
				direction = this.moveDown;
			}
		} else {
			if (yHeightRatio < .25) {
				direction = this.moveUp;
			} else if (yHeightRatio > .75) {
				direction = this.moveDown;
			} else {
                direction = this.stop;
				this.orb.stop();
			}
		}
		console.log("direction: " + direction);
		var boundDirection = direction.bind(this);
		return boundDirection;
	};

	this.moveLeft = function() {
		this.orb.roll(50, 270)
	};
	this.moveRight = function() {
		this.orb.roll(50, 90);
	};
	this.moveDown = function() {
		this.orb.roll(50, 180);
	};
	this.moveUp = function() {
		this.orb.roll(50, 0);
	};
	this.moveUpLeft = function() {
		this.orb.roll(50, 315);
	};
	this.moveUpRight = function() {
		this.orb.roll(50, 45);
	};
	this.moveDownLeft = function() {
		this.orb.roll(50, 225);
	};
	this.moveDownRight = function() {
		this.orb.roll(50, 135);
	};
    this.stop = function() {
        this.orb.roll(0, 0);
    };

	this.startCalibration = function() {
		this.orb.setBackLed(1000);
	};

	this.rotate = function(degree) {
		this.orb.roll(0, degree);
	}

	this.finishCalibration = function() {
		this.orb.startCalibration();
		this.orb.finishCalibration();
	}
}

// module.exports = new orbControl("/dev/tty.Sphero-ORO-AMP-SPP", "red");
module.exports = new orbControl("/COM4", "red");