var Keys = {
  UP: 38,
  DOWN: 40,
  DEL: 46,
  TAB: 9,
  RETURN: 13,
  ENTER: 13,
  ESC: 27,
  COMMA: 188,
  PAGEUP: 33,
  PAGEDOWN: 34,
  SPACE: 32,
  BACKSPACE: 8,
  __isKey: function (e, key) {
    return (e.which || e.keyCode) === this[key];
  },
  isEnter: function (e) {
    return this.__isKey(e, 'ENTER');
  },
  isEsc: function (e) {
    return this.__isKey(e, 'ESC');
  },
  isSpaceBar: function (e) {
    return this.__isKey(e, 'SPACE');
  }
};

export { Keys as default };
