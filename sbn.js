(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.sbn = factory());
}(this, (function () { 'use strict';

// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
function lexer (code) {
  var _tokens = code.replace(/[\n\r]/g, ' [nl] ').split(/[\t\f\v ]+/)
  var tokens = []
  for (var i = 0; i < _tokens.length; i++) {
    var t = _tokens[i]
    if(t.length <= 0 || isNaN(t)) {
      if (t === '[nl]') {
        tokens.push({type: 'newline'})
      }else if(t.length > 0) {
        tokens.push({type: 'word', value: t})
      }
    } else {
      tokens.push({type: 'number', value: t})
    }
  }

  if (tokens.length < 1) {
    throw 'No Tokens Found. Try "Paper 10"'
  }

  return tokens
}

function parser (tokens) {

  function findArguments(expressionType, expectedLength, currentPosition, currentList) {
    currentPosition = currentPosition || 0
    currentList = currentList || []
    while (expectedLength > currentPosition) {
      var token = tokens.shift()
      if(!token || token.type === 'word') {
        throw expressionType + ' takes ' + expectedLength + ' number(s) as argument.' + (token ? 'Instead found a word "' + token.value + '".' : '')
      }
      if(token.value < 0 || token.value > 100){
        throw 'Found value ' + token.value + ' for ' + expressionType + '. Value must be between 0 - 100.'
      }
      currentList.push({
          type: 'NumberLiteral',
          value: token.value
      })
      currentPosition++
    }
    return currentList
  }

  var AST = {
    type: 'Drawing',
    body: []
  }
  var paper = false
  var pen = false

  while (tokens.length > 0) {
    var current_token = tokens.shift()
    if (current_token.type === 'word') {
      switch (current_token.value) {
        case '//' :
          var expression = {
            type: 'CommentExpression',
            value: ''
          }
          var next = tokens.shift()
          while (next.type !== 'newline') {
            expression.value += next.value + ' '
            next = tokens.shift()
          }
          AST.body.push(expression)
          break
        case 'Paper' :
          if (paper) {
            throw 'You can not define Paper more than once'
          }
          var expression = {
            type: 'CallExpression',
            name: 'Paper',
            arguments: []
          }
          var args = findArguments('Paper', 1)
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          paper = true
          break
        case 'Pen' :
          var expression = {
            type: 'CallExpression',
            name: 'Pen',
            arguments: []
          }
          var args = findArguments('Pen', 1)
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          pen = true
          break
        case 'Line':
          if(!paper) {
            // throw 'Please make Paper 1st'
            // TODO : no error message 'You should make paper first'
          }
          if(!pen) {
            // throw 'Please define Pen 1st'
            // TODO : no error message 'You should set pen color first'
          }
          var expression = {
            type: 'CallExpression',
            name: 'Line',
            arguments: []
          }
          var args = findArguments('Line', 4)
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          break
        default:
          throw current_token.value + ' is not a valid command'
      }
    }
  }

  return AST
}

function transformer (ast) {

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
          y1: 100 - param[1].value,
          x2: param[2].value,
          y2: 100 - param[3].value,
          stroke: makeColor(pen_color_value),
          'stroke-linecap': 'square'
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

function generator (ast) {

  function traverseSvgAst(obj, parent, rest, text) {
    parent = parent || []
    rest = rest || []
    text = text || ''
    if (!Array.isArray(obj)) {
      obj = [obj]
    }

    while (obj.length > 0) {
      var currentNode = obj.shift()
      var body = currentNode.body || ''
      var attr = Object.keys(currentNode.attr).map(function (key){
        return key + '="' + currentNode.attr[key] + '"'
      }).join(' ')

      text += parent.map(function(){return '\t'}).join('') + '<' + currentNode.tag + ' ' + attr + '>'

      if (currentNode.body && Array.isArray(currentNode.body) && currentNode.body.length > 0) {
        text += '\n'
        parent.push(currentNode.tag)
        rest.push(obj)
        return traverseSvgAst(currentNode.body, parent, rest, text)
      }

      text += body + '</'+ currentNode.tag +'>\n'
    }

    while (rest.length > 0) {
      var next = rest.pop()
      var tag = parent.pop()
      text += parent.map(function(){return '\t'}).join('') + '</'+ tag +'>\n'
      if (next.length > 0) {
        traverseSvgAst(next, parent, rest, text)
      }
    }

    return text
  }

  return traverseSvgAst(ast)
}

var SBN = {}

SBN.VERSION = '0.2.3'
SBN.lexer = lexer
SBN.parser = parser
SBN.transformer = transformer
SBN.generator = generator

SBN.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}

return SBN;

})));
