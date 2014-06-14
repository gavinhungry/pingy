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
  var _ = require('lodash');

  var pingy = module.exports;

  /**
   * Create a new, blank image
   *
   * @param {Number} width - image width
   * @param {Number} height - image height
   * @return {PNG} PNG object
   */
  pingy.create = function(width, height) {
    var img = new PNG();
    img.width = width;
    img.height = height;

    img.data = new Buffer(width * height * 4, 'utf8'); // rgba

    pingy.each_point(img, function(x, y, rgba) {
      return { r:0, g:255, b:0, a:255 };
    });

    return img;
  };

  /**
   * Get the buffer index of a coordinate
   *
   * @param {PNG} img - input image
   * @param {Number} x - x coordinate
   * @param {Number} x - x coordinate
   * @return {Number} index of coordinate in image buffer
   */
  pingy.get_index = function(img, x, y) {
    return (img.width * y + x) << 2;
  };

  /**
   * Execute a function on each point in an image
   *
   * The rgba object passed to the callback will be saved back to the image,
   * so no need to call `set_rgba` there
   *
   * If the callback returns an object, it will be used as the new rgba value
   *
   * @param {PNG} img - input image
   * @param {Function} fn - Function(x, y, rgba) to execute
   */
  pingy.each_point = function(img, fn) {
    for (var x = 0; x < img.width; x++) {
      for (var y = 0; y < img.height; y++) {
        var rgba = pingy.get_rgba(img, x, y);
        var out = fn(x, y, rgba);

        pingy.set_rgba(img, x, y, (out || rgba));
      }
    }
  };

  /**
   * Get the RGBA value at a coordinate
   *
   * @param {PNG} img - input image
   * @param {Number} x - x coordinate
   * @param {Number} x - x coordinate
   * @return {Object} rgba value
   */
  pingy.get_rgba = function(img, x, y) {
    var i = pingy.get_index(img, x, y);

    return {
      r: img.data[i],
      g: img.data[i + 1],
      b: img.data[i + 2],
      a: img.data[i + 3]
    };
  };

  /**
   * Set the RGBA value at a coordinate
   *
   * @param {PNG} img - input image
   * @param {Number} x - x coordinate
   * @param {Number} x - x coordinate
   * @param {Object} rgba - rgba value
   * @return {Object} rgba value
   */
  pingy.set_rgba = function(img, x, y, rgba) {
    var i = pingy.get_index(img, x, y);

    var prev = pingy.get_rgba(img, x, y);

    img.data[i] = _.isNumber(rgba.r) ? rgba.r : prev.r;
    img.data[i + 1] = _.isNumber(rgba.g) ? rgba.g : prev.g;
    img.data[i + 2] = _.isNumber(rgba.b) ? rgba.b : prev.b;
    img.data[i + 3] = _.isNumber(rgba.a) ? rgba.a : prev.a;

    return pingy.get_rgba(img, x, y);
  };

  /**
   * Get the base64 encoding of an image
   *
   * @param {PNG} img - input image
   * @param {Function} fn - callback
   */
  pingy.to_base64 = function(img, fn) {
    var buffers = [];

    var stream = new Stream();
    stream.readable = stream.writable = true;
    stream.write = function(data) {
      buffers.push(data);
    }

    stream.end = function() {
      fn(Buffer.concat(buffers).toString('base64'));
    }

    img.pack().pipe(stream);
  };

  /**
   * Get the base64 encoding of an image as a data URI
   *
   * @param {PNG} img - input image
   * @param {Function} fn - callback
   */
  pingy.to_base64_uri = function(img, fn) {
    return pingy.to_base64(img, function(base64) {
      fn('data:image/png;base64,' + base64);
    });
  };

})();