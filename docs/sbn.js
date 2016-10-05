(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.sbn = factory());
}(this, (function () { 'use strict';

// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
function lexer (code) {
  var tokens = code.split(/\s+/)
  if (tokens.length)
  return tokens.map(function (word) {
    var parsed = parseInt(word, 10)
    if(isNaN(parsed)) {
      return {type: 'word', value: word}
    }
    return {type: 'number', value: parsed}
  })
}

function parser (tokens) {
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
        case 'Paper' :
          if (paper) {
            throw 'can not define paper more than once'
          }
          var expression = {
            type: 'CallExpression',
            name: 'Paper',
            arguments: []
          }
          // if Paper, next token should be color argument
          var argument = tokens.shift()
          if(argument.type === 'number') {
            expression.arguments.push({
              type: 'NumberLiteral',
              value: argument.value
            })
            AST.body.push(expression)
            paper = true
          } else {
            throw 'expected number'
          }
          break
        case 'Pen' :
          var expression = {
            type: 'CallExpression',
            name: 'Pen',
            arguments: []
          }
          // if Paper, next token should be 
          var argument = tokens.shift()
          if(argument.type === 'number') {
            expression.arguments.push({
              type: 'NumberLiteral',
              value: argument.value
            })
            AST.body.push(expression)
            pen = true
          } else {
            throw 'expected number'
          }
          break
        case 'Line':
          if(!paper) {
            throw 'paper is not defined yet'
          }
          if(!pen) {
            throw 'pen is not defined yet'
          }
          var expression = {
            type: 'CallExpression',
            name: 'Line',
            arguments: []
          }
          // if Paper, next token should be
          for (var i = 0; i < 4; i++) {
            var argument = tokens.shift()
            if(argument.type === 'number') {
              expression.arguments.push({
                type: 'NumberLiteral',
                value: argument.value
              })
            } else {
              throw 'expected number'
            }
          }
          AST.body.push(expression)
          break
      }
    }
  }
  return AST
}

function transformer (ast) {

  function makeColor (level) {
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

  while (ast.body.length > 0) {
    var node = ast.body.shift()
    if(node.type === 'CallExpression') {
      if(node.name === 'Pen') {
        current_pen_color = node.arguments[0].value
      } else {
        newAST.body.push(elements[node.name](node.arguments, current_pen_color))
      }
    }
  }

  return newAST
}

function generator (ast) {

  function tagMaker (node) {
    var attributes = Object.keys(node.attr).map(function (key){
      return key+'="'+node.attr[key]+'"'
    }).join(' ')
    return {
      open:'<'+node.tag+' '+attributes+'>',
      close:'</'+node.tag+'>'
    }
  }

  var svg = tagMaker(ast) // top node should always be <svg>

  var elements = ast.body.map(function (node) {
    var el = tagMaker(node)
    return el.open + el.close
  }).join('\n\t')

  return svg.open + '\n\t' + elements + '\n' + svg.close
}

var SBN = {}

SBN.VERSION = '0.0.1'
SBN.lexer = lexer
SBN.parser = parser
SBN.transformer = transformer
SBN.generator = generator

SBN.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}

return SBN;

})));
