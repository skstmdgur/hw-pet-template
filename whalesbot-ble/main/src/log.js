//export default minilog(HW_ID)

var newlines = /\n+$/;
var logger = function () {};
logger.enabled = true;

logger.write = function (name, level, args) {
  if (!logger.enabled) {
    return;
  }

  var i = args.length - 1;
  if (typeof console === 'undefined' || !console.log) {
    return;
  }
  if (console.log.apply) {
    return console.log.apply(console, [name, level].concat(args));
  } else if (JSON && JSON.stringify) {
    // console.log.apply is undefined in IE8 and IE9
    // for IE8/9: make console.log at least a bit less awful
    if (args[i] && typeof args[i] == 'string') {
      args[i] = args[i].replace(newlines, '');
    }
    try {
      for (i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
    } catch (e) {}
    console.log(args.join(' '));
  }
};

const slice = Array.prototype.slice;

exports = module.exports = function create(name) {
  var o = function () {
    logger.write(name, undefined, slice.call(arguments));
    return o;
  };
  o.debug = function () {
    logger.write(name, 'debug', slice.call(arguments));
    return o;
  };
  o.info = function () {
    logger.write(name, 'info', slice.call(arguments));
    return o;
  };
  o.warn = function () {
    logger.write(name, 'warn', slice.call(arguments));
    return o;
  };
  o.error = function () {
    logger.write(name, 'error', slice.call(arguments));
    return o;
  };
  o.log = o.debug;
  o.enable = function (value) {
    logger.enabled = value;
    return o;
  };
  return o;
};
