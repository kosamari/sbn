export function generator (ast) {

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
