import { lexer, parser } from './parser.js';
import { transformer } from './transformer.js';
import { generator } from './generator.js';

/**
  ## Compiler
  Create sbn object with lexer, parser, transformer, and generator methods.
  Also add compile method to call all 4 methods in chain.
*/
var sbn = {}
sbn.VERSION = '0.0.1'
sbn.lexer = lexer
sbn.parser = parser
sbn.transformer = transformer
sbn.generator = generator
i
sbn.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}

export default sbn
