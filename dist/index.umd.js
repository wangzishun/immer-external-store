!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("immer"),require("use-sync-external-store/shim/with-selector")):"function"==typeof define&&define.amd?define(["exports","immer","use-sync-external-store/shim/with-selector"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).ReactEventContext={},e.Immer,e.withSelector)}(this,(function(e,t,n){"use strict";function r(e){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}var o=Object.prototype.hasOwnProperty,u=function(e,t){if(Object.is(e,t))return!0;if("object"!==r(e)||!e||"object"!==r(t)||!t)return!1;var n=Object.keys(e),u=Object.keys(t);if(n.length!==u.length)return!1;for(var c=o.bind(t),i=0;i<n.length;i++){var f=n[i];if(!c(f)||!Object.is(e[f],t[f]))return!1}return!0},c=function(e){var n=e,r=new Set,o=new Map;return{subscribe:function(e){return r.add(e),function(){return r.delete(e)}},getSnapshot:function(){return n},dispatch:function(e){var o=t.produce(n,(function(t){e(t)}));n=o,r.forEach((function(e){return e()}))},selector:function(e){return null!=e&&e.length?null===e[0]?null:"function"==typeof e[0]?e[0](n):e.length?e.map((function(e){var t=o.get(e);return t||(t=new Function("o","return o.".concat(e.replace(/.(\d+)./,"[$1]."),";")),o.set(e,t)),t(n)})):n:n}}};e.createImmerStore=function(e){var t=c(e);return{useConsumer:function(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];var c=n.useSyncExternalStoreWithSelector(t.subscribe,t.getSnapshot,t.getSnapshot,(function(e){return t.selector(r)}),u);return null===r[0]?[t.dispatch]:[c,t.dispatch]}}}}));
