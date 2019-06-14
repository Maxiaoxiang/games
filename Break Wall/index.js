(function(){
  // requestAnimationFrame polyfill
  Date.now = !Date.now && function () {
    return new Date().getTime();
  };
  (function () {
    'use strict';
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
      ||
      !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
            callback(lastTime = nextTime);
          },
          nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
  }());

  //工具方法
  let util = {
    detectCollision(rect, circle) {
      let cx, cy;

      if (circle.x < rect.x) {
        cx = rect.x;
      } else if (circle.x > rect.x + rect.width) {
        cx = rect.x + rect.width;
      } else {
        cx = circle.x;
      }

      if (circle.y < rect.y) {
        cy = rect.y;
      } else if (circle.y > rect.y + rect.height) {
        cy = rect.y + rect.height;
      } else {
        cy = circle.y;
      }

      if (this.distance(circle.x, circle.y, cx, cy) < circle.radius) {
        return true;
      }

      return false;
    },
    distance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
  };
});