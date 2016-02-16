var orbControl = require('./OrbControl.js');
var zmq = require('zmq');
var string_decoder = require('string_decoder');

var connected = false;

const decoder = new string_decoder.StringDecoder('utf8');

var socket = zmq.socket('sub');

socket.connect('tcp://127.0.0.1:5000');
socket.subscribe('gaze');

console.log('Listening on port 5000');

orbControl.setup(function() {
    connected = true;
});

socket.on('message', function(topic, message) {
    message = JSON.parse(decoder.write(message));

    if (message.surfaces && message.surfaces.testpage) {
        console.log(message.surfaces.testpage);
    }

    if (message.surfaces && message.surfaces.testpage && connected) {
        orbControl.rollDirection(message.surfaces.testpage[0], message.surfaces.testpage[1])();
    }
});
