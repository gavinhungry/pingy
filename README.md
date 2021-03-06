pingy
=====
PNG creation and manipulation helper for
[node-pngjs](https://github.com/niegowski/node-pngjs).

Installation
============

    $ npm install pingy

Usage
=====

```javascript
var Pingy = require('pingy');
```

Creation
--------
Create a new, empty Pingy object of width 64px and height 48px:

```javascript
var img = new Pingy(64, 48); // default color is black
```

Create a Pingy object from an existing pngjs object:

```javascript
var img2 = new Pingy.fromPNG(obj);
```

Create a Pingy object from an array of sparse RGBA values:

```javascript
var img3 = new Pingy.fromArray([
  [ { r: 255 }, { r: 128, b: 128 }, { g: 255, a: 192 } ],
  [ { b: 128 }, { b: 192 }, { b: 256 } ]
]);
```

Create a Pingy object from ASCII art:

```javascript
// whatever *that* is supposed to be ...
var art = '' +
  'O------O\n' +
  '|      |\n' +
  '| **** |\n' +
  '|      |\n' +
  'O------O';

var img4 = new Pingy.fromAsciiArt(art, {
  'O': { r: 128 },
  '-': { b: 128 }
  // characters without mappings get a random color
});
```

Manipulation
------------
Execute a function on each point of an image:

```javascript
img.forEachPoint(function(x, y, rgba) {
  rgba.r = 256; // other RGBA values remain

  // optionally, returning an object here overrides the entire RGBA value
  return { r: 256 }; // solid red
});
```

Get the color at a point:

```javascript
img.getColor(0, 0);
// returns { r:255, g:0, b:0, a:255 };
```

Set the color at a point by passing a sparse RGBA object:

```javascript
img.setColor(0, 0, { g: 255, b: 128});
// returns { r: 255, g: 255, b: 128, a: 255 };
```

Enlarge an image linearly:

```javascript
img.scale(10);
```

Utility
-------
Get width of the image:

```javascript
img.getWidth();
// returns 64
```

Get height of the image:

```javascript
img.getHeight();
// returns 48
```

Get the [base 64](https://en.wikipedia.org/wiki/Base64) representation of an
image:

```javascript
img.toBase64(function(base64) {
  // base64 string is passed to callback function
});
```

Get the base 64 string as a
[data URI](https://en.wikipedia.org/wiki/Data_URI_scheme):

```javascript
img.toBase64Uri(function(base64) {
  // base64 data URI string is passed to callback function
  // data:image/png;base64, [...]
});
```

License
-------
This software is released under the terms of the **MIT license**. See `LICENSE`.
