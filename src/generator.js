/**
  ## Code Generator
  At the final stop of abn to avg compile process, generator function created
  SVG code based on given AST.

  ### Parameter
  - svg_ast `Object`: svg abstract syntax tree created by transformer function.

  ### Return
  SVG formatted string
  ```
  input: {
    "tag": "svg",
    "attr": {
      "width": 100,
      "height": 100,
      "viewBox": "0 0 100 100",
      "xmlns": "http://www.w3.org/2000/svg",
      "version": "1.1"
    },
    "body": [{
      "tag": "rect",
      "attr": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "fill": "rgb(0%, 0%, 0%)"
      }
    }]
  }
  output:
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <rect x="0" y="0" width="100" height="100" fill="rgb(0%, 0%, 0%)"></rect>
  </svg>
  ```
*/

export function generator (svg_ast) {

  // create attributes string out of attr object
  // { "width": 100, "height": 100 } becomes 'width="100" height="100"'
  function createAttrString (attr) {
    return Object.keys(attr).map(function (key){
      return key + '="' + attr[key] + '"'
    }).join(' ')
  }

  // top node is always <svg>. Create attributes string for svg tag
  var svg_attr = createAttrString(svg_ast.attr)

  // for each elements in the body of svg_ast, generate svg tag
  var elements = svg_ast.body.map(function (node) {
    return '<' + node.tag + ' ' + createAttrString(node.attr) + '></' + node.tag + '>'
  }).join('\n\t')

  // wrap with open and close svg tag to complete SVG code
  return '<svg '+ svg_attr +'>\n' + elements + '\n</svg>'
}
