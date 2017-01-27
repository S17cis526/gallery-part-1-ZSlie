"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
 
var http = require('http'); /* loads the http library; JS strings don't care about ' or " */
var fs = require('fs');
var port = 3000;
var chess = fs.readFileSync('images/chess.jpg'); /* these options cashe -- but we don't usually want to do this */
var chess = fs.readFileSync('images/fern.jpg');

function serveImage(filename, req, res)
{	
	var body = fs.readFileSync('images/' + filename, function(err, body) {
		if (err) 
		{
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = "whoops";
			res.end("Silly me");
			return;
		}	
		res.setHeader("Content-Type", "images/jpeg"); /* lets the server know what type of content to expect */
		res.end(body);
	});
}

var server = http.createServer(function (req, res) {
	
	switch (req.url)
	{
		case "/chess":
			serveImage('chess.jpg', req, res);
			break;
		case "/fern":
		case "/fern/":
		case "/fern.jpg":
		case "/fern.jpeg":
			serveImage('fern.jpg', req, res);
			break;
		default:
			res.statusCode = 404;
			res.statusMessage = "Not Found";
			res.end();
	}
}); /* createServer Takes function to handle requests */

server.listen(port, function() {
	console.log("Listening on Port " + port);
});
