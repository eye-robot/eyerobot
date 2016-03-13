var SPEED = 255;

var serialport = require('serialport');
var string_decoder = require('string_decoder');

var zmq = require('zmq');

var Orb = require('../js/Orb.js');

var decoder = new string_decoder.StringDecoder('utf8');

var orb = new Orb(localStorage.getItem('sport'), 0xFFFFFF, SPEED);
var pupilSocket = zmq.socket('sub');
var trackerSocket = zmq.socket('sub');

var spheroConnected = false;
var pupilConnected = false;
var trackerConnected = false;

var spheroActive = true;

var gazeX = 0.5;
var gazeY = 0.5;
var spheroX = 0.5;
var spheroY = 0.5;

orb.setup(function() {
    spheroConnected = true;
    updateConnections();
});

pupilSocket.connect('tcp://' + localStorage.getItem('pip') + ':' + localStorage.getItem('pport'));
pupilSocket.subscribe('gaze');

pupilSocket.on('connect', function() {
    pupilConnected = true;
    updateConnections();
});

pupilSocket.on('message', function(topic, message) {
    message = JSON.parse(decoder.write(message));

    if (message.surfaces && message.surfaces[localStorage.getItem('surface')] && spheroConnected && trackerConnected) {
        gazeX = message.surfaces[localStorage.getItem('surface')][0];
        gazeY = message.surfaces[localStorage.getItem('surface')][1];
    }
});

pupilSocket.monitor(500, 0);

trackerSocket.connect('tcp://' + localStorage.getItem('bip') + ':' + localStorage.getItem('bport'));
trackerSocket.subscribe('ball');

trackerSocket.on('connect', function() {
    trackerConnected = true;
    updateConnections();
});

trackerSocket.on('message', function(topic, message) {
    message = decoder.write(message);
    if (message !== 'no data') {
        message = message.split(',');
        spheroX = message[0];
        spheroY = message[1];
    }
});

trackerSocket.monitor(500, 0);

function updateConnections() {
    if (spheroConnected) {
        document.getElementById('sphero').innerHTML = 'Connected!'
    }
    else {
        document.getElementById('sphero').innerHTML = 'Not connected.'
    }
    
    if (pupilConnected) {
        document.getElementById('pupil').innerHTML = 'Connected!'
    }
    else {
        document.getElementById('pupil').innerHTML = 'Not connected.'
    }
    
    if (trackerConnected) {
        document.getElementById('tracker').innerHTML = 'Connected!'
    }
    else {
        document.getElementById('tracker').innerHTML = 'Not connected.'
    }
}

function update() {
    document.getElementById('gazex').innerHTML = gazeX;
    document.getElementById('gazey').innerHTML = gazeY;
    document.getElementById('ballx').innerHTML = spheroX;
    document.getElementById('bally').innerHTML = spheroY;
    
    if (spheroActive) {
        document.getElementById('sphero').innerHTML = 'Active!'
        orb.rollTowards(spheroX, spheroY, gazeX, gazeY);
    }
    else {
        document.getElementById('sphero').innerHTML = 'Inactive.'
    }
};

document.getElementById('stop').style.display = 'none';

document.getElementById('start').onclick = function() {
    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'initial';
    orb.startCalibration();
};

document.getElementById('stop').onclick = function() {
    document.getElementById('start').style.display = 'initial';
    document.getElementById('stop').style.display = 'none';
    orb.finishCalibration();
};

setInterval(update, 250);

document.body.onmousemove = function(e) {
    if (localStorage.getItem('mouse') == 'enable') {
        gazeX = e.clientX / window.innerWidth;
        gazeY = e.clientY / window.innerHeight;
    }
};

document.body.onkeypress = function(e) {
    spheroActive = !spheroActive; 
};

function setWindow() {
    document.getElementById('videoelt').width = window.innerWidth;
    document.getElementById('videoelt').height = window.innerHeight;

    document.getElementById('status').style.width = window.innerWidth + 'px';
    document.getElementById('status').style.height = window.innerHeight + 'px';
}

window.onresize = setWindow;
setWindow();

function handleVideo(stream) {
    document.getElementById('videoelt').src = window.URL.createObjectURL(stream);
}

function getVideo() {
    if (window.stream) {
        document.getElementById('videoelt').src = null;
    }

    var source = document.getElementById('source').value;

    navigator.webkitGetUserMedia({
        video: {
            optional: [{
                sourceId: source
            }]
        }
    }, handleVideo, function() {});
}

MediaStreamTrack.getSources(function(sources) {
    for (var i = 0; i < sources.length; i++) {
        var sourceItem = sources[i];

        var option = document.createElement('option');

        option.value = sourceItem.id;

        if (sourceItem.kind === 'video') {
            option.text = sourceItem.label;
            document.getElementById('source').appendChild(option);
        }
    }
});

getVideo()

document.getElementById('source').onchange = getVideo;
