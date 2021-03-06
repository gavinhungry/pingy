/**
 * pingy: PNG creation and manipulation helper
 * https://github.com/gavinhungry/pingy
 *
 * Released under the terms of the MIT license
 */

(function() {
  'use strict';

  var PNG = require('pngjs').PNG;
  var Stream = require('stream');

  var is_num = function(v) { return !isNaN(v); };
  var to_int = function(v) { return Math.floor(+v) || 0; };
  var to_rgba_int = function(v) { return clamp(to_int(v), 0, 255); };

  var clamp = function(val, min, max) {
    val = is_num(val) ? val: 0;
    min = is_num(min) ? min : Number.NEGATIVE_INFINITY;
    max = is_num(max) ? max : Number.POSITIVE_INFINITY;

    return Math.min(Math.max(val, min), max);
  };

  /**
   * Get an image buffer for a given width and height
   *
   * @param {Number} width - image width
   * @param {Number} height - image height
   * @return {Buffer}
   */
  var buffer = function(width, height) {
    return new Buffer(width * height * 4); // RGBA
  };

  /**
   * Get the buffer index of a coordinate
   *
   * @param {Number} width - image width
   * @param {Number} x - x coordinate
   * @param {Number} y - y coordinate
   * @return {Number} index of coordinate in an image buffer
   */
  var get_index = function(width, x, y) {
    return (width * y + x) << 2;
  };

  /**
   * Get a random color
   *
   * @return {Object} RGBA value
   */
  var random_rgba = function() {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
      a: 255
    };
  };

  /**
   * Pingy constructor
   *
   * @param {Number} [width] - image width
   * @param {Number} [height] - image height
   * @return {Pingy}
   */
  var Pingy = function(width, height) {
    width = clamp(width, 1);
    height = clamp(height, 1);

    this._png = new PNG();
    this._png.width = width;
    this._png.height = height;

    this._png.data = buffer(width, height);

    this.forEachPoint(function(x, y, rgba) {
      return { r:0, g:0, b:0, a:255 };
    });
  };

  /**
   * Create a Pingy object from an existing pngjs object
   *
   * @param {PNG} png - pngjs object
   * @return {Pingy}
   */
  Pingy.fromPNG = function(png) {
    var self = new Pingy();
    self._png = png;
    return self;
  };

  /**
   * Create a Pingy object from an array of points
   *
   * @param {PNG} arr - 2-dimensional array of RGBA values
   * @return {Pingy}
   */
  Pingy.fromArray = function(arr) {
    var self = new Pingy(arr[0].length, arr.length);

    return self.forEachPoint(function(x, y, rgba) {
      return arr[y][x];
    });
  };

  /**
   * Create a Pingy object from ASCII art
   *
   * Unmapped colors are assigned a random color (per character)
   *
   * @param {String} art - ASCII art
   * @param {Object} map - map of characters to RGBA values
   * @return {Pingy}
   */
  Pingy.fromAsciiArt = function(art, map) {
    map = map || {};

    var arr = art.split('\n').map(function(row) {
      return row.split('').map(function(c) {
        if (!map[c]) { map[c] = random_rgba(); }
        return map[c];
      });
    });

    return Pingy.fromArray(arr);
  };

  Pingy.prototype = {

    /**
     * Get the buffer index of a coordinate
     *
     * @private
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @return {Number} index of coordinate in image buffer
     */
    _getIndex: function(x, y) {
      return get_index(this._png.width, x, y);
    },

    /**
     * Execute a function on each point in an image
     *
     * The rgba object passed to the callback will be saved back to the image,
     * so no need to call `set_rgba` there
     *
     * If the callback returns an object, it will be used as the new rgba value
     *
     * @param {Function} fn - Function(x, y, rgba) to execute
     * @return {Pingy} self
     */
    forEachPoint: function(fn) {
      for (var y = 0; y < this.getHeight(); y++) {
        for (var x = 0; x < this.getWidth(); x++) {

          var rgba = this.getColor(x, y);
          var out = fn.call(this, x, y, rgba);

          this.setColor(x, y, (out || rgba));
        }
      }

      return this;
    },

    /**
     * Get the RGBA value of a coordinate
     *
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @return {Object} RGBA value
     */
    getColor: function(x, y) {
      var i = this._getIndex(x, y);

      return {
        r: this._png.data[i + 0],
        g: this._png.data[i + 1],
        b: this._png.data[i + 2],
        a: this._png.data[i + 3]
      };
    },

    /**
     * Set the RGBA value of a coordinate
     *
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @param {Object} rgba - RGBA value
     * @return {Object} RGBA value
     */
    setColor: function(x, y, rgba) {
      var i = this._getIndex(x, y);
      var prev = this.getColor(x, y);

      this._png.data[i + 0] = is_num(rgba.r) ? to_rgba_int(rgba.r): prev.r;
      this._png.data[i + 1] = is_num(rgba.g) ? to_rgba_int(rgba.g): prev.g;
      this._png.data[i + 2] = is_num(rgba.b) ? to_rgba_int(rgba.b): prev.b;
      this._png.data[i + 3] = is_num(rgba.a) ? to_rgba_int(rgba.a): prev.a;

      return this.getColor(x, y);
    },

    /**
     * Get the image width
     *
     * @return {Number} image width
     */
    getWidth: function() {
      return this._png.width;
    },

    /**
     * Get the image height
     *
     * @return {Number} image height
     */
    getHeight: function() {
      return this._png.height;
    },

    /**
     * Enlarge by some integer factor
     *
     * @param {Number} factor
     * @return {Pingy} self
     */
    scale: function(factor) {
      factor = clamp(to_int(factor), 1);

      var width = this.getWidth() * factor;
      var height = this.getHeight() * factor;

      var buf = new buffer(width, height);

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {

          var i = get_index(width, x, y);
          var rgba = this.getColor(to_int(x / factor), to_int(y / factor));

          buf[i + 0] = rgba.r;
          buf[i + 1] = rgba.g;
          buf[i + 2] = rgba.b;
          buf[i + 3] = rgba.a;
        }
      }

      this._png.width = width;
      this._png.height = height;
      this._png.data = buf;

      return this;
    },

    /**
     * Get the base64 encoding
     *
     * @param {Function} [fn] - callback, defaults to console.log
     */
    toBase64: function(fn) {
      fn = fn || console.log.bind(console);

      var buffers = [];

      var base64 = new Stream();
      base64.readable = base64.writable = true;
      base64.write = function(data) {
        buffers.push(data);
      };

      base64.end = function() {
        fn(Buffer.concat(buffers).toString('base64'));
      }

      this._png.pack().pipe(base64);
    },

    /**
     * Get the base64 encoding as a data URI
     *
     * @param {Function} [fn] - callback, defaults to console.log
     */
    toBase64Uri: function(fn) {
      fn = fn || console.log.bind(console);

      return this.toBase64(function(str) {
        fn('data:image/png;base64,' + str);
      });
    }
  };

  module.exports = Pingy;

})();
