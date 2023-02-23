'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var immer = require('immer');
var withSelector = require('use-sync-external-store/shim/with-selector');

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
var shallowEqual = function shallowEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (_typeof(a) !== 'object' || !a || _typeof(b) !== 'object' || !b) {
    return false;
  }
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = hasOwnProperty.bind(b);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key) || !Object.is(a[key], b[key])) {
      return false;
    }
  }
  return true;
};
var arrayShallowEqual = function arrayShallowEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (var idx = 0; idx < a.length; idx++) {
    if (!shallowEqual(a[idx], b[idx])) {
      return false;
    }
  }
  return true;
};

var createStore = function createStore(initialState) {
  var STATE = initialState;
  var listeners = new Set();
  var getters = new Map();
  var subscribe = function subscribe(listener) {
    listeners.add(listener);
    return function () {
      return listeners["delete"](listener);
    };
  };
  var dispatch = function dispatch(recipeOrPartial) {
    STATE = immer.produce(STATE, function (draft) {
      if (typeof recipeOrPartial === 'function') {
        recipeOrPartial(draft);
      }
      Object.assign(draft, recipeOrPartial);
    });
    // ;[...listeners].forEach((sub) => sub())
    listeners.forEach(function (sub) {
      return sub();
    });
  };
  var selectorImplement = function selectorImplement(selectors) {
    if (!(selectors !== null && selectors !== void 0 && selectors.length)) return [STATE];
    return selectors.map(function (sel) {
      if (typeof sel === 'function') {
        return sel(STATE);
      }
      if (typeof sel === 'string') {
        var finder = getters.get(sel);
        if (!finder) {
          finder = new Function('o', "return o[\"".concat(sel.split('.').join('"]["'), "\"];"));
          getters.set(sel, finder);
        }
        return finder(STATE);
      }
      return null;
    });
  };
  function get() {
    for (var _len = arguments.length, selector = new Array(_len), _key = 0; _key < _len; _key++) {
      selector[_key] = arguments[_key];
    }
    return selectorImplement(selector);
  }
  function replace(nextStateOrReplaceRecipe) {
    if (typeof nextStateOrReplaceRecipe === 'function') {
      STATE = immer.produce(STATE, nextStateOrReplaceRecipe);
    } else {
      STATE = nextStateOrReplaceRecipe;
    }
  }
  return {
    subscribe: subscribe,
    getSnapshot: function getSnapshot() {
      return STATE;
    },
    dispatch: dispatch,
    selectorImplement: selectorImplement,
    get: get,
    replace: replace
  };
};
function createImmerExternalStore(initialState) {
  var _createStore = createStore(initialState),
    subscribe = _createStore.subscribe,
    getSnapshot = _createStore.getSnapshot,
    selectorImplement = _createStore.selectorImplement,
    dispatch = _createStore.dispatch,
    get = _createStore.get,
    replace = _createStore.replace;
  function useState() {
    for (var _len2 = arguments.length, selectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      selectors[_key2] = arguments[_key2];
    }
    var local = withSelector.useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, function () {
      return selectorImplement(selectors);
    }, arrayShallowEqual);
    return [].concat(_toConsumableArray(local), [dispatch]);
  }
  return {
    useState: useState,
    dispatch: dispatch,
    get: get,
    replace: replace
  };
}

exports.createImmerExternalStore = createImmerExternalStore;
exports.default = createImmerExternalStore;
