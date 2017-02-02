"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */

var http = require('http'); /* loads the http library; JS strings don't care about ' or " */
var fs = require('fs');
var port = 3007;
//var chess = fs.readFileSync('images/chess.jpg'); /* these options cashe -- but we don't usually want to do this */
//var chess = fs.readFileSync('images/fern.jpg');
var stylesheet = fs.readFileSync('gallery.css'); //Caches the file

var imageNames = ['ace.jpg', 'bubble.jpg', 'chess.jpg', 'mobile.jpg', 'fern.jpg'];

function getImageNames(callback) { //The callback function is used due to asynchronous operations.
	fs.readdir('images/', function(err, fileNames) {
			if (err) callback(err, undefined);
			else callback(false, fileNames); //False because there is no error. Afterwards, send fileNames in fileNames array.
	});
}

function imageNamesToTags(fileNames) {
	return fileNames.map(function(fileName) {
		return `<img src="${fileName}" alt="${fileName}">`;
	});
}

function buildGallery(imageTags) {
	var html = '<!doctype html>';
			html += '<head>';
			html += ' <title>Gallery</title>';
			html += ' <link href="gallery.css" rel="stylesheet" type="text/css">';
			html += '</head>';
			html += '<body>';
			html += ' <h1>Gallery</h1>';
			html += imageNamesToTags(imageTags).join('');
			html += ' <h1>Hello.</h1> Time is ' + Date.now();
			html += '</body>';
		return html;
}

function serveGallery(req, res){
	getImageNames(function(err, imageNames){
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = 'Server error';
			res.end();
			return;
		}
		res.setHeader('Content-Type', 'text/html');
		res.end(buildGallery(imageNames));
	});
}

function serveImage(filename, req, res)
{
	fs.readFile('images/' + filename, function(err, body) {
		if (err)
		{
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = "whoops";
			res.end("Silly me");
			return;
		}
		else {
			var img = fs.readFileSync('images/' + filename);
			res.setHeader("Content-Type", "image/jpeg"); /* lets the server know what type of content to expect */
			res.end(img);
		}
	});
}

var server = http.createServer(function (req, res) {

	switch (req.url)
	{
		case '/':
    case '/gallery':
			serveGallery(req, res);
      break;
    case '/gallery.css':
      res.setHeader('Content-Type', 'text/css');
      res.end(stylesheet);
      break;
		default:
			serveImage(req.url, req, res);
	}
}); /* createServer Takes function to handle requests */

server.listen(port, function() {
	console.log("Listening on Port " + port);
});
