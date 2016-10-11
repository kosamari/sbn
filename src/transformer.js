/**
  ## Transformer
  Parsed sbn AST is good at describing what's happening in the code,
  but it is not useful yet to create SVG file out of it.
  For example. `Paper` is a concept only exists in sbn paradigm.
  In SVG, we might use <rect> element to represent a Paper. Transformer function
  converts sbn specific AST to SVG friendly AST.

  ### Parameter
  - ast `Object`: sbn abstract syntax tree created by parser function.

  ### Return
  svg_ast object (another AST suited for SVG format)
  ```
  input: {
    type: "Drawing",
    "body": [{
      "type": "CallExpression",
      "name": "Paper",
      "arguments": [
        {
          "type": "number",
          "value": "100"
        }
      ]
    }]
  }
  output: {
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
  ```

  ### Notes
  color code 100 means 100% black === rgb(0%, 0%, 0%)
*/

export function transformer (ast) {

  var svg_ast = {
    tag : 'svg',
    attr: {
      width: 100,
      height: 100,
      viewBox: '0 0 100 100',
      xmlns: 'http://www.w3.org/2000/svg',
      version: '1.1'
    },
    body:[]
  }

  var pen_color = 100 // default pen color is black

  // Extract a call expression at a time as `node`.
  // Loop until we are out of expressions in body.
  while (ast.body.length > 0) {
    var node = ast.body.shift()
    switch (node.name) {
      case 'Paper' :
        var paper_color = 100 - node.arguments[0].value
        // add rect element information to svg_ast's body
        svg_ast.body.push({
          tag : 'rect',
          attr : {
            x: 0,
            y: 0,
            width: 100,
            height:100,
            fill: 'rgb(' + paper_color + '%,' + paper_color + '%,' + paper_color + '%)'
          }
        })
        break
      case 'Pen':
        // keep current pen color in `pen_color` variable
        pen_color = 100 - node.arguments[0].value
        break
      case 'Line':
        // add line element information to svg_ast's body
        svg_ast.body.push({
          tag: 'line',
          attr: {
            x1: node.arguments[0].value,
            y1: node.arguments[1].value,
            x2: node.arguments[2].value,
            y2: node.arguments[3].value,
            'stroke-linecap': 'round',
            stroke: 'rgb(' + pen_color + '%,' + pen_color + '%,' + pen_color + '%)'
          }
        })
        break
    }
  }

  return svg_ast
}
