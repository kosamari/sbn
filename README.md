# simple-sbn

A compiler for small drawing language sbn (SVG by Numbers). Inspired by John Maeda's book: Design by Numbers.
This is a simplified version for a demo. Only supports `Paper`, `Pen`, and `Line` commands with minimal error handling.

## usage
### browser
include sbn.js in your html, `sbn` object will be available in global scope.
```html
<script src="./lib/simple_sbn.js"></script>
```
Call `compile` method. The compiler creates SVG out of sbn code you passed.
```javascript
var code = 'Paper 95\nPen 1\nLine 50 15 85 80'
var svg = sbn.compile(code)

document.body.innerHTML = svg
```

### node
You can run sbn compiler on Node to create SVG file.
```javascript
var fs = require('fs')
var sbn = require('simple-sbn')

var code = `Paper 95
            Pen 1
            Line 50 15 85 80`

fs.writeFile("sbn_drawing.svg", sbn.compile(code), function(err) {
    console.log('SVG was saved!')
})
```

## License
Copyright 2016 Mariko Kosaka

Code licensed under the [Apache-2.0 License](http://www.apache.org/licenses/LICENSE-2.0)
Documentation licensed under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)