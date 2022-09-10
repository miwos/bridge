(() => {
  // ../osc-js/lib/esm/message-7ce0df39.js
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass)
      _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf2(o2) {
      return o2.__proto__ || Object.getPrototypeOf(o2);
    };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o2, p2) {
      o2.__proto__ = p2;
      return o2;
    };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct)
      return false;
    if (Reflect.construct.sham)
      return false;
    if (typeof Proxy === "function")
      return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null)
        break;
    }
    return object;
  }
  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get2(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base)
          return;
        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }
        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
  function isInt(n) {
    return Number(n) === n && n % 1 === 0;
  }
  function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
  }
  function isNumber(n) {
    return Number(n) === n;
  }
  function isString(n) {
    return typeof n === "string";
  }
  function isBoolean(n) {
    return typeof n === "boolean";
  }
  function isInfinity(n) {
    return n === Infinity;
  }
  function isArray(n) {
    return Object.prototype.toString.call(n) === "[object Array]";
  }
  function isBlob(n) {
    return n instanceof Uint8Array;
  }
  function isUndefined(n) {
    return typeof n === "undefined";
  }
  function isNull(n) {
    return n === null;
  }
  function pad(n) {
    return n + 3 & ~3;
  }
  function hasProperty(name) {
    return Object.prototype.hasOwnProperty.call(typeof global !== "undefined" ? global : window, name);
  }
  function typeTag(item) {
    if (isInt(item)) {
      return "i";
    } else if (isFloat(item)) {
      return "f";
    } else if (isString(item)) {
      return "s";
    } else if (isBlob(item)) {
      return "b";
    } else if (isBoolean(item)) {
      return item ? "T" : "F";
    } else if (isNull(item)) {
      return "N";
    } else if (isInfinity(item)) {
      return "I";
    }
    throw new Error("OSC typeTag() found unknown value type");
  }
  function prepareAddress(obj) {
    var address = "";
    if (isArray(obj)) {
      return "/".concat(obj.join("/"));
    } else if (isString(obj)) {
      address = obj;
      if (address.length > 1 && address[address.length - 1] === "/") {
        address = address.slice(0, address.length - 1);
      }
      if (address.length > 1 && address[0] !== "/") {
        address = "/".concat(address);
      }
      return address;
    }
    throw new Error("OSC prepareAddress() needs addresses of type array or string");
  }
  var EncodeHelper = function() {
    function EncodeHelper2() {
      _classCallCheck(this, EncodeHelper2);
      this.data = [];
      this.byteLength = 0;
    }
    _createClass(EncodeHelper2, [{
      key: "add",
      value: function add(item) {
        if (isBoolean(item) || isInfinity(item) || isNull(item)) {
          return this;
        }
        var buffer = item.pack();
        this.byteLength += buffer.byteLength;
        this.data.push(buffer);
        return this;
      }
    }, {
      key: "merge",
      value: function merge() {
        var result = new Uint8Array(this.byteLength);
        var offset = 0;
        this.data.forEach(function(data) {
          result.set(data, offset);
          offset += data.byteLength;
        });
        return result;
      }
    }]);
    return EncodeHelper2;
  }();
  var Atomic = function() {
    function Atomic2(value) {
      _classCallCheck(this, Atomic2);
      this.value = value;
      this.offset = 0;
    }
    _createClass(Atomic2, [{
      key: "pack",
      value: function pack(method, byteLength) {
        if (!(method && byteLength)) {
          throw new Error("OSC Atomic cant't be packed without given method or byteLength");
        }
        var data = new Uint8Array(byteLength);
        var dataView = new DataView(data.buffer);
        if (isUndefined(this.value)) {
          throw new Error("OSC Atomic cant't be encoded with empty value");
        }
        dataView[method](this.offset, this.value, false);
        return data;
      }
    }, {
      key: "unpack",
      value: function unpack(dataView, method, byteLength) {
        var initialOffset = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
        if (!(dataView && method && byteLength)) {
          throw new Error("OSC Atomic cant't be unpacked without given dataView, method or byteLength");
        }
        if (!(dataView instanceof DataView)) {
          throw new Error("OSC Atomic expects an instance of type DataView");
        }
        this.value = dataView[method](initialOffset, false);
        this.offset = initialOffset + byteLength;
        return this.offset;
      }
    }]);
    return Atomic2;
  }();
  var AtomicInt32 = function(_Atomic) {
    _inherits(AtomicInt322, _Atomic);
    var _super = _createSuper(AtomicInt322);
    function AtomicInt322(value) {
      _classCallCheck(this, AtomicInt322);
      if (value && !isInt(value)) {
        throw new Error("OSC AtomicInt32 constructor expects value of type number");
      }
      return _super.call(this, value);
    }
    _createClass(AtomicInt322, [{
      key: "pack",
      value: function pack() {
        return _get(_getPrototypeOf(AtomicInt322.prototype), "pack", this).call(this, "setInt32", 4);
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        return _get(_getPrototypeOf(AtomicInt322.prototype), "unpack", this).call(this, dataView, "getInt32", 4, initialOffset);
      }
    }]);
    return AtomicInt322;
  }(Atomic);
  var STR_SLICE_SIZE = 65537;
  var STR_ENCODING = "utf-8";
  function charCodesToString(charCodes) {
    if (hasProperty("Buffer")) {
      return Buffer.from(charCodes).toString(STR_ENCODING);
    } else if (hasProperty("TextDecoder")) {
      return new TextDecoder(STR_ENCODING).decode(new Int8Array(charCodes));
    }
    var str = "";
    for (var i = 0; i < charCodes.length; i += STR_SLICE_SIZE) {
      str += String.fromCharCode.apply(null, charCodes.slice(i, i + STR_SLICE_SIZE));
    }
    return str;
  }
  var AtomicString = function(_Atomic) {
    _inherits(AtomicString2, _Atomic);
    var _super = _createSuper(AtomicString2);
    function AtomicString2(value) {
      _classCallCheck(this, AtomicString2);
      if (value && !isString(value)) {
        throw new Error("OSC AtomicString constructor expects value of type string");
      }
      return _super.call(this, value);
    }
    _createClass(AtomicString2, [{
      key: "pack",
      value: function pack() {
        if (isUndefined(this.value)) {
          throw new Error("OSC AtomicString can not be encoded with empty value");
        }
        var terminated = "".concat(this.value, "\0");
        var byteLength = pad(terminated.length);
        var buffer = new Uint8Array(byteLength);
        for (var i = 0; i < terminated.length; i += 1) {
          buffer[i] = terminated.charCodeAt(i);
        }
        return buffer;
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        if (!(dataView instanceof DataView)) {
          throw new Error("OSC AtomicString expects an instance of type DataView");
        }
        var offset = initialOffset;
        var charcode;
        var charCodes = [];
        for (; offset < dataView.byteLength; offset += 1) {
          charcode = dataView.getUint8(offset);
          if (charcode !== 0) {
            charCodes.push(charcode);
          } else {
            offset += 1;
            break;
          }
        }
        if (offset === dataView.length) {
          throw new Error("OSC AtomicString found a malformed OSC string");
        }
        this.offset = pad(offset);
        this.value = charCodesToString(charCodes);
        return this.offset;
      }
    }]);
    return AtomicString2;
  }(Atomic);
  var AtomicBlob = function(_Atomic) {
    _inherits(AtomicBlob2, _Atomic);
    var _super = _createSuper(AtomicBlob2);
    function AtomicBlob2(value) {
      _classCallCheck(this, AtomicBlob2);
      if (value && !isBlob(value)) {
        throw new Error("OSC AtomicBlob constructor expects value of type Uint8Array");
      }
      return _super.call(this, value);
    }
    _createClass(AtomicBlob2, [{
      key: "pack",
      value: function pack() {
        if (isUndefined(this.value)) {
          throw new Error("OSC AtomicBlob can not be encoded with empty value");
        }
        var byteLength = pad(this.value.byteLength);
        var data = new Uint8Array(byteLength + 4);
        var dataView = new DataView(data.buffer);
        dataView.setInt32(0, this.value.byteLength, false);
        data.set(this.value, 4);
        return data;
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        if (!(dataView instanceof DataView)) {
          throw new Error("OSC AtomicBlob expects an instance of type DataView");
        }
        var byteLength = dataView.getInt32(initialOffset, false);
        this.value = new Uint8Array(dataView.buffer, initialOffset + 4, byteLength);
        this.offset = pad(initialOffset + 4 + byteLength);
        return this.offset;
      }
    }]);
    return AtomicBlob2;
  }(Atomic);
  var AtomicFloat32 = function(_Atomic) {
    _inherits(AtomicFloat322, _Atomic);
    var _super = _createSuper(AtomicFloat322);
    function AtomicFloat322(value) {
      _classCallCheck(this, AtomicFloat322);
      if (value && !isNumber(value)) {
        throw new Error("OSC AtomicFloat32 constructor expects value of type float");
      }
      return _super.call(this, value);
    }
    _createClass(AtomicFloat322, [{
      key: "pack",
      value: function pack() {
        return _get(_getPrototypeOf(AtomicFloat322.prototype), "pack", this).call(this, "setFloat32", 4);
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        return _get(_getPrototypeOf(AtomicFloat322.prototype), "unpack", this).call(this, dataView, "getFloat32", 4, initialOffset);
      }
    }]);
    return AtomicFloat322;
  }(Atomic);
  var AtomicFloat64 = function(_Atomic) {
    _inherits(AtomicFloat642, _Atomic);
    var _super = _createSuper(AtomicFloat642);
    function AtomicFloat642(value) {
      _classCallCheck(this, AtomicFloat642);
      if (value && !isNumber(value)) {
        throw new Error("OSC AtomicFloat64 constructor expects value of type float");
      }
      return _super.call(this, value);
    }
    _createClass(AtomicFloat642, [{
      key: "pack",
      value: function pack() {
        return _get(_getPrototypeOf(AtomicFloat642.prototype), "pack", this).call(this, "setFloat64", 8);
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        return _get(_getPrototypeOf(AtomicFloat642.prototype), "unpack", this).call(this, dataView, "getFloat64", 8, initialOffset);
      }
    }]);
    return AtomicFloat642;
  }(Atomic);
  var MAX_INT64 = BigInt("9223372036854775807");
  var MIN_INT64 = BigInt("-9223372036854775808");
  var AtomicInt64 = function(_Atomic) {
    _inherits(AtomicInt642, _Atomic);
    var _super = _createSuper(AtomicInt642);
    function AtomicInt642(value) {
      _classCallCheck(this, AtomicInt642);
      if (value && typeof value !== "bigint") {
        throw new Error("OSC AtomicInt64 constructor expects value of type BigInt");
      }
      if (value && (value < MIN_INT64 || value > MAX_INT64)) {
        throw new Error("OSC AtomicInt64 value is out of bounds");
      }
      var tmp;
      if (value) {
        tmp = BigInt.asIntN(64, value);
      }
      return _super.call(this, tmp);
    }
    _createClass(AtomicInt642, [{
      key: "pack",
      value: function pack() {
        return _get(_getPrototypeOf(AtomicInt642.prototype), "pack", this).call(this, "setBigInt64", 8);
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        return _get(_getPrototypeOf(AtomicInt642.prototype), "unpack", this).call(this, dataView, "getBigInt64", 8, initialOffset);
      }
    }]);
    return AtomicInt642;
  }(Atomic);
  var MAX_UINT64 = BigInt("18446744073709551615");
  var AtomicUInt64 = function(_Atomic) {
    _inherits(AtomicUInt642, _Atomic);
    var _super = _createSuper(AtomicUInt642);
    function AtomicUInt642(value) {
      _classCallCheck(this, AtomicUInt642);
      if (value && typeof value !== "bigint") {
        throw new Error("OSC AtomicUInt64 constructor expects value of type BigInt");
      }
      if (value && (value < 0 || value > MAX_UINT64)) {
        throw new Error("OSC AtomicUInt64 value is out of bounds");
      }
      var tmp;
      if (value) {
        tmp = BigInt.asUintN(64, value);
      }
      return _super.call(this, tmp);
    }
    _createClass(AtomicUInt642, [{
      key: "pack",
      value: function pack() {
        return _get(_getPrototypeOf(AtomicUInt642.prototype), "pack", this).call(this, "setBigUint64", 8);
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        return _get(_getPrototypeOf(AtomicUInt642.prototype), "unpack", this).call(this, dataView, "getBigUint64", 8, initialOffset);
      }
    }]);
    return AtomicUInt642;
  }(Atomic);
  var VALUE_TRUE = true;
  var VALUE_FALSE = false;
  var VALUE_NONE = null;
  var VALUE_INFINITY = Infinity;
  var TypedMessage = function() {
    function TypedMessage2(address, args) {
      var _this = this;
      _classCallCheck(this, TypedMessage2);
      this.offset = 0;
      this.address = "";
      this.types = "";
      this.args = [];
      if (!isUndefined(address)) {
        if (!(isString(address) || isArray(address))) {
          throw new Error("OSC Message constructor first argument (address) must be a string or array");
        }
        this.address = prepareAddress(address);
      }
      if (!isUndefined(args)) {
        if (!isArray(args)) {
          throw new Error("OSC Message constructor second argument (args) must be an array");
        }
        args.forEach(function(item) {
          return _this.add(item.type, item.value);
        });
      }
    }
    _createClass(TypedMessage2, [{
      key: "add",
      value: function add(type, item) {
        if (isUndefined(type)) {
          throw new Error("OSC Message needs a valid OSC Atomic Data Type");
        }
        if (type === "N") {
          this.args.push(VALUE_NONE);
        } else if (type === "T") {
          this.args.push(VALUE_TRUE);
        } else if (type === "F") {
          this.args.push(VALUE_FALSE);
        } else if (type === "I") {
          this.args.push(VALUE_INFINITY);
        } else {
          this.args.push(item);
        }
        this.types += type;
      }
    }, {
      key: "pack",
      value: function pack() {
        var _this2 = this;
        if (this.address.length === 0 || this.address[0] !== "/") {
          throw new Error("OSC Message has an invalid address");
        }
        var encoder = new EncodeHelper();
        encoder.add(new AtomicString(this.address));
        encoder.add(new AtomicString(",".concat(this.types)));
        if (this.args.length > 0) {
          var argument;
          if (this.args.length > this.types.length) {
            throw new Error("OSC Message argument and type tag mismatch");
          }
          this.args.forEach(function(value, index) {
            var type = _this2.types[index];
            if (type === "i") {
              argument = new AtomicInt32(value);
            } else if (type === "h") {
              argument = new AtomicInt64(value);
            } else if (type === "t") {
              argument = new AtomicUInt64(value);
            } else if (type === "f") {
              argument = new AtomicFloat32(value);
            } else if (type === "d") {
              argument = new AtomicFloat64(value);
            } else if (type === "s") {
              argument = new AtomicString(value);
            } else if (type === "b") {
              argument = new AtomicBlob(value);
            } else if (type === "T") {
              argument = VALUE_TRUE;
            } else if (type === "F") {
              argument = VALUE_FALSE;
            } else if (type === "N") {
              argument = VALUE_NONE;
            } else if (type === "I") {
              argument = VALUE_INFINITY;
            } else {
              throw new Error("OSC Message found unknown argument type");
            }
            encoder.add(argument);
          });
        }
        return encoder.merge();
      }
    }, {
      key: "unpack",
      value: function unpack(dataView) {
        var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        if (!(dataView instanceof DataView)) {
          throw new Error("OSC Message expects an instance of type DataView.");
        }
        var address = new AtomicString();
        address.unpack(dataView, initialOffset);
        var types = new AtomicString();
        types.unpack(dataView, address.offset);
        if (address.value.length === 0 || address.value[0] !== "/") {
          throw new Error("OSC Message found malformed or missing address string");
        }
        if (types.value.length === 0 && types.value[0] !== ",") {
          throw new Error("OSC Message found malformed or missing type string");
        }
        var offset = types.offset;
        var next;
        var type;
        var args = [];
        for (var i = 1; i < types.value.length; i += 1) {
          type = types.value[i];
          next = null;
          if (type === "i") {
            next = new AtomicInt32();
          } else if (type === "h") {
            next = new AtomicInt64();
          } else if (type === "t") {
            next = new AtomicUInt64();
          } else if (type === "f") {
            next = new AtomicFloat32();
          } else if (type === "d") {
            next = new AtomicFloat64();
          } else if (type === "s") {
            next = new AtomicString();
          } else if (type === "b") {
            next = new AtomicBlob();
          } else if (type === "T") {
            args.push(VALUE_TRUE);
          } else if (type === "F") {
            args.push(VALUE_FALSE);
          } else if (type === "N") {
            args.push(VALUE_NONE);
          } else if (type === "I") {
            args.push(VALUE_INFINITY);
          } else {
            throw new Error("OSC Message found unsupported argument type");
          }
          if (next) {
            offset = next.unpack(dataView, offset);
            args.push(next.value);
          }
        }
        this.offset = offset;
        this.address = address.value;
        this.types = types.value;
        this.args = args;
        return this.offset;
      }
    }]);
    return TypedMessage2;
  }();
  var Message = function(_TypedMessage) {
    _inherits(Message2, _TypedMessage);
    var _super = _createSuper(Message2);
    function Message2() {
      var _this3;
      _classCallCheck(this, Message2);
      var address;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length > 0) {
        address = args.shift();
      }
      var oscArgs;
      if (args.length > 0) {
        if (args[0] instanceof Array) {
          oscArgs = args.shift();
        }
      }
      _this3 = _super.call(this, address, oscArgs);
      if (args.length > 0) {
        _this3.types = args.map(function(item) {
          return typeTag(item);
        }).join("");
        _this3.args = args;
      }
      return _this3;
    }
    _createClass(Message2, [{
      key: "add",
      value: function add(item) {
        _get(_getPrototypeOf(Message2.prototype), "add", this).call(this, typeTag(item), item);
      }
    }]);
    return Message2;
  }(TypedMessage);

  // src/index.ts
  console.log(Message);
})();
