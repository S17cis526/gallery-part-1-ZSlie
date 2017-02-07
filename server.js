"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */

var http = require('http'); /* loads the http library; JS strings don't care about ' or " */
var url = require('url');
var fs = require('fs');
var port = 3007;
var title = 'Gallery';

//Reads in our config file to be used later.
var config = JSON.parse(fs.readFileSync('config.json'));



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
			html += ' <title>' + config.title + '</title>';
			html += ' <link href="gallery.css" rel="stylesheet" type="text/css">';
			html += '</head>';
			html += '<body>';
			html += ' <h1>' + config.title + '</h1>';
			html += '	<form>';
			html += '	 <input type="text" name="title">';
			html += '	 <input type="submit" value="Change Gallery Title">';
			html += '	</form>';
			html += imageNamesToTags(imageTags).join('');
			html += '<form action="" method="POST" enctype="multipart/form-data">';
			html += '  <input type="file" name="image">';
			html += '  <input type="submit" value="Upload Image">';
			html += '</form>';
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
		if (err) {
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

function uploadPicture(req,res) {
	var body = '';
	req.on('error', function(){
		res.statusCode = 500;
		res.end();
	});
	// for the data we need to cache the data in some buffer - body is our buffer in this case.
	req.on('data', function(data){
		body += data;
	});
	// we have now received the entire file.
	req.on('end', function() {
		fs.writeFile('filename', body, function(){
			if (err){
				console.error(err);
				res.statusCode = 500;
				res.end();
				return;
			}
			serveGallery(req, res);
		});
	});
}

var server = http.createServer(function (req, res) {
	var urlParts = url.parse(req.url); //href, search, query, path
	/*
	var url = req.url.split('?'); //At most we should have two parts: a resource and a querystring - separated by '?'
	var resource = url[0];
	var queryString = url[1];
	*/
	if (urlParts.query) { //Checks if queryString is defined
		var matches = /title=(.+)($|&)/.exec(urlParts.query) // \\ Defines a regex. () is what is inside of it. [] is what is at the end
		if (matches && matches[1]){
			config.title = decodeURIComponent(matches[1]);
			fs.writeFile('config.json', JSON.stringify(config));
		}
	}

	switch (urlParts.pathname)
	{
		case '/':
    case '/gallery':
			if (req.method == 'GET'){
				serveGallery(req,res);
			} else if (req.method == 'POST'){
				uploadPicture(req,res);
			}
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
