// Utility module over barebones Sphero control.

"use strict";

var sphero = require('sphero');

module.exports = function(port, initialColor, speed) {
	this.port = port;
	this.initialColor = initialColor;
	this.orbTimer = null;
	this.orb = null;
	this.speed = speed;

	this.setup = function(callback) {
		this.orb = sphero(port);

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

	// rolls the sphero from point (x1, y1) towards point (x2, y2)
	this.rollTowards = function(x1, y1, x2, y2) {
		var y = y2 - y1;
		var x = x2 - x1;
		var h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var direction = 180 * Math.atan2(y, x) / Math.PI;
		var convertedDir = this.convertDegrees(direction);
		this.orb.roll(this.speed * h, convertedDir);
	};

	// converts between actual degrees and the Sphero's messed up version of degrees
	this.convertDegrees = function(x) {
		return (360 - (x - 90)) % 360;
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