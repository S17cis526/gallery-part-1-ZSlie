/** @module template
 */
module.exports = {//This way allows for an object to be exported.
  render: render
}

var fs = require('fs');




/** @function render
  * rnders a template with embedded JS
  * @param {string} templateName - the template to render
  * @param {...}
  */
function render(templateName, context){
  var html = fs.readFileSync('templates/' + templateName + '.html');

  html = html.toString().replace(/<%=(.+)%>/g, function(match, js) {
    return eval("var context = " + JSON.stringify(context) + ";" + js);
  });

  return html;
}
