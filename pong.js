"use strict";

var keysDown = {};

window.onkeyup = function(e) {
	keysDown[e.keyCode] = false;
}

window.onkeydown = function(e) {
	keysDown[e.keyCode] = true;
}

window.onload = function() {
	var width = 70;
	var height = 20;
	var ballStartX = 3;
	var ballStartY = height / 2;
	var ballAngle = Math.PI / 8;
	var ballT = null;
	var ballPrevX = ballStartX;
	var ballInitSpeed = 30.0 / 1000.0;
	var ballSpeed = ballInitSpeed;

	var pauseUntil = 0;

	var prevT = null;
	var paddleSpeed = 30.0 / 1000.0;

	var paddleHeight = 5;
	var paddleInit = height / 2 - paddleHeight / 2;
	var paddles = [ paddleInit, paddleInit ];
	var scores = [ 0, 0 ];
	var paddleText = [ "HTML5", "SUCKS" ];

	var controls = [ [ 87, 83 ], [ 38, 40 ] ];

	var screenElement = document.getElementById("screen");

	function bounce(t, ballX, ballY) {
		var bounced = false;
		var maxAngle = 2;

		if ((ballY == 0 || ballY == height - 1) && ballY != ballStartY)
		{
			ballAngle = -ballAngle;
			bounced = true;
		}

		// XXX: This could allow the ball to phase through the paddle
		if ((ballX == 1 || ballX == width - 2) && ballX != ballStartX)
		{
			var paddle;
			if (ballX == 1)
			{
				paddle = 0;
			}
			else
			{
				paddle = 1;
			}

			var delta = ballY - Math.round(paddles[paddle]);
			if (delta >= 0 && delta < paddleHeight)
			{
				ballAngle = Math.PI - ballAngle;
				maxAngle = 10;
				bounced = true;
			}
		}

		if (bounced)
		{
			ballAngle += (Math.random() - 0.5) * maxAngle * Math.PI / 180;
			ballStartX = ballX;
			ballStartY = ballY;
			ballT = t;
			ballSpeed *= 1.01;
		}
	}

	function movePaddles(t) {
		var dt = prevT - t;
		for (var i = 0; i < 2; ++i)
		{
			if (keysDown[controls[i][0]])
				paddles[i] = Math.max(0, paddles[i] + dt*paddleSpeed);
			if (keysDown[controls[i][1]])
				paddles[i] = Math.min(height - paddleHeight, paddles[i] - dt*paddleSpeed);
		}
	}

	function onFrame(t) {
		if (pauseUntil > t)
		{
			prevT = t;
			requestAnimationFrame(onFrame);
			return;
		}

		if (ballT === null)
		{
			ballT = t;
			prevT = t;
			requestAnimationFrame(onFrame);
			return;
		}

		var ballX = Math.round(ballSpeed*Math.cos(ballAngle)*(t - ballT) + ballStartX);
		var ballY = Math.round(ballSpeed*Math.sin(ballAngle)*(t - ballT) + ballStartY);

		if (ballX < 0) ballX = 0;
		if (ballX >= width) ballX = width - 1;

		if (ballY < 0) ballY = 0;
		if (ballY >= height) ballY = height - 1;

		bounce(t, ballX, ballY);

		ballPrevX = ballX;

		var lines = [];
		for (var y = 0; y < height; ++y)
		{
			var line = new Array(width);
			for (var x = 0; x < width; ++x)
				line[x] = " ";
			lines.push(line);
		}

		for (var y = 0; y < paddleHeight; ++y)
		{
			lines[Math.round(y + paddles[0])][0] = paddleText[0].charAt(y);
			lines[Math.round(y + paddles[1])][width - 1] = paddleText[1].charAt(y);
		}

		lines[1][14] = Math.floor(scores[0] / 10);
		lines[1][15] = scores[0] % 10;

		lines[1][width - 17] = Math.floor(scores[1] / 10);
		lines[1][width - 16] = scores[1] % 10;

		lines[ballY][ballX] = "O";

		for (var y = 0; y < height; ++y)
		{
			var left = " ";
			var right = " ";
			if (y == 3)
			{
				left = "W";
				right = "^";
			}
			else if (y == height - 4)
			{
				left = "S";
				right = "v";
			}
			lines[y] = left + "  | " + lines[y].join("") + " |  " + right;
		}
		screenElement.innerHTML = lines.join("\n");

		var point = null;
		if (ballX == 0)
		{
			point = 1;
			ballStartY = paddles[0] + paddleHeight/2;
			ballStartX = 2;
			ballAngle = Math.PI * 0.5 * (Math.random() - 0.5);
		}
		else if (ballX == width-1)
		{
			point = 0;
			ballStartY = paddles[1] + paddleHeight/2;
			ballStartX = width - 3;
			ballAngle = Math.PI + Math.PI * 0.5 * (Math.random() - 0.5);
		}

		if (point !== null)
		{
			ballSpeed = ballInitSpeed;
			ballT = pauseUntil = t + 1000;

			scores[point]++;
			if (scores[point] > 99)
				scores = [0, 0];
		}
		else
		{
			movePaddles(t);
		}


		prevT = t;

		requestAnimationFrame(onFrame);
	}

	requestAnimationFrame(onFrame);
};
