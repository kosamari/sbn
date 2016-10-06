// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
export function lexer (code) {
  var _tokens = code.split(/\s+/)
  var tokens = []

  for (var i = 0; i < _tokens.length; i++) {
    if(isNaN(_tokens[i])) {
      if(_tokens[i].length > 0) {
        tokens.push({type: 'word', value: _tokens[i]})
      }
    } else {
      tokens.push({type: 'number', value: _tokens[i]})
    }
  }

  if (tokens.length < 1) {
    throw 'No Tokens Found. Try "Paper 10"'
  }

  return tokens
}

export function parser (tokens) {

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
            throw 'Please define Paper before drawing Line'
          }
          if(!pen) {
            throw 'Please define Pen before drawing Line'
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
