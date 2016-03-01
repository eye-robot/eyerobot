import numpy as np;
import cv2;
import argparse;
import imutils;

parser = argparse.ArgumentParser();
parser.add_argument("--image", required = False, help = "Path to image being used");
args = vars(parser.parse_args());

colorLower = (148, 105, 0);
colorUpper = (255, 255, 197);

camera = cv2.VideoCapture(0);

count = 0;

while True:
	count += 1;
	(grabbed, image) = camera.read();
	if not grabbed:
		break;

	outputImage = image.copy();

	frame = imutils.resize(image, width=600)
	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY);
	frame = cv2.GaussianBlur(frame, (11, 11), 0)

	mask = cv2.inRange(frame, colorLower, colorUpper)
	mask = cv2.erode(mask, None, iterations=2)
	mask = cv2.dilate(mask, None, iterations=2)

	cnts = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL,
		cv2.CHAIN_APPROX_SIMPLE)[-2]
	center = None
	circles = cv2.HoughCircles(gray, cv2.cv.CV_HOUGH_GRADIENT, 1.8, 200);

	if len(cnts) > 0:
		c = max(cnts, key=cv2.contourArea)
		((x, y), radius) = cv2.minEnclosingCircle(c)
		M = cv2.moments(c)
		center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))

		if radius > 10 and circles is not None:
			circles = np.round(circles[0, :]).astype("int");
			for (x2, y2, r) in circles:
				if center[0] < r + x2 and center[0] > r - x2 and center[1] < r + y2 and center[1] > r - y2:
					cv2.circle(outputImage, (x2, y2), r, (0, 255, 0), 4);
					cv2.rectangle(outputImage, (x2 + 5, y2 + 5), (x2 - 5, y2 - 5), (0, 128, 255), -1);

	cv2.imshow("outputImage", outputImage);
	print("circles: " + str(circles));
	key = cv2.waitKey(1) & 0xFF;
	if key == ord("q"):
		break

camera.release();
cv2.destroyAllWindows();