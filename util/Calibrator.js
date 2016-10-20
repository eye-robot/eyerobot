var prompt = require("prompt");

calibrate();
function calibrate(o) {
	prompt.start();
	o.orb.startCalibration();
	prompt.get(['Press enter to finish calibration:'], function(err, result) {
		console.log("Finishing calibration");
		o.orb.finishCalibration();
	});
}

module.exports = calibrate;
