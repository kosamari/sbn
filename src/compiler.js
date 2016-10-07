import { lexer, parser } from './parser.js';
import { transformer } from './transformer.js';
import { generator } from './generator.js';

var SBN = {}

SBN.VERSION = '0.5.6'
SBN.lexer = lexer
SBN.parser = parser
SBN.transformer = transformer
SBN.generator = generator

SBN.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}

export default SBN
