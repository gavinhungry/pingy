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
   * Pingy constructor
   *
   * Can be of forms:
   *   Pingy(width, height) to create a new image
   *   Pingy(PNG) to create a Pingy object from an existing pngjs object
   *
   * @param {Number|PNG} [width] - image width or pngjs object
   * @param {Number} [height] - image height
   * @return {Pingy}
   */
  var Pingy = function(width, height) {
    width = width || 0;
    height = height || 0;

    if (arguments[0] instanceof PNG) {
      this._png = arguments[0];
      return;
    }

    this._png = new PNG();
    this._png.width = width;
    this._png.height = height;

    this._png.data = new Buffer(width * height * 4); // RGBA

    this.forEachPoint(function(x, y, rgba) {
      return { r:0, g:0, b:0, a:255 };
    });
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
      return (this._png.width * y + x) << 2;
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
     */
    forEachPoint: function(fn) {
      for (var x = 0; x < this._png.width; x++) {
        for (var y = 0; y < this._png.height; y++) {

          var rgba = this.getColor(x, y);
          var out = fn(x, y, rgba);

          this.setColor(x, y, (out || rgba));
        }
      }
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
