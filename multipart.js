/**
 * @module multipart
 * A module for processing multipart HTTP requests
 */

"use strict;"

//you can export functions and object literals, classes, constructors, etc.
module.exports = multipart;

const DOUBLE_CRLF = Buffer.from([0x0D,0x0A,0x0D,0x0A]);

/**
 * @function multipart
 * takes a request and a response object,
 * parses the body of the multipart request and attaches its contents to the
 * request object. If an error occurs, we log it and send a 500 status code.
 * Otherwise, we invoke next with the request and response.
 */
function multipart(req, res, next){
  var chunks = [];
  req.on('error', function(){
    console.error(err);
    res.statusCode = 500;
    res.end();
  });

  req.on('data', function(chunk){
    chunks.push(chunk);
  });

  req.on('end', function(){
    //TODO: var boundary = req.headers["ContentType"];
    var buffer = Buffer.concat(chunks);
    req.body = processBody(buffer, boundary);
    next(req, res);

  });


}

/**
 * @function processBody
 * Takes a buffer and a boundary and returns an associative array of
 * of key/value pairs. If content is a file, value will be an object width
 * properties filename, contentType, and data. Why is this cleaner than split??
 */
 function processBody(buffer, boundary, callback) {
   var contents = [];
   var start = buffer.indexOf(boundary) + boundary.length + 2;//Add two for the carridge return
   var end = buffer.indexOf(boundary, start);

   // Get all of the contents between the boundaries.
   while (end > start) {
     contents.push(buffer.slice(start,end));
     start = end + boundary.length + 2;
     end = buffer.indexOf(boundary, start);
   }
   var parsedContents = {};
   contents.forEach(function(content){
     parseContent(content, function(err, tuple){
       if(err) return console.error(err);
       parsedContents[tuple[0]] = tuple[1];
     });
   });

   return parsedContents;

 }

/** @function parseContent
 * Parses a content section and returns the key/value pair as a two-element
 * array.
 */
function parseContent(content, callback){
  var index = content.indexOf(DOUBLE_CRLF);
  var head = content.slice(index).toString();
  var body = content.slice(index + 4); //+4 because of the 4 bytes in the crlf
  var name = /name="([\w\d\-_]+)"/.exec(head);
  var filename = /filenamename="([\w\d\-_\.]+)"/.exec(head);
  var contentType = /Content-Type: ([\w\d\/]+)/.exec(head);

  if (!name) return callback("Content without name");

  if(filename){
    // we have a file
    callback(false, [name[1], {
      filename: filename[1],
      contentType: (contentType) ? contentType[1]:'application/octet-stream';
      data: body
    }]);
  } else {
    // we have a value
    callback(false, [name[1], body.toString()]);
  }
}
