import zmq
import time

port = 5567;
context = zmq.Context();
socket = context.socket(zmq.SUB);
socket.connect("tcp://localhost:%s" % port);
socket.setsockopt(zmq.SUBSCRIBE,'');
print("Connecting to port " + str(port));

while True:
	message = socket.recv();
	print("Received reply: " + message);