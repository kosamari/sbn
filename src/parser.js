// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
export function lexer (code) {
  var _tokens = code
                  .replace(/[\n\r]/g, ' *nl* ')
                  .replace(/\[/g, ' *ob* ')
                  .replace(/\]/g, ' *cb* ')
                  .replace(/\{/g, ' *ocb* ')
                  .replace(/\}/g, ' *ccb* ')
                  .split(/[\t\f\v ]+/)
  var tokens = []
  for (var i = 0; i < _tokens.length; i++) {
    var t = _tokens[i]
    if(t.length <= 0 || isNaN(t)) {
      if (t === '*nl*') {
        tokens.push({type: 'newline'})
      } else if (t === '*ob*') {
        tokens.push({type: 'ob'})
      } else if (t === '*cb*') {
        tokens.push({type: 'cb'})
      } else if (t === '*ocb*') {
        tokens.push({type: 'ocb'})
      } else if (t === '*ccb*') {
        tokens.push({type: 'ccb'})
      } else if(t.length > 0) {
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

export function parser (tokens) {
  function expectedTypeCheck (type, expect) {
    if(Array.isArray(expect)) {
      var i = expect.indexOf(type)
      return i >= 0
    }
    return type === expect
  }

  function createDot (current_token, currentPosition, node) {
    var expectedType = ['ob', 'number', 'number', 'cb']
    var expectedLength = 4
    currentPosition = currentPosition || 0
    node = node || {type: 'dot'}

    if (currentPosition < expectedLength - 1) {
      if (expectedTypeCheck(current_token.type, expectedType[currentPosition])){
        if(currentPosition === 1) {
          node.x = current_token.value
        }
        if(currentPosition === 2) {
          node.y = current_token.value
        }
        currentPosition++
        createDot(tokens.shift(), currentPosition, node)
      } else {
        throw 'Expected ' + expectedType[currentPosition] + ' but found ' + current_token.type + '.'
      }
    }
    return node
  }

  function findArguments(command, expectedLength, expectedType, currentPosition, currentList) {
    currentPosition = currentPosition || 0
    currentList = currentList || []
    while (expectedLength > currentPosition) {
      var token = tokens.shift()
      if (!token) {
        throw command + ' takes ' + expectedLength + ' argument(s). '
      }

      if (expectedType){
        var expected = expectedTypeCheck(token.type, expectedType[currentPosition])
        if (!expected) {
          throw command + ' takes ' + JSON.stringify(expectedType[currentPosition]) + ' as argument ' + (currentPosition + 1) + '. ' + (token ? 'Instead found a ' + token.type + ' '+ (token.value || '') + '.' : '')
        }
        if (token.type === 'number' && (token.value < 0 || token.value > 100)){
          throw 'Found value ' + token.value + ' for ' + command + '. Value must be between 0 - 100.'
        }
      }

      var arg = {
        type: token.type,
        value: token.value
      }
      if (token.type === 'ob') {
        arg = createDot(token)
      }
      currentList.push(arg)
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
        case '{' :
          var block = {
            type: 'Block Start'
          }
          AST.body.push(block)
          break
        case '}' :
          var block = {
            type: 'Block End'
          }
          AST.body.push(block)
          break
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
        case 'Set':
          var args = findArguments('Set', 2, [['word', 'ob'], 'number'])
          var obj = {}
          if (args[0].type === 'dot') {
            AST.body.push({
              type: 'CallExpression',
              name: 'Pen',
              arguments:[args[1]]
            })
            obj.type = 'CallExpression',
            obj.name = 'Line',
            obj.arguments = [
              { type: 'number', value: args[0].x},
              { type: 'number', value: args[0].y},
              { type: 'number', value: args[0].x},
              { type: 'number', value: args[0].y}
            ]
          } else {
            obj.type = 'VariableDeclaration'
            obj.name = 'Set'
            obj.identifier = args[0]
            obj.value = args[1]
          }

          AST.body.push(obj)
          break
        default:
          throw current_token.value + ' is not a valid command'
      }
    } else if (['newline', 'ocb', 'ccb'].indexOf[current_token.type] < 0 ) {
      throw 'Unexpected token type : ' + current_token.type
    }
  }

  return AST
}
