// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
export function lexer (code) {
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

export function parser (tokens) {
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
