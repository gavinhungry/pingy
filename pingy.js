/**
 * pingy: PNG creation and manipulation helper
 * https://github.com/gavinhungry/pingy
 *
 * Released under the terms of the MIT license
 */

(function() {
  'use strict';

  var PNG = require('pngjs').PNG;
  var _ = require('lodash');

  var pingy = {};

  /**
   * Create a new, blank image
   *
   * @param {Number} width - image width
   * @param {Number} height - image height
   * @return {PNG} PNG object
   */
  pingy.blank = function(width, height) {
    var img = new PNG();
    img.width = width;
    img.height = height;

    img.data = new Buffer(width * height * 4); // rgba

    pingy.each_point(img, function(x, y) {
      pingy.set_rgba(x, y, { r:0, g:0, b:0, a:255 });
    });

    return img;
  };

  /**
   * Get the buffer index of a coordinate
   *
   */
  pingy.get_index = function(img, x, y) {
    return (img.width * y + x) << 2;
  };


  /**
   *
   *
   */
  pingy.each_point = function(img, fn) {
    for (var x = 0; x < img.width; x++) {
      for (var y = 0; y < img.height; y++) {
        fn(x, y);
      }
    }
  };

  /**
   * Get the RGBA value at a coordinate
   *
   *
   *
   *
   *
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
   *
   *
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

  return pingy;
})();