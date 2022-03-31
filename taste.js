
function default_test_result(type, name, message) {
  Reset = "\x1b[0m"; Bright = "\x1b[1m"; Dim = "\x1b[2m"; Underscore = "\x1b[4m"; Blink = "\x1b[5m"; Reverse = "\x1b[7m"; Hidden = "\x1b[8m";
  FgBlack = "\x1b[30m"; FgRed = "\x1b[31m"; FgGreen = "\x1b[32m"; FgYellow = "\x1b[33m"; FgBlue = "\x1b[34m"; FgMagenta = "\x1b[35m"; FgCyan = "\x1b[36m"; FgWhite = "\x1b[37m";
  BgBlack = "\x1b[40m"; BgRed = "\x1b[41m"; BgGreen = "\x1b[42m"; BgYellow = "\x1b[43m"; BgBlue = "\x1b[44m"; BgMagenta = "\x1b[45m"; BgCyan = "\x1b[46m"; BgWhite = "\x1b[47m";

  switch(type) {
    case 'fail':  console.log(`${BgRed}${FgBlack}${name} : FAIL${Reset}\n${message}`); break;
    case 'pass':  console.log(`${FgGreen}${name} : OK${Reset}`); break;
    case 'debug': console.log(`:debug: ${message}`); break;
    case 'group': console.log(`\n${Underscore}===== [${name}] =====${Reset}`); break;
  }
}


async function describe(name, descFn) {
  Taste.testResultFn && Taste.testResultFn('group', name, '');
  await descFn.call();
}

function it(name, testFn) {
  if(!testFn) return;

  testFn.call(this, 
    function pass(res) {
      Taste.testResultFn && Taste.testResultFn('pass', name, 'OK');
    }, 
    function fail(e) {
      Taste.testResultFn && Taste.testResultFn('fail', name, ((e&&e.message)||e));
    });
}


function mock(Obj, mockObj) {
  const mocked = Object.assign({}, Obj);
  Object.assign(Obj, mockObj);
  const mockApi = {
    mockedObj: mocked,
    unmock: function() { Object.assign(Obj, mocked); } //  this.mockedObj); }
  };
  return mockApi;
}

function stub(obj, methodName, stubFn) {
    var originalMethod = obj[methodName];
    stubFn.originalMethod = originalMethod;
    obj[methodName] = stubFn;
    const stubApi = {
      unstub: function() {
        obj[methodName] = originalMethod;
      }
    };
  return stubApi;
}

function cmp(a,b) {
  // console.log(`Comparing ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
  if(Array.isArray(a)) {
    if(Array.isArray(b) && a.length == b.length) {
      for(var i=0; i<a.length; i++) { if(!cmp(a[i], b[i])) return false; }
      return true;
    }
    else {
      return false;
    }
  }
  else {
    return a === b;
  }
}

function assert(a, b, pass, fail) {
  if(!pass) pass = assert.caller.arguments[0];
  if(!fail) fail = assert.caller.arguments[1];

  if(cmp(a, b)) {
    pass(true);
  }
  else {
    fail(`expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`);
  }
}

function assert_reject(prom, pass, fail) {
  pass = pass || assert_reject.caller.arguments[0];
  fail = fail || assert_reject.caller.arguments[1];
  prom.then(res => fail(res));
  prom.catch(err => pass(err));
}

function assert_resolve(prom, pass, fail) {
  pass = pass || assert_resolve.caller.arguments[0];
  fail = fail || assert_resolve.caller.arguments[1];
  prom.then(res => pass(res));
  prom.catch(err => fail(err));
}

function failed(err, cb) {
  if(!cb) cb = failed.caller.arguments[1];
  cb(err);
}

function passed(res, cb) {
  if(!cb) cb = passed.caller.arguments[0];
  cb(res);
}


function expect(x, pass, fail) {
  // const pass = expect.caller.arguments[0];
  // const fail = expect.caller.arguments[1];
  pass = pass || expect.caller.arguments[0];
  fail = fail || expect.caller.arguments[1];

  if(x != null && typeof x == 'object' && typeof x.then == 'function') {
    // magically find the callback of the 'it' function's closure

    return {
      to_resolve: () => {
        x.then((res) => { passed(res, pass); });
        x.catch((e) => { failed(e.message, fail); });
      },
      to_resolve_with: (z) => {
        x.then((res) => { assert(res, z, pass, fail); });
        x.catch((e) => { failed(e.message, fail); });
      },
      to_reject: () => {
        x.then((res) => { console.log(x); failed("", fail); });
        x.catch((e) => { passed("", pass); });
      },
      to_reject_with: (e) => {
        x.then((res) => { failed("", fail); });
        x.catch((err) => { assert(e, err, pass, fail); });
      }
    };
  }

  const baseAPI = {
    value: x,
    to_equal: y => assert(x,y, pass, fail),
    eql: y => assert(x,y, pass, fail),
    to_be_null: () => assert(x === null, true, pass, fail),
    to_be_defined: () => assert(x !== undefined, true, pass, fail),
    to_be_falsy: () => assert(x === 0 || x === null || x === undefined || x == "" || x == {}, true, pass, fail),
    to_be_truthy: () => assert(x === 0 || x === null || x === undefined || x == "" || x == {}, false, pass, fail)
  };

  if(typeof x == 'number') return Object.assign(baseAPI, {
    to_be_greater_than: y => assert(x > y, true, pass, fail),
    to_be_lesser_than: y => assert(x > y, true, pass, fail),
    to_be_between: (y,z) => assert(x>y && x<z, true, pass, fail),
    gt: y => assert(x > y, true, pass, fail),
    gte: y => assert(x >= y, true, pass, fail),
    lt: y => assert(x < y, true, pass, fail),
    lte: y => assert(x <= y, true, pass, fail),
  });

  if(typeof x == 'string') return Object.assign(baseAPI, {
    same_length_as: (s) => assert(x.length, s.length, pass, fail),
    // to_contain: (s) => ...
    // to_begin_with: (s) => ...
    // to_end_with: (s) => ...
    // to_match: (regex) => ...
  });

  if(Array.isArray(x)) return Object.assign(baseAPI, {
    to_have_value: (y) => assert(x.find(y) !== undefined, true, pass, fail)
  });


  if(typeof x == 'object') return Object.assign(baseAPI, {
    to_have_property: (y) => assert(Object.keys(x).find(y) !== undefined, true, pass, fail)
  });

  return baseAPI;
}

const Taste = {
  testResultFn: default_test_result,
  onTestResult(fn) { testResultFn = fn; },
  describe: describe,
  it: it,
  expect: expect,
  assert: assert,
  assert_resolve: assert_resolve,
  assert_reject: assert_reject,
  stub: stub,
  mock: mock
};

module.exports.default = Taste;
module.exports = { describe, it, stub, mock, expect, assert, assert_resolve, assert_reject, Taste };

