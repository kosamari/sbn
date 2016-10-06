export function transformer (ast) {

  function makeColor (level) {
    level = level || 100
    level = 100 - level
    return 'rgb(' + level + '%, ' + level + '%, ' + level + '%)'
  }

  var elements = {
    'Line' : function (param, pen_color_value) {
      return {
        tag: 'line',
        attr: {
          x1: param[0].value,
          y1: param[1].value,
          x2: param[2].value,
          y2: param[3].value,
          stroke: makeColor(pen_color_value)
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
          fill: makeColor(param[0].value)
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
  var paper_color

  while (ast.body.length > 0) {
    var node = ast.body.shift()
    if(node.type === 'CallExpression') {
      if(node.name === 'Pen') {
        current_pen_color = node.arguments[0].value
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
