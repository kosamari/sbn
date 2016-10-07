export function transformer (ast) {

  function makeColor (level) {
    if (typeof level === 'undefined') {
      level = 100
    }
    level = 100 - parseInt(level, 10) // flip
    return 'rgb(' + level + '%, ' + level + '%, ' + level + '%)'
  }

  function findParamValue (p) {
    if (p.type === 'word') {
      return variables[p.value]
    }
    return p.value
  }

  var elements = {
    'Line' : function (param, pen_color_value) {
      return {
        tag: 'line',
        attr: {
          x1: findParamValue(param[0]),
          y1: 100 - findParamValue(param[1]),
          x2: findParamValue(param[2]),
          y2: 100 - findParamValue(param[3]),
          stroke: makeColor(pen_color_value),
          'stroke-linecap': 'round'
        },
        body: []
      }
    },
    'Paper' : function (param) {
      return {
        tag : 'rect',
        attr : {
          x: 0,
          y: 0,
          width: 100,
          height:100,
          fill: makeColor(findParamValue(param[0]))
        },
        body : []
      }
    }
  }

  var newAST = {
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

  var current_pen_color
  // TODO : warning when paper and pen is same color

  var variables = {}

  while (ast.body.length > 0) {
    var node = ast.body.shift()
    if(node.type === 'CallExpression' || node.type === 'VariableDeclaration') {
      if(node.name === 'Pen') {
        current_pen_color = findParamValue(node.arguments[0])
      } else if (node.name === 'Set') {
        variables[node.identifier.value] = node.value.value
      } else {
        var el = elements[node.name]
        if (!el) {
          throw node.name + ' is not a valid command.'
        }
        if (typeof !current_pen_color === 'undefined') {
          // throw 'Please define Pen before drawing Line.'
          // TODO : message 'You should define Pen before drawing Line'
        }
        newAST.body.push(el(node.arguments, current_pen_color))
      }
    }
  }

  return newAST
}
