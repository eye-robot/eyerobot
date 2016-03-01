# import the necessary packages
from collections import deque
import numpy as np
import argparse
import imutils
import cv2
import zmq
import time

# setup zmq
port = 5567;
context = zmq.Context();
socket = context.socket(zmq.PUB);
socket.bind("tcp://*:%s" % port);
time.sleep(1);

# num points to keep track of
buffer = 10;

# define the lower and upper boundaries of the "green"
# ball in the HSV color space, then initialize the
# list of tracked points

# green:
# colorLower = (29, 86, 6)
# colorUpper = (64, 255, 255)

# water bottle (Courtney):
# colorLower = (0, 101, 0);
# colorUpper = (59, 192, 255);

# can opener:
# colorLower = (255, 255, 255);
# colorUpper = (255, 255, 255);

# purple sphero:
# colorLower = (136, 252, 192);
# colorUpper = (255, 255, 255);

# blue sphero:
# colorLower = (255, 255, 0);
# colorUpper = (255, 255, 255);
colorLower = (0, 2, 107);
colorUpper = (134, 73, 222);

pts = deque(maxlen=buffer)

camera = cv2.VideoCapture(0)
width = camera.get(3);
height = camera.get(4);

count = 0;
avgx = 0;
avgy = 0;
avgr = 0;
avg = 5;
# keep looping
while True:
	message = "no data";
	# grab the current frame
	(grabbed, frame) = camera.read()

	# if we are viewing a video and we did not grab a frame,
	# then we have reached the end of the video
	if not grabbed:
		break

	# resize the frame, blur it, and convert it to the HSV
	# color space
	frame = imutils.resize(frame, width=600)
	blurred = cv2.GaussianBlur(frame, (11, 11), 0)
	# hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

	# construct a mask for the color "green", then perform
	# a series of dilations and erosions to remove any small
	# blobs left in the mask
	mask = cv2.inRange(frame, colorLower, colorUpper)
	mask = cv2.erode(mask, None, iterations=2)
	mask = cv2.dilate(mask, None, iterations=2)

	# find contours in the mask and initialize the current
	# (x, y) center of the ball
	cnts = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL,
		cv2.CHAIN_APPROX_SIMPLE)[-2]
	center = None

	# only proceed if at least one contour was found
	if len(cnts) > 0:
		# find the largest contour in the mask, then use
		# it to compute the minimum enclosing circle and
		# centroid
		c = max(cnts, key=cv2.contourArea)
		((x, y), radius) = cv2.minEnclosingCircle(c)
		M = cv2.moments(c)
		center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
		avgx += center[0];
		avgy += center[1];
		avgr += radius;
		count += 1;

		# only proceed if the radius meets a minimum size
		if radius > 10:
			# draw the circle and centroid on the frame,
			# then update the list of tracked points
			if count >= avg:	
				avgx = int(float(avgx) / avg);
				avgy = int(float(avgy) / avg);
				avgr = int(float(avgr) / avg);

				cv2.circle(frame, (avgx, avgy), 5, (255, 0, 0), -1)

				count = 0;
				# update the points queue
				pts.appendleft((avgx, avgy));
				ratioX = float(avgx) / width;
				ratioY = float(avgy) / height;
				message = str(ratioX) + "," + str(ratioY);
				avgx = 0;
				avgy = 0;
				avgr = 0;
			# cv2.circle(frame, center, 5, (0, 255, 0), -1)
			# cv2.circle(frame, (int(x), int(y)), int(radius),
				# (0, 255, 255), 1);

	# loop over the set of tracked points
	for i in xrange(1, len(pts)):
		# if either of the tracked points are None, ignore
		# them
		if pts[i - 1] is None or pts[i] is None:
			continue

		# otherwise, compute the thickness of the line and
		# draw the connecting lines
		thickness = int(np.sqrt(buffer / float(i + 1)) * 2.5)
		cv2.line(frame, pts[i - 1], pts[i], (0, 0, 255), thickness)

	# show the frame to our screen
	cv2.imshow("Frame", frame)
	key = cv2.waitKey(1) & 0xFF
	print("Sending message: " + message);
	socket.send(message);
	# if the 'q' key is pressed, stop the loop
	if key == ord("q"):
		break

# cleanup the camera and close any open windows
camera.release()
cv2.destroyAllWindows()