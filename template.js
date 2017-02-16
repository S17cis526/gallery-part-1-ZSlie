/** @module template
 */
module.exports = {//This way allows for an object to be exported. W/ multiple functions
  render: render,
  loadDir: loadDir
}

var fs = require('fs');
var templates = {}

/** @function loadDir
 * Loads a directory of templates
 * @param {string} directory - the directory to loadDir
 */
function loadDir(directory) {
  var dir = fs.readdirSync(directory);
  dir.forEach(function(file){
    var path = directory + '/' + file;
    var stats = fs.statSync(file);
    if (stats.isFile()) {
      templates[file] = fs.readFileSync(directory + '/' + file + '.html').toString();
      
    }
  });
}


/** @function render
  * rnders a template with embedded JS
  * @param {string} templateName - the template to render
  * @param {...}
  */
function render(templateName, context){
  return templates[templateName].replace(/<%=(.+)%>/g, function(match, js) {
    return eval("var context = " + JSON.stringify(context) + ";" + js);
  });
}
